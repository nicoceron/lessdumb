import CodeMirror, {
  EditorView,
  type Extension,
  type ReactCodeMirrorProps,
} from '@uiw/react-codemirror';
import { use, useMemo } from 'react';
import type { CodeLanguage } from '../lib/curriculum';

// The code editor, with the grammar of one language. Pages import this module
// lazily (`lazy(() => import('./code-editor'))`), so CodeMirror downloads only
// when an editor is on screen, and each language's grammar is its own chunk,
// fetched the first time an editor for that language renders. The editor
// suspends until its grammar is ready, inside the page's Suspense fallback.

const grammars: Record<CodeLanguage, () => Promise<Extension>> = {
  python: () =>
    import('@codemirror/lang-python').then(({ python }) => python()),
  rust: () => import('@codemirror/lang-rust').then(({ rust }) => rust()),
  cpp: () => import('@codemirror/lang-cpp').then(({ cpp }) => cpp()),
};

const requests = new Map<CodeLanguage, Promise<Extension>>();
const loaded = new Map<CodeLanguage, Extension>();

function grammar(language: CodeLanguage): Promise<Extension> {
  let request = requests.get(language);
  if (!request) {
    request = grammars[language]();
    request.then(
      (extension) => loaded.set(language, extension),
      // A failed download (offline, a deploy in between) can be retried.
      () => requests.delete(language),
    );
    requests.set(language, request);
  }
  return request;
}

export interface CodeEditorProps extends Omit<
  ReactCodeMirrorProps,
  'extensions'
> {
  language: CodeLanguage;
  /** Wrap long lines, so code stays readable on a phone. */
  wrap?: boolean;
}

export default function CodeEditor({
  language,
  wrap = false,
  ...props
}: CodeEditorProps) {
  // A grammar already loaded renders at once, without a Suspense fallback.
  const syntax = loaded.get(language) ?? use(grammar(language));
  const extensions = useMemo(
    () => (wrap ? [syntax, EditorView.lineWrapping] : [syntax]),
    [syntax, wrap],
  );
  return <CodeMirror {...props} extensions={extensions} />;
}
