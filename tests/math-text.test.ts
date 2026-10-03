import { describe, expect, it } from 'vitest';
import katex from 'katex';
import {
  defaultCatalog,
  skillById,
  skills,
  validateCurriculum,
  type Skill,
} from '../src/lib/curriculum';
import {
  mathSpans,
  mathTextErrors,
  mathTextFields,
  parseMathText,
  plainProse,
} from '../src/lib/math-text';
import { renderMath } from '../src/lib/katex-render';

/** KaTeX's own parser, strict, so a TeX typo fails the catalog check. */
function katexError(tex: string, displayMode: boolean) {
  try {
    katex.renderToString(tex, {
      displayMode,
      throwOnError: true,
      strict: 'error',
    });
    return undefined;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

describe('math delimiters in authored prose', () => {
  it('parses inline and display math between plain text', () => {
    expect(
      parseMathText('If $x^2 = 9$, then $$x = \\pm 3.$$ Done.').segments,
    ).toEqual([
      { kind: 'text', text: 'If ' },
      { kind: 'math', tex: 'x^2 = 9', display: false },
      { kind: 'text', text: ', then ' },
      { kind: 'math', tex: 'x = \\pm 3.', display: true },
      { kind: 'text', text: ' Done.' },
    ]);
  });

  it('reads \\$ as a literal dollar outside math and as TeX inside it', () => {
    expect(parseMathText('Orders cost \\$20 each.')).toEqual({
      segments: [{ kind: 'text', text: 'Orders cost $20 each.' }],
      errors: [],
    });
    expect(mathSpans('Total: $\\$20 + \\$15$ and \\$5.')).toEqual([
      { tex: '\\$20 + \\$15', display: false },
    ]);
  });

  it('never parses math inside backtick code spans', () => {
    expect(
      parseMathText('Run `echo $HOME` and `printf "$$"` for $n$ users.'),
    ).toEqual({
      segments: [
        { kind: 'text', text: 'Run ' },
        { kind: 'code', text: 'echo $HOME' },
        { kind: 'text', text: ' and ' },
        { kind: 'code', text: 'printf "$$"' },
        { kind: 'text', text: ' for ' },
        { kind: 'math', tex: 'n', display: false },
        { kind: 'text', text: ' users.' },
      ],
      errors: [],
    });
    // A dollar inside code cannot close math opened outside it.
    expect(mathTextErrors('Cost $5 in `x$`.')).toHaveLength(1);
  });

  it('rejects unclosed, empty, and space-padded math', () => {
    expect(mathTextErrors('An order costs $20.')[0]).toMatch(/unclosed \$/);
    expect(mathTextErrors('$$x + 1$ is open')[0]).toMatch(/unclosed \$\$/);
    expect(mathTextErrors('Nothing $$$$ here')[0]).toMatch(/empty math/);
    // Currency written without escapes pairs up across words.
    expect(mathTextErrors('From $20 to $40.')[0]).toMatch(/starts or ends/);
    expect(mathTextErrors('Fine: $a$, $$b$$, \\$3, `$`.')).toEqual([]);
  });

  it('keeps unclosed math as literal text when rendering', () => {
    expect(parseMathText('Pay $20 now').segments).toEqual([
      { kind: 'text', text: 'Pay $20 now' },
    ]);
  });

  it('writes plain flashcard text with TeX source and literal dollars', () => {
    expect(
      plainProse('Pay \\$5 when $x^2 > 4$; run `echo \\$`; $$\\sum x$$'),
    ).toBe('Pay $5 when $x^2 > 4$; run `echo \\$`; $$\\sum x$$');
  });
});

describe('math validation in the catalog', () => {
  const base = skillById['math-mean'];
  const withPrompt = (prompt: string): Skill => ({
    ...base,
    knowledgePoints: base.knowledgePoints!.map((point, index) =>
      index
        ? point
        : {
            ...point,
            questions: point.questions.map((question, q) =>
              q ? question : { ...question, prompt },
            ),
          },
    ),
  });

  it('rejects unbalanced dollars in a question prompt', () => {
    expect(
      validateCurriculum(
        [...skills.filter((item) => item.id !== base.id), withPrompt('$x')],
        defaultCatalog,
      ),
    ).toEqual([expect.stringMatching(/math-mean-kp1-q1 prompt: unclosed \$/)]);
  });

  it('rejects KaTeX parse errors when given a TeX checker', () => {
    const registry = [
      ...skills.filter((item) => item.id !== base.id),
      withPrompt('Simplify $\\frac{1}{$.'),
    ];
    expect(validateCurriculum(registry, defaultCatalog)).toEqual([]);
    expect(validateCurriculum(registry, defaultCatalog, katexError)).toEqual([
      expect.stringMatching(/math-mean-kp1-q1 prompt: KaTeX parse error/),
    ]);
  });

  it('renders every authored math span with KaTeX', () => {
    const spans = skills.flatMap((item) =>
      mathTextFields(item).flatMap(([, text]) => mathSpans(text)),
    );
    // The quantitative, ML, and data-analysis lessons are typeset.
    expect(spans.length).toBeGreaterThan(500);
    for (const courseId of [
      'quantitative-foundations',
      'machine-learning',
      'python-data-analysis',
    ])
      expect(
        skills
          .filter((item) => item.courseId === courseId)
          .some((item) =>
            mathTextFields(item).some(([, text]) => mathSpans(text).length),
          ),
        courseId,
      ).toBe(true);
    expect(validateCurriculum(skills, defaultCatalog, katexError)).toEqual([]);
  });

  it('emits MathML for screen readers and a display box for $$', () => {
    const inline = renderMath('\\frac{1}{2}', false);
    expect(inline).toContain('<math');
    expect(inline).toContain('aria-hidden="true"');
    expect(renderMath('\\sum_{i=1}^{n} x_i', true)).toContain('katex-display');
  });
});
