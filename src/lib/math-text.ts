import type { Skill } from './curriculum';

/**
 * Authored prose marks inline code with backticks, inline math with `$…$`,
 * and display math with `$$…$$`. `\$` is a literal dollar sign. Code spans
 * take precedence: math is parsed only in the text between them. This module
 * has no KaTeX dependency, so the catalog validator and every page can use it;
 * KaTeX itself loads only where text contains math.
 */
export type TextSegment =
  | { kind: 'text'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'math'; tex: string; display: boolean };

const CODE_SPAN = /(`[^`\n]+`)/;

/** Index of the closing delimiter, skipping TeX escapes such as `\$`. */
function closingDelimiter(text: string, from: number, display: boolean) {
  for (let index = from; index < text.length; index += 1) {
    if (text[index] === '\\') index += 1;
    else if (text[index] === '$' && (!display || text[index + 1] === '$'))
      return index;
  }
  return -1;
}

/** Splits text outside code spans into plain text and math, with errors. */
function parseProse(prose: string, segments: TextSegment[], errors: string[]) {
  let plain = '';
  let index = 0;
  const flush = () => {
    if (plain) segments.push({ kind: 'text', text: plain });
    plain = '';
  };
  while (index < prose.length) {
    const char = prose[index];
    if (char === '\\' && prose[index + 1] === '$') {
      plain += '$';
      index += 2;
      continue;
    }
    if (char !== '$') {
      plain += char;
      index += 1;
      continue;
    }
    const display = prose[index + 1] === '$';
    const delimiter = display ? '$$' : '$';
    const close = closingDelimiter(prose, index + delimiter.length, display);
    if (close < 0) {
      errors.push(
        `unclosed ${delimiter} in "${prose.slice(index, index + 40)}"; write a literal dollar as \\$.`,
      );
      plain += prose.slice(index);
      break;
    }
    const tex = prose.slice(index + delimiter.length, close);
    const source = prose.slice(index, close + delimiter.length);
    if (!tex.trim()) {
      errors.push(`empty math ${source}.`);
      plain += source;
    } else {
      if (!display && tex.trim() !== tex)
        errors.push(
          `math ${source} starts or ends with a space; write a literal dollar as \\$.`,
        );
      flush();
      segments.push({ kind: 'math', tex, display });
    }
    index = close + delimiter.length;
  }
  flush();
}

/** Parses authored prose into text, code, and math segments. */
export function parseMathText(text: string): {
  segments: TextSegment[];
  errors: string[];
} {
  const segments: TextSegment[] = [];
  const errors: string[] = [];
  for (const part of text.split(CODE_SPAN)) {
    if (part.length > 2 && part.startsWith('`') && part.endsWith('`'))
      segments.push({ kind: 'code', text: part.slice(1, -1) });
    else if (part) parseProse(part, segments, errors);
  }
  return { segments, errors };
}

/** Delimiter problems in authored prose: unclosed, empty, or padded math. */
export function mathTextErrors(text: string): string[] {
  return parseMathText(text).errors;
}

/**
 * Authored prose as plain text for flashcards, which are not typeset: math
 * keeps its TeX source between dollars, and `\$` becomes a plain dollar.
 */
export function plainProse(text: string): string {
  return parseMathText(text)
    .segments.map((segment) =>
      segment.kind === 'math'
        ? segment.display
          ? `$$${segment.tex}$$`
          : `$${segment.tex}$`
        : segment.kind === 'code'
          ? `\`${segment.text}\``
          : segment.text,
    )
    .join('');
}

/** The math spans of authored prose, for rendering checks. */
export function mathSpans(text: string): { tex: string; display: boolean }[] {
  return parseMathText(text).segments.flatMap((segment) =>
    segment.kind === 'math'
      ? [{ tex: segment.tex, display: segment.display }]
      : [],
  );
}

/**
 * Every authored field the lesson renders as prose with math, keyed by a
 * readable location. Titles, summaries, flashcards, code, worked-example code
 * and outputs, and the choices of output questions stay literal text.
 */
export function mathTextFields(skill: Skill): [string, string][] {
  const fields: [string, string][] = [];
  skill.lesson.paragraphs.forEach((paragraph, index) =>
    fields.push([`${skill.id} lesson paragraph ${index + 1}`, paragraph]),
  );
  fields.push([
    `${skill.id} lesson example explanation`,
    skill.lesson.example.explanation,
  ]);
  for (const point of skill.knowledgePoints ?? []) {
    point.explanation.forEach((paragraph, index) =>
      fields.push([`${point.id} explanation ${index + 1}`, paragraph]),
    );
    fields.push([`${point.id} example explanation`, point.example.explanation]);
  }
  for (const question of [
    ...skill.questions,
    ...(skill.knowledgePoints ?? []).flatMap((point) => point.questions),
  ]) {
    fields.push(
      [`${question.id} prompt`, question.prompt],
      [`${question.id} explanation`, question.explanation],
    );
    if (question.type === 'choice' && !question.checksOutput)
      question.choices.forEach((choice, index) =>
        fields.push([`${question.id} choice ${index + 1}`, choice]),
      );
  }
  for (const problem of skill.multistep ?? []) {
    (problem.setup?.text ?? []).forEach((paragraph, index) =>
      fields.push([`${problem.id} setup ${index + 1}`, paragraph]),
    );
    for (const part of problem.parts ?? []) {
      fields.push(
        [`${part.id} prompt`, part.prompt],
        [`${part.id} explanation`, part.explanation],
      );
      if (part.type === 'choice' && !part.checksOutput)
        part.choices.forEach((choice, index) =>
          fields.push([`${part.id} choice ${index + 1}`, choice]),
        );
    }
  }
  return fields;
}
