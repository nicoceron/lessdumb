import { mkdir, readdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';

const source = 'node_modules/pyodide';
try {
  const files = await readdir(source);
  await mkdir('public/pyodide', { recursive: true });
  for (const file of files) {
    if (/\.(mjs|wasm|zip|json)$/.test(file) || file === 'LICENSE') {
      await copyFile(join(source, file), join('public/pyodide', file));
    }
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
