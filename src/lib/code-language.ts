import type { CodeLanguage } from './curriculum';

// Editor grammars live in `src/components/code-editor.tsx`, which loads them
// on demand; this module stays free of CodeMirror.

export const codeLanguageLabels: Record<CodeLanguage, string> = {
  python: 'Python',
  rust: 'Rust',
  cpp: 'C++',
};

export function codeLanguage(value?: string): CodeLanguage {
  return value === 'rust' || value === 'cpp' ? value : 'python';
}
