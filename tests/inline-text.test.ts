import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChoiceText, InlineText } from '../src/components/inline-text';

const render = (text: string) =>
  renderToStaticMarkup(createElement(InlineText, { text }));

describe('inline code in authored prose', () => {
  it('renders backtick spans as code and leaves other text alone', () => {
    expect(render('Use `std::cout` to print; `x` stays a name.')).toBe(
      'Use <code class="inline-code">std::cout</code> to print; <code class="inline-code">x</code> stays a name.',
    );
  });

  it('keeps a lone backtick and an empty pair as plain characters', () => {
    expect(render('one ` only')).toBe('one ` only');
    expect(render('empty `` pair')).toBe('empty `` pair');
  });
});

describe('math in authored prose', () => {
  it('shows the TeX source in place until KaTeX loads', () => {
    expect(render('Mean $\\bar{x}$ and $$\\sum x_i$$ cost \\$5.')).toBe(
      'Mean <span class="math-inline math-pending">\\bar{x}</span> and <span class="math-display math-pending">\\sum x_i</span> cost $5.',
    );
  });

  it('leaves dollars inside code spans and text without math alone', () => {
    expect(render('Print `"$5"` today.')).toBe(
      'Print <code class="inline-code">&quot;$5&quot;</code> today.',
    );
    expect(render('Unclosed $20 stays text.')).toBe('Unclosed $20 stays text.');
  });

  it('keeps output choices literal and parses conceptual choices', () => {
    const choice = (checksOutput: boolean, text: string) =>
      renderToStaticMarkup(
        createElement(ChoiceText, {
          question: { choices: [text], checksOutput },
          index: 0,
        }),
      );
    expect(choice(true, '$x$')).toBe('$x$');
    expect(choice(false, '$x$')).toBe(
      '<span class="math-inline math-pending">x</span>',
    );
  });
});
