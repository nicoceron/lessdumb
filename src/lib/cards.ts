import type { AnkiCard } from './anki';
import { mistakeCardText } from './card-text';
import { skillById } from './catalog-index';
import type { Skill, SkillOutline } from './curriculum';
import { contentOf, loadSkills } from './content';
import { findQuestion } from './lesson-plan';
import type { QueuedCard } from './state';
import { questionVariant } from './variants';

// Flashcards in a learner's state. Since state version 8 a card is a
// reference: its skill, its kind, and for a mistake card the question (in its
// ID) and the variant that was missed. Its text comes from the catalog once
// that skill's unit is loaded, so a state no longer copies lesson text and
// stays small as the catalog grows. Cards saved before version 8 keep the
// text they were made with, shown and sent to Anki as written.

/** The text a card shows and sends to Anki. */
export type CardText = Pick<
  AnkiCard,
  'skillName' | 'front' | 'back' | 'format'
>;
/** A stored card with its text, ready to show, send to Anki, or export. */
export type CardWithText = QueuedCard & AnkiCard;

export function mistakeCardId(skillId: string, questionId: string): string {
  return `mistake:${skillId}:${questionId}`;
}

/** The question a mistake card shows, read from its ID. */
export function mistakeQuestionId(
  card: Pick<QueuedCard, 'id' | 'skillId'>,
): string | undefined {
  const prefix = mistakeCardId(card.skillId, '');
  return card.id.startsWith(prefix) && card.id.length > prefix.length
    ? card.id.slice(prefix.length)
    : undefined;
}

/** The card a wrong answer creates: a reference to the question asked. */
export function mistakeCard(
  skillId: string,
  questionId: string,
  variant?: number,
): QueuedCard {
  return {
    id: mistakeCardId(skillId, questionId),
    skillId,
    kind: 'mistake',
    ...(variant !== undefined ? { variant } : {}),
    status: 'pending',
  };
}

/** A skill's authored mastery card, by reference. */
export function masteryCard(skillId: string, cardId: string): QueuedCard {
  return { id: cardId, skillId, kind: 'mastery', status: 'pending' };
}

/** Whether a card carries the text it was saved with (before version 8). */
export function hasSavedText(card: QueuedCard): card is CardWithText {
  return card.front !== undefined && card.back !== undefined;
}

// Text derived from the catalog depends only on the card's identity and
// variant; deriving it formats a question, so it is kept once computed.
const derived = new Map<string, CardText>();

function derivedText(
  skill: Skill,
  card: QueuedCard,
): Omit<CardText, 'skillName'> | undefined {
  if (card.kind === 'mastery') {
    const flashcard = skill.flashcards.find((item) => item.id === card.id);
    return flashcard && { front: flashcard.front, back: flashcard.back };
  }
  const questionId = mistakeQuestionId(card);
  const question = questionId && findQuestion(skill, questionId);
  // A generated question's card shows the variant that was missed.
  return question
    ? mistakeCardText(questionVariant(question, card.variant))
    : undefined;
}

/**
 * The card with its text: as saved, or derived from its skill's content.
 * Undefined while that content is not loaded, or when the catalog no longer
 * has the card's question or flashcard.
 */
export function cardWithText(card: QueuedCard): CardWithText | undefined {
  if (hasSavedText(card)) return card;
  const outline = skillById[card.skillId];
  const skill = outline && contentOf(outline);
  if (!skill) return undefined;
  const key = `${card.id}#${card.variant ?? ''}`;
  let text = derived.get(key);
  if (!text) {
    const found = derivedText(skill, card);
    if (!found) return undefined;
    text = { ...found, skillName: skill.title };
    derived.set(key, text);
  }
  return { ...card, ...text };
}

/** The skills whose content these cards' text comes from. */
export function cardSkills(cards: readonly QueuedCard[]): SkillOutline[] {
  const ids = new Set(
    cards.filter((card) => !hasSavedText(card)).map((card) => card.skillId),
  );
  return [...ids]
    .map((id) => skillById[id])
    .filter((skill): skill is SkillOutline => !!skill);
}

/** The name a card shows, without loading its skill's content. */
export function cardSkillName(card: QueuedCard): string {
  return card.skillName ?? skillById[card.skillId]?.title ?? card.skillId;
}

/**
 * Load the content these cards need, then return them with their text.
 * `missing` holds cards whose question or flashcard the catalog no longer
 * has: they cannot be shown, sent, or exported.
 */
export async function loadCardText(cards: readonly QueuedCard[]): Promise<{
  cards: CardWithText[];
  missing: QueuedCard[];
}> {
  try {
    await loadSkills(cardSkills(cards));
  } catch {
    throw new Error(
      'The text of some cards could not be downloaded. Check your connection and retry.',
    );
  }
  const result: { cards: CardWithText[]; missing: QueuedCard[] } = {
    cards: [],
    missing: [],
  };
  for (const card of cards) {
    const withText = cardWithText(card);
    if (withText) result.cards.push(withText);
    else result.missing.push(card);
  }
  return result;
}
