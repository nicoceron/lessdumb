import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Renders one math span with KaTeX's HTML for sight and MathML for screen
 * readers. Loaded with a dynamic import only when text contains math, so
 * KaTeX, its CSS, and its fonts (bundled from the npm package) stay out of
 * every other page's bundle.
 */
export function renderMath(tex: string, displayMode: boolean): string {
  return katex.renderToString(tex, {
    displayMode,
    output: 'htmlAndMathml',
    throwOnError: false,
  });
}
