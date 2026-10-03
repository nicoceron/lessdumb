import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { InlineText } from '../src/components/inline-text';

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
