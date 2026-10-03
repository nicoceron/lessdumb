import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// scripts/copy-python.mjs writes public/pyodide/current.mjs, which the browser
// worker imports to find the versioned runtime directory.
const current = readFileSync(resolve('public/pyodide/current.mjs'), 'utf8');
const match = /^export const indexURL = '(\/pyodide\/[^'/]+\/)';$/m.exec(
  current,
);
if (!match) throw new Error('Run `node scripts/copy-python.mjs` first.');

/** Where browsers load Pyodide from: `/pyodide/<version>-<packages>/`. */
export const pyodideIndexURL = match[1];

/** The same directory as a file path, for Pyodide in Node. */
export const pyodideDirectory = `${resolve('public', `.${pyodideIndexURL}`)}/`;
