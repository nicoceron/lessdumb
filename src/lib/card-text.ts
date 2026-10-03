import type { AnkiCard } from './anki';
import type { Question } from './curriculum';
import { plainProse } from './math-text';

/**
 * A run of card text. `prose` is authored lesson prose: `$…$` inline math,
 * `$$…$$` display math, backtick code spans, and `\$` for a literal dollar
 * (`src/lib/math-text.ts`). `code` is a program or its output, shown exactly
 * as written and never parsed for math.
 */
export interface CardBlock {
  kind: 'prose' | 'code';
  text: string;
}

// A card with `format: 'prose'` stores each side as its blocks joined by a
// blank line, with code fenced by a line of backticks before and after, as in
// Markdown. The fence is longer than any run of backticks in its code, so it
// cannot occur inside the code. One string per side keeps cards as small as
// plain text: account states have a size limit.
const FENCED = /(^|\n\n)(`{3,})\n([\s\S]*?)\n\2(?=\n\n|$)/g;

/** The blocks of one side of a `format: 'prose'` card. */
export function cardBlocks(text: string): CardBlock[] {
  const blocks: CardBlock[] = [];
  const prose = (value: string) => {
    if (value) blocks.push({ kind: 'prose', text: value });
  };
  let last = 0;
  // Prose after a code block starts with the blank line that joins them.
  const after = (value: string) => (last ? value.replace(/^\n\n/, '') : value);
  for (const match of text.matchAll(FENCED)) {
    prose(after(text.slice(last, match.index)));
    blocks.push({ kind: 'code', text: match[3] });
    last = match.index + match[0].length;
  }
  prose(after(text.slice(last)));
  return blocks;
}

/** Blocks without empty ones, adjacent prose joined as it reads back. */
function normalized(blocks: CardBlock[]): CardBlock[] {
  const result: CardBlock[] = [];
  for (const block of blocks) {
    if (!block.text) continue;
    const previous = result.at(-1);
    if (block.kind === 'prose' && previous?.kind === 'prose')
      result[result.length - 1] = {
        kind: 'prose',
        text: `${previous.text}\n\n${block.text}`,
      };
    else result.push(block);
  }
  return result;
}

/**
 * One side of a `format: 'prose'` card, or undefined if its text would not
 * read back as these blocks (prose that itself looks like a fence).
 */
export function cardText(blocks: CardBlock[]): string | undefined {
  const parts = normalized(blocks);
  const text = parts
    .map((block) => {
      if (block.kind === 'prose') return block.text;
      const longest = Math.max(
        0,
        ...(block.text.match(/`+/g) ?? []).map((run) => run.length),
      );
      const fence = '`'.repeat(Math.max(3, longest + 1));
      return `${fence}\n${block.text}\n${fence}`;
    })
    .join('\n\n');
  return JSON.stringify(cardBlocks(text)) === JSON.stringify(parts)
    ? text
    : undefined;
}

/** Blocks as plain text: prose loses its escapes, code stays as written. */
export function plainText(blocks: CardBlock[]): string {
  return blocks
    .map((block) =>
      block.kind === 'prose' ? plainProse(block.text) : block.text,
    )
    .join('\n\n');
}

/**
 * The text of the card a wrong answer creates: the question on the front
 * (its prompt, then its program), the answer and its explanation on the back.
 * Prose and code stay apart (`format: 'prose'`), so the Flashcards page and
 * Anki can typeset the prose's math while code stays as written.
 */
export function mistakeCardText(
  question: Question,
): Pick<AnkiCard, 'front' | 'back' | 'format'> {
  const front: CardBlock[] = [{ kind: 'prose', text: question.prompt }];
  if (question.type === 'choice' && question.code)
    front.push({ kind: 'code', text: question.code });
  const back: CardBlock[] = [
    question.type === 'code'
      ? { kind: 'code', text: question.solution }
      : question.checksOutput
        ? { kind: 'code', text: question.choices[question.answer] }
        : { kind: 'prose', text: question.choices[question.answer] },
    { kind: 'prose', text: question.explanation },
  ];
  const [frontText, backText] = [cardText(front), cardText(back)];
  if (frontText !== undefined && backText !== undefined)
    return { front: frontText, back: backText, format: 'prose' };
  // Unreachable for authored content; plain text is always readable.
  return { front: plainText(front), back: plainText(back) };
}
