import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SkillOutline } from '../src/lib/curriculum';
import { skillById, skills } from '../src/lib/curriculum';
import {
  cardSkillName,
  cardSkills,
  cardWithText,
  loadCardText,
  masteryCard,
  mistakeCard,
  mistakeQuestionId,
} from '../src/lib/cards';
import { cardBlocks, mistakeCardText } from '../src/lib/card-text';
import { createAnkiClient, exportCardsTsv } from '../src/lib/anki';
import { STATE_VERSION } from '../src/lib/learning';
import { mathSpans } from '../src/lib/math-text';
import {
  createState,
  mergeStates,
  migrateState,
  recordLearningAnswer,
  type LearnerState,
  type QueuedCard,
} from '../src/lib/state';
import { parseStateUpdate } from '../src/lib/server/state-validation';
import { questionVariant } from '../src/lib/variants';
import { fakeAnki } from './helpers/fake-anki';
import { lessonAnswerIds } from './helpers/mastery';

// In the browser a skill's content arrives with its unit. Tests import the
// full curriculum, which registers every skill, so this mock hides a skill's
// content until `loadSkills` loads it, as a unit download would.
const units = vi.hoisted(() => ({
  loaded: new Set<string>(),
  requests: [] as string[][],
}));
vi.mock('../src/lib/content', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/lib/content')>();
  return {
    ...actual,
    contentOf: (skill: SkillOutline) =>
      units.loaded.has(skill.id) ? actual.contentOf(skill) : undefined,
    loadSkills: async (outlines: SkillOutline[]) => {
      units.requests.push(outlines.map((skill) => skill.id));
      for (const skill of outlines) units.loaded.add(skill.id);
      return actual.loadSkills(outlines);
    },
  };
});

beforeEach(() => {
  units.loaded.clear();
  units.requests.length = 0;
});

const root = skills.find(
  (skill) => !skill.prerequisites.length && skill.knowledgePoints,
)!;
const allQuestions = skills.flatMap((skill) =>
  (skill.knowledgePoints ?? []).flatMap((point) =>
    point.questions.map((question) => ({ skill, question })),
  ),
);
// Prose with math and a program: the case that needs prose and code apart.
const mathWithCode = allQuestions.find(
  ({ question }) =>
    question.type !== 'code' &&
    !question.generated &&
    !!question.code &&
    mathSpans(question.prompt).length > 0,
)!;
const generated = allQuestions.find(({ question }) => question.generated)!;

/** A card as version 7 saved it: with its text. */
function savedCopy(card: QueuedCard): QueuedCard {
  const text = cardWithText(card)!;
  return {
    ...card,
    skillName: text.skillName,
    front: text.front,
    back: text.back,
    ...(text.format ? { format: text.format } : {}),
    variant: undefined,
  };
}

describe('cards stored by reference (CEN-153)', () => {
  it('records a mistake without its unit loaded and derives its text once it is', async () => {
    const question = root.knowledgePoints![0].questions[0];
    const state = recordLearningAnswer(createState(), {
      skillId: root.id,
      questionId: question.id,
      correct: false,
      mode: 'learn',
    });
    const [stored] = state.cards;
    expect(stored).toEqual({
      id: `mistake:${root.id}:${question.id}`,
      skillId: root.id,
      kind: 'mistake',
      status: 'pending',
    });
    expect(mistakeQuestionId(stored)).toBe(question.id);
    expect(JSON.stringify(state.cards)).not.toContain(question.explanation);
    // The page can name the skill before its unit arrives.
    expect(cardSkillName(stored)).toBe(root.title);
    expect(cardWithText(stored)).toBeUndefined();
    expect(cardSkills(state.cards).map((skill) => skill.id)).toEqual([root.id]);

    const { cards, missing } = await loadCardText(state.cards);
    expect(units.requests).toEqual([[root.id]]);
    expect(missing).toEqual([]);
    expect(cards).toEqual([
      { ...stored, skillName: root.title, ...mistakeCardText(question) },
    ]);
    expect(cardWithText(stored)).toEqual(cards[0]);
  });

  it('queues mastery cards by reference, with the skill’s authored text', async () => {
    let state = createState();
    for (const questionId of lessonAnswerIds(root.id))
      state = recordLearningAnswer(state, {
        skillId: root.id,
        questionId,
        correct: true,
        mode: 'learn',
      });
    expect(state.cards).toEqual(
      root.flashcards.map((card) => masteryCard(root.id, card.id)),
    );
    const { cards } = await loadCardText(state.cards);
    expect(cards).toEqual(
      root.flashcards.map((card) => ({
        ...card,
        skillName: root.title,
        kind: 'mastery',
        status: 'pending',
      })),
    );
  });

  it('shows the variant of a generated question that was missed', async () => {
    const { skill, question } = generated;
    const stored = mistakeCard(skill.id, question.id, 3);
    const { cards } = await loadCardText([
      stored,
      mistakeCard(skill.id, question.id),
    ]);
    expect(cards[0]).toMatchObject(
      mistakeCardText(questionVariant(question, 3)),
    );
    // Without a variant the card is the authored question, as before generators.
    expect(cards[1]).toMatchObject(mistakeCardText(question));
    expect(cards[0].front).not.toBe(cards[1].front);
  });

  it('keeps the text of cards saved before version 8, without loading content', async () => {
    const { skill, question } = mathWithCode;
    const reference = mistakeCard(skill.id, question.id);
    units.loaded.add(skill.id);
    const saved: QueuedCard[] = [
      { ...savedCopy(reference), status: 'synced', noteId: 41 },
      // A plain-text card from before CEN-128, for a retired question.
      {
        id: `mistake:${skill.id}:${skill.id}-q1`,
        skillId: skill.id,
        skillName: 'An older title',
        kind: 'mistake',
        front: 'What is $x$?\n\nprint(1)',
        back: '1\n\nAs written.',
        status: 'pending',
      },
    ];
    units.loaded.clear();
    expect(saved.map(cardWithText)).toEqual(saved);
    expect(cardWithText(saved[1])).toBe(saved[1]);
    expect(cardSkills(saved)).toEqual([]);
    const { cards, missing } = await loadCardText(saved);
    expect(units.requests).toEqual([[]]);
    expect(cards).toEqual(saved);
    expect(missing).toEqual([]);
  });

  it('migrates a version 7 state to the current version and keeps its cards as saved', () => {
    const { skill, question } = mathWithCode;
    units.loaded.add(skill.id).add(root.id);
    const textCards = [
      { ...savedCopy(mistakeCard(skill.id, question.id)), status: 'synced' },
      savedCopy(masteryCard(root.id, root.flashcards[0].id)),
    ];
    const v7 = JSON.parse(
      JSON.stringify({ ...createState(), version: 7, cards: textCards }),
    );
    v7.progress.version = 7;
    const loaded = parseStateUpdate({ state: v7, revision: 0 }).state;
    expect(loaded.version).toBe(STATE_VERSION);
    expect(STATE_VERSION).toBe(9);
    expect(loaded.progress.version).toBe(STATE_VERSION);
    expect(loaded.cards).toEqual(textCards);
    expect(migrateState(loaded)).toBe(loaded);
  });

  it('merges a version 7 device’s saved cards with version 8 references', () => {
    const { skill, question } = mathWithCode;
    units.loaded.add(skill.id);
    const synced: QueuedCard = {
      ...savedCopy(mistakeCard(skill.id, question.id)),
      status: 'synced',
      noteId: 7,
    };
    const v7 = JSON.parse(
      JSON.stringify({ ...createState(), version: 7, cards: [synced] }),
    ) as LearnerState;
    (v7.progress as { version: number }).version = 7;
    const v8: LearnerState = {
      ...createState(),
      updatedAt: v7.updatedAt + 1,
      cards: [
        mistakeCard(skill.id, question.id),
        mistakeCard(root.id, root.knowledgePoints![0].questions[0].id),
      ],
    };
    for (const merged of [mergeStates(v7, v8), mergeStates(v8, v7)]) {
      expect(merged.version).toBe(STATE_VERSION);
      // The card already in Anki keeps the text it was sent with.
      expect(merged.cards).toEqual([synced, v8.cards[1]]);
    }
  });

  it('sends a referenced card to Anki and exports it as its saved text would be', async () => {
    const { skill, question } = mathWithCode;
    const references = [
      mistakeCard(skill.id, question.id),
      masteryCard(root.id, root.flashcards[0].id),
    ];
    const { cards } = await loadCardText(references);
    const saved = cards.map((card) => savedCopy(card) as typeof card);
    // Prose and code stay apart: math typeset as MathJax, code in <pre>.
    expect(cardBlocks(cards[0].front)).toEqual([
      { kind: 'prose', text: question.prompt },
      { kind: 'code', text: question.type !== 'code' && question.code },
    ]);

    const fromReferences = fakeAnki();
    const client = createAnkiClient({ fetch: fromReferences.fetcher });
    await client.connect();
    const result = await client.syncCards(cards);
    expect(result.failed).toEqual([]);
    expect(result.synced.map((item) => item.cardId)).toEqual(
      references.map((card) => card.id),
    );
    const front = fromReferences.notes.get(1000)!.fields.Front.value;
    expect(front).toContain('<div class="lessdumb-text"');
    expect(front).toContain('\\(');
    expect(front).toContain('<pre style="white-space:pre-wrap">');
    expect(fromReferences.notes.get(1001)!.fields.Skill.value).toBe(root.title);

    const fromSaved = fakeAnki();
    const savedClient = createAnkiClient({ fetch: fromSaved.fetcher });
    await savedClient.connect();
    await savedClient.syncCards(saved);
    expect([...fromSaved.notes.values()]).toEqual([
      ...fromReferences.notes.values(),
    ]);

    const tsv = exportCardsTsv(cards);
    expect(tsv).toBe(exportCardsTsv(saved));
    expect(tsv.trimEnd().split('\n')).toHaveLength(4 + cards.length);
    expect(tsv).toContain('\\(');
  });

  it('reports a card whose question is no longer in the catalog', async () => {
    const gone = mistakeCard(root.id, `${root.id}-kp99-q1`);
    const kept = mistakeCard(root.id, root.knowledgePoints![0].questions[0].id);
    const { cards, missing } = await loadCardText([gone, kept]);
    expect(cards.map((card) => card.id)).toEqual([kept.id]);
    expect(missing).toEqual([gone]);
    expect(cardWithText(gone)).toBeUndefined();
  });
});

describe('validating stored cards', () => {
  const { skill, question } = generated;
  const parse = (cards: unknown[]) =>
    parseStateUpdate({ state: { ...createState(), cards }, revision: 0 });

  it('accepts references, with a variant on a mistake card', () => {
    const cards = [
      mistakeCard(skill.id, question.id, 12),
      masteryCard(skill.id, skillById[skill.id].flashcards[0].id),
    ];
    expect(parse(cards).state.cards).toEqual(cards);
  });

  it('rejects variants anywhere else, and malformed references', () => {
    units.loaded.add(skill.id);
    const saved = savedCopy(mistakeCard(skill.id, question.id));
    for (const card of [
      { ...masteryCard(skill.id, 'card'), variant: 1 },
      { ...saved, variant: 1 },
      mistakeCard(skill.id, question.id, -1),
      mistakeCard(skill.id, question.id, 1.5),
    ])
      expect(() => parse([card])).toThrow('state.cards[0].variant must be');
    expect(() =>
      parse([{ ...mistakeCard(skill.id, question.id), skillId: root.id }]),
    ).toThrow('state.cards[0].id must be mistake:<skill ID>:<question ID>.');
    expect(() =>
      parse([{ ...mistakeCard(skill.id, question.id), front: 'Only a front' }]),
    ).toThrow('state.cards[0].skillName must be');
    const { back: _back, ...frontOnly } = saved;
    expect(() => parse([frontOnly])).toThrow('state.cards[0].back must be');
  });
});
