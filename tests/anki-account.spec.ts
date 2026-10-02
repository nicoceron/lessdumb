import { expect, test, type Page } from '@playwright/test';
import {
  createState,
  type LearnerState,
  type QueuedCard,
} from '../src/lib/state';
import { skillById } from '../src/lib/curriculum';
import { ankiCardTag } from '../src/lib/anki';
import { signUp } from './helpers/accounts';

const baseURL = process.env.LESSDUMB_E2E_URL ?? 'http://127.0.0.1:4321';
const password = 'testing-anki-races-123';
test.use({ baseURL });

function gate() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

function queuedCard(skillId: string): QueuedCard {
  const skill = skillById[skillId];
  return {
    ...skill.flashcards[0],
    skillName: skill.title,
    kind: 'mastery',
    status: 'pending',
  };
}

async function account(page: Page, label: string, cards: QueuedCard[]) {
  const name = `Anki ${label}`;
  const email = `anki-${label.toLowerCase().replaceAll(' ', '-')}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`;
  const registered = await signUp(page.request, baseURL, {
    name,
    email,
    password,
  });
  expect(registered.status()).toBe(200);
  const id = (await registered.json()).user.id as string;
  const state = createState();
  state.cards = cards;
  const seeded = await page.request.put(`${baseURL}/api/state`, {
    headers: { origin: baseURL, 'X-Lessdumb-User': id },
    data: { state, revision: 0 },
  });
  expect(seeded.status()).toBe(200);
  return { id, name, email };
}

async function signInInitially(page: Page, email: string) {
  const response = await page.request.post(
    `${baseURL}/api/auth/sign-in/email`,
    {
      headers: { origin: baseURL },
      data: { email, password },
    },
  );
  expect(response.status()).toBe(200);
}

async function switchAccount(
  page: Page,
  next: { name: string; email: string },
) {
  const currentDocument = await page.evaluate(() => performance.timeOrigin);
  // Shared cookies can change in another tab while this document's Anki
  // requests remain pending. Keep it alive to exercise its generation guards.
  await signInInitially(page, next.email);
  await page.getByRole('button', { name: 'Retry progress sync' }).click();
  await expect(page.locator('.account-name')).toHaveText(next.name);
  await expect(
    page.getByRole('button', { name: 'Connect Anki', exact: true }),
  ).toBeEnabled();
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(
    currentDocument,
  );
}

async function localState(
  page: Page,
  owner: string,
): Promise<LearnerState | null> {
  return page.evaluate(
    (id) =>
      JSON.parse(localStorage.getItem(`lessdumb.account.${id}`) ?? 'null'),
    owner,
  );
}

type AnkiCall = { action: string; params: Record<string, any> };
async function mockAnki(
  page: Page,
  hooks: {
    permission?: (index: number) => Promise<void>;
    find?: (query: string) => Promise<void>;
  } = {},
) {
  const calls: AnkiCall[] = [];
  const profile = { active: 'Test Anki profile' };
  const notes = new Map<
    number,
    {
      noteId: number;
      profile: string;
      deckName: string;
      modelName: string;
      fields: Record<string, { value: string; order: number }>;
      tags: string[];
    }
  >();
  let permissionCount = 0;
  let nextId = 10_000;
  await page.route('http://127.0.0.1:8765/**', async (route) => {
    const headers = {
      'Access-Control-Allow-Origin': baseURL,
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Private-Network': 'true',
    };
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers });
      return;
    }
    const request = route.request().postDataJSON() as AnkiCall;
    calls.push(request);
    let result: unknown = null;
    switch (request.action) {
      case 'requestPermission':
        await hooks.permission?.(++permissionCount);
        result = { permission: 'granted', requireApikey: false, version: 6 };
        break;
      case 'version':
        result = 6;
        break;
      case 'getProfiles':
        result = ['Test Anki profile', 'Another Anki profile'];
        break;
      case 'getActiveProfile':
        result = profile.active;
        break;
      case 'deckNames':
        result = ['Default'];
        break;
      case 'createDeck':
        result = 1;
        break;
      case 'modelNames':
        result = ['lessdumb'];
        break;
      case 'modelFieldNames':
        result = ['Front', 'Back', 'Skill'];
        break;
      case 'findNotes':
        await hooks.find?.(request.params.query);
        result = [...notes.values()]
          .filter(
            (note) =>
              note.profile === profile.active &&
              note.tags.includes(request.params.query.replace(/^tag:/, '')),
          )
          .map((note) => note.noteId);
        break;
      case 'addNote': {
        const note = request.params.note;
        const id = nextId++;
        notes.set(id, {
          noteId: id,
          profile: profile.active,
          deckName: note.deckName,
          modelName: note.modelName,
          fields: Object.fromEntries(
            Object.entries(note.fields).map(([name, value], order) => [
              name,
              { value: value as string, order },
            ]),
          ),
          tags: note.tags,
        });
        result = id;
        break;
      }
      case 'notesInfo':
        result = request.params.notes.map((id: number) => notes.get(id));
        break;
      default:
        throw new Error(`Unexpected Anki action ${request.action}`);
    }
    await route.fulfill({
      status: 200,
      headers,
      contentType: 'application/json',
      body: JSON.stringify({ result, error: null }),
    });
  });
  return { calls, notes, profile };
}

test('a delayed Anki connection cannot activate after the learner changes accounts', async ({
  page,
}) => {
  const first = await account(page, 'Delayed first', []);
  const secondCard = queuedCard('variables');
  const second = await account(page, 'Delayed second', [secondCard]);
  await signInInitially(page, first.email);
  const permission = gate();
  const server = await mockAnki(page, {
    permission: (index) =>
      index === 1 ? permission.promise : Promise.resolve(),
  });
  await page.goto('/settings');
  await expect(page.locator('.account-name')).toHaveText(first.name);
  await page.getByRole('button', { name: 'Connect Anki', exact: true }).click();
  await expect
    .poll(
      () =>
        server.calls.filter((call) => call.action === 'requestPermission')
          .length,
    )
    .toBe(1);
  await switchAccount(page, second);
  await expect
    .poll(async () =>
      (await localState(page, second.id))?.cards.map((card) => card.id),
    )
    .toEqual([secondCard.id]);

  const connectCompleted = page.waitForResponse(
    (response) =>
      response.url().startsWith('http://127.0.0.1:8765') &&
      response.request().postDataJSON()?.action === 'deckNames',
  );
  permission.release();
  await connectCompleted;
  await expect(
    page.getByRole('button', { name: 'Connect Anki', exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole('button', { name: 'Disconnect', exact: true }),
  ).toHaveCount(0);
  await expect
    .poll(async () => (await localState(page, second.id))?.anki.connected)
    .toBe(false);
  await page.waitForTimeout(200); // Let the stale connection's awaited continuation finish.
  expect(
    server.calls.some((call) =>
      ['createDeck', 'createModel', 'findNotes', 'addNote'].includes(
        call.action,
      ),
    ),
  ).toBe(false);
  expect((await localState(page, second.id))?.cards[0].status).toBe('pending');
});

test('the new account flush starts while the old account flush is delayed and keeps its own results', async ({
  page,
}) => {
  const firstCard = queuedCard('print-output');
  const secondCard = queuedCard('variables');
  const first = await account(page, 'Flush first', [firstCard]);
  const second = await account(page, 'Flush second', [secondCard]);
  await signInInitially(page, first.email);
  const firstFind = gate();
  const secondFind = gate();
  const firstQuery = `tag:${ankiCardTag(firstCard.id)}`;
  const secondQuery = `tag:${ankiCardTag(secondCard.id)}`;
  const server = await mockAnki(page, {
    find: (query) =>
      query === firstQuery
        ? firstFind.promise
        : query === secondQuery
          ? secondFind.promise
          : Promise.resolve(),
  });
  await page.goto('/settings');
  await expect(page.locator('.account-name')).toHaveText(first.name);
  await page.getByRole('button', { name: 'Connect Anki', exact: true }).click();
  await expect
    .poll(() =>
      server.calls.some(
        (call) =>
          call.action === 'findNotes' && call.params.query === firstQuery,
      ),
    )
    .toBe(true);

  await switchAccount(page, second);
  await expect
    .poll(async () =>
      (await localState(page, second.id))?.cards.map((card) => card.id),
    )
    .toEqual([secondCard.id]);
  await page.getByRole('button', { name: 'Connect Anki', exact: true }).click();
  // The old request is still held: a shared stale busy flag would strand this flush.
  await expect
    .poll(() =>
      server.calls.some(
        (call) =>
          call.action === 'findNotes' && call.params.query === secondQuery,
      ),
    )
    .toBe(true);
  firstFind.release();
  await expect
    .poll(() =>
      server.calls.some(
        (call) =>
          call.action === 'addNote' &&
          call.params.note.tags.includes(ankiCardTag(firstCard.id)),
      ),
    )
    .toBe(true);
  expect((await localState(page, second.id))?.cards[0].status).toBe('pending');
  secondFind.release();
  await expect
    .poll(async () => (await localState(page, second.id))?.cards[0].status)
    .toBe('synced');
  const final = await localState(page, second.id);
  expect(final?.cards.map((card) => card.id)).toEqual([secondCard.id]);
  expect(final?.anki.profile).toBe('Test Anki profile');
  const secondNote = [...server.notes.values()].find((note) =>
    note.tags.includes(ankiCardTag(secondCard.id)),
  );
  expect(final?.cards[0].noteId).toBe(secondNote?.noteId);
  expect((await localState(page, first.id))?.cards[0].status).toBe('pending');
});

test('changing Anki profiles resends saved cards to the selected deck while same-profile reconnects remain idempotent', async ({
  page,
}) => {
  const card = queuedCard('print-output');
  const owner = await account(page, 'Profile reconnect', [card]);
  const secondFind = gate();
  let holdSecondProfile = false;
  const server = await mockAnki(page, {
    find: () => (holdSecondProfile ? secondFind.promise : Promise.resolve()),
  });
  await page.goto('/settings');
  await expect(page.locator('.account-name')).toHaveText(owner.name);
  await page.getByRole('button', { name: 'Connect Anki', exact: true }).click();
  await expect
    .poll(async () => (await localState(page, owner.id))?.cards[0].status)
    .toBe('synced');
  await expect(
    page.getByRole('button', { name: 'Connect Anki', exact: true }),
  ).toBeEnabled();
  const firstNoteId = (await localState(page, owner.id))!.cards[0].noteId;
  expect(server.notes.size).toBe(1);

  await page.getByRole('button', { name: 'Connect Anki', exact: true }).click();
  await expect(
    page.getByText(
      'Connected to “Test Anki profile”. New cards will sync automatically.',
      { exact: true },
    ),
  ).toBeVisible();
  await page.waitForTimeout(150);
  expect((await localState(page, owner.id))?.cards[0]).toMatchObject({
    status: 'synced',
    noteId: firstNoteId,
  });
  expect(server.calls.filter((call) => call.action === 'addNote')).toHaveLength(
    1,
  );

  const newDeck = 'lessdumb::Second profile';
  await page.getByLabel('Anki deck', { exact: true }).fill(newDeck);
  await page.getByLabel('Anki deck', { exact: true }).press('Tab');
  await expect
    .poll(async () => (await localState(page, owner.id))?.anki.deck)
    .toBe(newDeck);
  server.profile.active = 'Another Anki profile';
  holdSecondProfile = true;
  const originalFindCount = server.calls.filter(
    (call) => call.action === 'findNotes',
  ).length;
  await page.getByRole('button', { name: 'Connect Anki', exact: true }).click();
  await expect
    .poll(
      () => server.calls.filter((call) => call.action === 'findNotes').length,
    )
    .toBe(originalFindCount + 1);
  const waiting = await localState(page, owner.id);
  expect(waiting?.anki.profile).toBe('Another Anki profile');
  expect(waiting?.cards[0].status).toBe('pending');
  expect(waiting?.cards[0].noteId).toBeUndefined();

  holdSecondProfile = false;
  secondFind.release();
  await expect
    .poll(async () => (await localState(page, owner.id))?.cards[0].status)
    .toBe('synced');
  const secondNoteId = (await localState(page, owner.id))!.cards[0].noteId;
  expect(secondNoteId).not.toBe(firstNoteId);
  expect(server.notes.get(secondNoteId!)).toMatchObject({
    profile: 'Another Anki profile',
    deckName: newDeck,
  });
  expect(server.notes.size).toBe(2);
  await expect(
    page.getByRole('button', { name: 'Connect Anki', exact: true }),
  ).toBeEnabled();

  await page.getByRole('button', { name: 'Connect Anki', exact: true }).click();
  await expect(
    page.getByText(
      'Connected to “Another Anki profile”. New cards will sync automatically.',
      { exact: true },
    ),
  ).toBeVisible();
  await page.waitForTimeout(150);
  expect(server.calls.filter((call) => call.action === 'addNote')).toHaveLength(
    2,
  );
  expect((await localState(page, owner.id))?.cards[0]).toMatchObject({
    status: 'synced',
    noteId: secondNoteId,
  });
});
