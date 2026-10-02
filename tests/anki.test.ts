import { describe, expect, it } from 'vitest';
import {
  ANKI_DECK,
  ANKI_ENDPOINT,
  ANKI_MODEL,
  AnkiConnectError,
  ankiCardTag,
  createAnkiClient,
  exportCardsTsv,
  type AnkiCard,
} from '../src/lib/anki';

type Call = {
  action: string;
  version: number;
  params: Record<string, any>;
  key?: string;
};
type FakeNote = {
  noteId: number;
  modelName: string;
  fields: Record<string, { value: string; order: number }>;
  tags: string[];
};

function fakeAnki() {
  const calls: Call[] = [];
  const notes = new Map<number, FakeNote>();
  const state = {
    profile: 'My learning profile',
    profiles: ['My learning profile'],
    decks: ['Default'],
    models: [] as string[],
    modelFields: ['Front', 'Back', 'Skill'],
    granted: true,
    requireApiKey: false,
    permissionKeyField: 'requireApikey' as 'requireApiKey' | 'requireApikey',
    apiVersion: 6,
    supportsActiveProfile: true,
    blockUpdates: false,
    nextNoteId: 1000,
    networkFailure: '',
    lostAddResponse: false,
  };
  const fetcher: typeof fetch = async (input, init) => {
    expect(input).toBe(ANKI_ENDPOINT);
    expect(init?.credentials).toBe('omit');
    expect(init?.redirect).toBe('error');
    expect(init?.headers).toEqual({
      'Content-Type': 'text/plain;charset=UTF-8',
    });
    const call: Call = JSON.parse(String(init?.body));
    calls.push(call);
    expect(call.version).toBe(6);
    if (state.networkFailure === call.action) {
      state.networkFailure = '';
      throw new TypeError('Network request failed');
    }
    let result: unknown = null;
    let error: string | null = null;
    switch (call.action) {
      case 'requestPermission':
        result = {
          permission: state.granted ? 'granted' : 'denied',
          [state.permissionKeyField]: state.requireApiKey,
          version: state.apiVersion,
        };
        break;
      case 'version':
        result = state.apiVersion;
        break;
      case 'getProfiles':
        result = [...state.profiles];
        break;
      case 'getActiveProfile':
        if (state.supportsActiveProfile) result = state.profile;
        else error = 'unsupported action';
        break;
      case 'deckNames':
        result = [...state.decks];
        break;
      case 'createDeck':
        if (!state.decks.includes(call.params.deck))
          state.decks.push(call.params.deck);
        result = 1;
        break;
      case 'modelNames':
        result = [...state.models];
        break;
      case 'createModel':
        state.models.push(call.params.modelName);
        result = { name: call.params.modelName };
        break;
      case 'modelFieldNames':
        result = [...state.modelFields];
        break;
      case 'findNotes':
        result = [...notes.values()]
          .filter((note) =>
            note.tags.includes(call.params.query.replace(/^tag:/, '')),
          )
          .map((note) => note.noteId);
        break;
      case 'addNote': {
        const note = call.params.note;
        if (
          [...notes.values()].some(
            (existing) => existing.fields.Front.value === note.fields.Front,
          ) &&
          !note.options.allowDuplicate
        ) {
          error = 'cannot create note because it is a duplicate';
          break;
        }
        result = state.nextNoteId++;
        notes.set(result as number, {
          noteId: result as number,
          modelName: note.modelName,
          fields: Object.fromEntries(
            Object.entries(note.fields).map(([name, value], order) => [
              name,
              { value: value as string, order },
            ]),
          ),
          tags: [...note.tags],
        });
        if (state.lostAddResponse) {
          state.lostAddResponse = false;
          throw new TypeError('Response lost after save');
        }
        break;
      }
      case 'notesInfo':
        result = call.params.notes.map((id: number) =>
          structuredClone(notes.get(id)),
        );
        break;
      case 'updateNoteFields': {
        if (!state.blockUpdates) {
          const note = notes.get(call.params.note.id)!;
          for (const [name, value] of Object.entries(call.params.note.fields))
            note.fields[name].value = value as string;
        }
        break;
      }
      case 'addTags':
        for (const id of call.params.notes)
          notes.get(id)!.tags.push(...call.params.tags.split(' '));
        break;
      case 'sync':
        break;
      default:
        error = `unsupported action: ${call.action}`;
    }
    return new Response(JSON.stringify({ result, error }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
  return { calls, notes, state, fetcher };
}

const card: AnkiCard = {
  id: 'mastery:variables',
  skillId: 'variables',
  skillName: 'Variables',
  front: 'What does x = 4 do?',
  back: 'It binds the name x to the integer 4.',
  kind: 'mastery',
};

describe('Anki profile connection', () => {
  it('starts with permission, identifies the active profile, and makes no card mutations while connecting', async () => {
    const server = fakeAnki();
    const client = createAnkiClient({ fetch: server.fetcher });
    expect(await client.connect()).toEqual({
      version: 6,
      activeProfile: 'My learning profile',
      profileVerified: true,
      profileNames: ['My learning profile'],
      deckNames: ['Default'],
      requireApiKey: false,
    });
    expect(server.calls.map((call) => call.action)).toEqual([
      'requestPermission',
      'version',
      'getProfiles',
      'getActiveProfile',
      'deckNames',
    ]);
    const returned = client.getConnection()!;
    returned.profileNames.push('Changed externally');
    expect(client.getConnection()?.profileNames).toEqual([
      'My learning profile',
    ]);
  });

  it('does not bypass denied permission', async () => {
    const server = fakeAnki();
    server.state.granted = false;
    const client = createAnkiClient({ fetch: server.fetcher });
    await expect(client.connect()).rejects.toMatchObject({
      code: 'PERMISSION_DENIED',
    });
    expect(server.calls).toHaveLength(1);
    expect(client.getConnection()).toBeNull();
  });

  it.each(['requireApikey', 'requireApiKey'] as const)(
    'normalizes %s, requires the configured add-on key, and excludes it from requestPermission',
    async (permissionKeyField) => {
      const server = fakeAnki();
      server.state.requireApiKey = true;
      server.state.permissionKeyField = permissionKeyField;
      await expect(
        createAnkiClient({ fetch: server.fetcher }).connect(),
      ).rejects.toMatchObject({ code: 'API_KEY_REQUIRED' });
      server.calls.length = 0;
      expect(
        await createAnkiClient({
          fetch: server.fetcher,
          apiKey: 'local-addon-key',
        }).connect(),
      ).toMatchObject({ requireApiKey: true });
      expect(server.calls[0].key).toBeUndefined();
      expect(
        server.calls.slice(1).every((call) => call.key === 'local-addon-key'),
      ).toBe(true);
    },
  );

  it('honors either key requirement when an implementation supplies both spellings', async () => {
    const server = fakeAnki();
    const fetcher: typeof fetch = async (input, init) => {
      const response = await server.fetcher(input, init);
      const payload = await response.json();
      if (JSON.parse(String(init?.body)).action === 'requestPermission') {
        payload.result.requireApiKey = true;
        payload.result.requireApikey = false;
      }
      return new Response(JSON.stringify(payload), { status: 200 });
    };
    await expect(
      createAnkiClient({ fetch: fetcher }).connect(),
    ).rejects.toMatchObject({ code: 'API_KEY_REQUIRED' });
    expect(server.calls).toHaveLength(1);
  });

  it('refuses old API versions', async () => {
    const server = fakeAnki();
    server.state.apiVersion = 5;
    await expect(
      createAnkiClient({ fetch: server.fetcher }).connect(),
    ).rejects.toMatchObject({ code: 'UNSUPPORTED_VERSION' });
  });

  it('does not guess the active profile on an old add-on with multiple profiles', async () => {
    const server = fakeAnki();
    server.state.supportsActiveProfile = false;
    server.state.profiles = ['Personal', 'Shared'];
    await expect(
      createAnkiClient({ fetch: server.fetcher }).connect(),
    ).rejects.toMatchObject({ code: 'PROFILE_UNKNOWN' });
  });

  it('supports an old add-on with exactly one profile without claiming API verification', async () => {
    const server = fakeAnki();
    server.state.supportsActiveProfile = false;
    const client = createAnkiClient({ fetch: server.fetcher });
    expect(await client.connect()).toMatchObject({
      activeProfile: 'My learning profile',
      profileVerified: false,
    });
    expect((await client.syncCards([card])).synced).toHaveLength(1);
  });
});

describe('Anki card queue flushing', () => {
  it('exports exactly three fields per card while preserving Python indentation and safely escaping HTML', () => {
    const exported = exportCardsTsv([
      {
        ...card,
        front: 'What does "ready" mean?\r\n<x & y>',
        back: 'if ready:\r\n\tprint("<ready> & \'done\'")',
      },
      {
        ...card,
        id: 'second-card',
        front: 'Another\nquestion',
        back: '    return 42',
      },
    ]);
    const lines = exported.trimEnd().split('\n');
    expect(lines.slice(0, 4)).toEqual([
      '#separator:Tab',
      '#html:true',
      '#columns:Front\tBack\tTags',
      '#tags column:3',
    ]);
    const rows = lines.slice(4).map((line) => line.split('\t'));
    expect(rows).toHaveLength(2);
    expect(rows.every((row) => row.length === 3)).toBe(true);
    expect(rows[0][0]).toBe(
      '<pre style="white-space:pre-wrap">What does &quot;ready&quot; mean?<br>&lt;x &amp; y&gt;</pre>',
    );
    expect(rows[0][1]).toBe(
      '<pre style="white-space:pre-wrap">if ready:<br>    print(&quot;&lt;ready&gt; &amp; &#39;done&#39;&quot;)</pre>',
    );
    expect(rows[0][2].split(' ')).toContain('lessdumb');
    expect(rows[0][2].split(' ')).toContain(ankiCardTag(card.id));
    expect(rows[1][0]).toContain('Another<br>question');
    expect(rows[1][1]).toContain('    return 42');
  });

  it('requires explicit connection and preserves cards as failed results', async () => {
    const server = fakeAnki();
    const result = await createAnkiClient({ fetch: server.fetcher }).syncCards([
      card,
    ]);
    expect(result).toMatchObject({
      synced: [],
      failed: [{ cardId: card.id, code: 'NOT_CONNECTED', retryable: false }],
    });
    expect(server.calls).toHaveLength(0);
  });

  it('creates the deck and generic note type and escapes text before transmitting it', async () => {
    const server = fakeAnki();
    const client = createAnkiClient({ fetch: server.fetcher });
    await client.connect();
    const unsafe: AnkiCard = {
      ...card,
      id: '" OR tag:*',
      front: '<script>alert("x")</script>\nprint(2)',
      skillName: '<Variables>',
    };
    const result = await client.syncCards([unsafe]);
    expect(result).toEqual({
      synced: [{ cardId: unsafe.id, noteId: 1000, status: 'created' }],
      failed: [],
    });
    expect(server.state.decks).toContain(ANKI_DECK);
    const modelCall = server.calls.find(
      (call) => call.action === 'createModel',
    )!;
    expect(modelCall.params).toMatchObject({
      modelName: ANKI_MODEL,
      inOrderFields: ['Front', 'Back', 'Skill'],
      isCloze: false,
    });
    const note = server.notes.get(1000)!;
    expect(note.fields.Front.value).toContain(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;<br>print(2)',
    );
    expect(note.fields.Front.value).not.toContain('<script>');
    expect(note.fields.Skill.value).toBe('&lt;Variables&gt;');
    expect(
      server.calls.find((call) => call.action === 'findNotes')?.params.query,
    ).toMatch(/^tag:lessdumb_card_[0-9a-f]+$/);
  });

  it('is idempotent across retries and updates existing fields without deleting scheduling or user tags', async () => {
    const server = fakeAnki();
    const client = createAnkiClient({ fetch: server.fetcher });
    await client.connect();
    await client.syncCards([card]);
    server.notes.get(1000)!.tags.push('my-own-tag');
    expect((await client.syncCards([card])).synced[0]).toMatchObject({
      noteId: 1000,
      status: 'unchanged',
    });
    const updated = await client.syncCards([
      { ...card, back: 'An updated explanation.' },
    ]);
    expect(updated.synced[0]).toMatchObject({
      noteId: 1000,
      status: 'updated',
    });
    expect(server.notes.size).toBe(1);
    expect(server.notes.get(1000)!.tags).toContain('my-own-tag');
    expect(
      server.calls.filter((call) => call.action === 'addNote'),
    ).toHaveLength(1);
  });

  it('recovers a saved note after the creation response is lost', async () => {
    const server = fakeAnki();
    const client = createAnkiClient({ fetch: server.fetcher });
    await client.connect();
    server.state.lostAddResponse = true;
    expect((await client.syncCards([card])).failed[0]).toMatchObject({
      code: 'UNREACHABLE',
      retryable: true,
    });
    expect((await client.syncCards([card])).synced[0]).toMatchObject({
      noteId: 1000,
      status: 'unchanged',
    });
    expect(server.notes.size).toBe(1);
  });

  it('serializes simultaneous queue flushes', async () => {
    const server = fakeAnki();
    const client = createAnkiClient({ fetch: server.fetcher });
    await client.connect();
    const results = await Promise.all([
      client.syncCards([card]),
      client.syncCards([card]),
    ]);
    expect(
      results.flatMap((result) => result.synced).map((item) => item.status),
    ).toEqual(['created', 'unchanged']);
    expect(server.notes.size).toBe(1);
  });

  it('stops before writing when the user switches desktop profiles', async () => {
    const server = fakeAnki();
    const client = createAnkiClient({ fetch: server.fetcher });
    await client.connect();
    server.state.profile = 'Someone else';
    const result = await client.syncCards([
      card,
      { ...card, id: 'mistake:1', kind: 'mistake' },
    ]);
    expect(result.synced).toHaveLength(0);
    expect(result.failed).toHaveLength(2);
    expect(result.failed.every((item) => item.code === 'PROFILE_CHANGED')).toBe(
      true,
    );
    expect(client.getConnection()).toBeNull();
    expect(
      server.calls.some((call) =>
        ['createDeck', 'createModel', 'addNote', 'updateNoteFields'].includes(
          call.action,
        ),
      ),
    ).toBe(false);
  });

  it('detects an open Anki editor preventing an update and retains the card for retry', async () => {
    const server = fakeAnki();
    const client = createAnkiClient({ fetch: server.fetcher });
    await client.connect();
    await client.syncCards([card]);
    server.state.blockUpdates = true;
    expect(
      (await client.syncCards([{ ...card, back: 'new answer' }])).failed[0],
    ).toMatchObject({
      code: 'ACTION_FAILED',
      retryable: true,
      error: expect.stringContaining('Close the card editor'),
    });
    server.state.blockUpdates = false;
    expect(
      (await client.syncCards([{ ...card, back: 'new answer' }])).synced[0]
        .status,
    ).toBe('updated');
  });

  it('reports incompatible existing note types without overwriting them', async () => {
    const server = fakeAnki();
    server.state.models = [ANKI_MODEL];
    server.state.modelFields = ['Front', 'Back'];
    const client = createAnkiClient({ fetch: server.fetcher });
    await client.connect();
    expect((await client.syncCards([card])).failed[0].code).toBe(
      'MODEL_CONFLICT',
    );
    expect(
      server.calls.some((call) =>
        ['createModel', 'addNote'].includes(call.action),
      ),
    ).toBe(false);
  });

  it('keeps unsent cards retryable when Anki goes offline and honors a custom deck', async () => {
    const server = fakeAnki();
    const client = createAnkiClient({ fetch: server.fetcher });
    await client.connect();
    server.state.networkFailure = 'findNotes';
    const result = await client.syncCards(
      [card, { ...card, id: 'mastery:2', front: 'Another question' }],
      { deck: 'lessdumb::Practice' },
    );
    expect(result.failed).toHaveLength(2);
    expect(result.failed.every((item) => item.retryable)).toBe(true);
    expect(server.state.decks).toContain('lessdumb::Practice');
    expect(
      server.calls.filter((call) => call.action === 'findNotes'),
    ).toHaveLength(1);
  });

  it('uses distinct, stable search-safe tags for distinct arbitrary IDs', () => {
    expect(ankiCardTag('variables')).toBe(ankiCardTag('variables'));
    expect(ankiCardTag('some id')).not.toBe(ankiCardTag('some-id'));
    expect(ankiCardTag('σ🙂')).toMatch(/^lessdumb_card_[0-9a-f]+$/);
  });

  it('uses Anki desktop for AnkiWeb synchronization and does not send account credentials', async () => {
    const server = fakeAnki();
    const client = createAnkiClient({ fetch: server.fetcher });
    await expect(client.syncToAnkiWeb()).rejects.toBeInstanceOf(
      AnkiConnectError,
    );
    await client.connect();
    await client.syncToAnkiWeb();
    expect(server.calls.at(-1)).toEqual({
      action: 'sync',
      version: 6,
      params: {},
    });
    client.disconnect();
    await expect(client.syncToAnkiWeb()).rejects.toMatchObject({
      code: 'NOT_CONNECTED',
    });
  });
});
