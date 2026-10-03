import { useEffect, useSyncExternalStore } from 'react';
import type { ChoiceQuestion } from '../lib/curriculum';
import { parseMathText } from '../lib/math-text';

type RenderMath = (tex: string, displayMode: boolean) => string;

// KaTeX loads once, on first use, and every mounted text re-renders with it.
let renderMath: RenderMath | null = null;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const rendered = new Map<string, string>();

function cachedMath(render: RenderMath, tex: string, display: boolean) {
  const key = `${display ? 'D' : 'I'}${tex}`;
  let html = rendered.get(key);
  if (html === undefined) rendered.set(key, (html = render(tex, display)));
  return html;
}

function loadMath() {
  loading ??= import('../lib/katex-render').then(
    (module) => {
      renderMath = module.renderMath;
      listeners.forEach((listener) => listener());
    },
    () => {
      // Offline or a failed chunk: keep showing the TeX source; retry later.
      loading = null;
    },
  );
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function useMathRenderer(needed: boolean): RenderMath | null {
  const render = useSyncExternalStore(
    subscribe,
    () => renderMath,
    () => null,
  );
  useEffect(() => {
    if (needed && !render) loadMath();
  }, [needed, render]);
  return render;
}

function MathSpan({
  tex,
  display,
  render,
}: {
  tex: string;
  display: boolean;
  render: RenderMath | null;
}) {
  const className = display ? 'math-display' : 'math-inline';
  // Until KaTeX arrives, the TeX source stands in at the same position.
  if (!render)
    return <span className={`${className} math-pending`}>{tex}</span>;
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: cachedMath(render, tex, display) }}
    />
  );
}

/**
 * Authored prose: backtick spans render as code, `$…$` as inline math and
 * `$$…$$` as display math (see `src/lib/math-text.ts`).
 */
export function InlineText({ text }: { text: string }) {
  const { segments } = parseMathText(text);
  const render = useMathRenderer(
    segments.some((segment) => segment.kind === 'math'),
  );
  return (
    <>
      {segments.map((segment, index) =>
        segment.kind === 'code' ? (
          <code className="inline-code" key={index}>
            {segment.text}
          </code>
        ) : segment.kind === 'math' ? (
          <MathSpan
            key={index}
            tex={segment.tex}
            display={segment.display}
            render={render}
          />
        ) : (
          segment.text
        ),
      )}
    </>
  );
}

/** A choice: program output stays literal; other choices are prose. */
export function ChoiceText({
  question,
  index,
}: {
  question: Pick<ChoiceQuestion, 'choices' | 'checksOutput'>;
  index: number;
}) {
  const choice = question.choices[index];
  return question.checksOutput ? choice : <InlineText text={choice} />;
}
