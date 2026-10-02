import { python } from '@codemirror/lang-python';
import { rust } from '@codemirror/lang-rust';
import { cpp } from '@codemirror/lang-cpp';
import type { CodeLanguage } from './curriculum';

export const codeLanguageLabels: Record<CodeLanguage, string> = {
  python: 'Python',
  rust: 'Rust',
  cpp: 'C++',
};

export function codeLanguage(value?: string): CodeLanguage {
  return value === 'rust' || value === 'cpp' ? value : 'python';
}

export function editorLanguage(language: CodeLanguage) {
  return language === 'rust' ? rust() : language === 'cpp' ? cpp() : python();
}
