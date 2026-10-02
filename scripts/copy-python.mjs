import {
  mkdir,
  readdir,
  copyFile,
  readFile,
  writeFile,
  rename,
} from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const source = 'node_modules/pyodide';
try {
  const files = await readdir(source);
  await mkdir('public/pyodide', { recursive: true });
  for (const file of files) {
    if (/\.(mjs|wasm|zip|json)$/.test(file) || file === 'LICENSE') {
      await copyFile(join(source, file), join('public/pyodide', file));
    }
  }
  // Official Pyodide wheels and their transitive dependencies, pinned by its lockfile.
  const { version } = JSON.parse(
    await readFile(join(source, 'package.json'), 'utf8'),
  );
  const lock = JSON.parse(
    await readFile(join(source, 'pyodide-lock.json'), 'utf8'),
  );
  const required = new Set();
  function include(name) {
    if (required.has(name)) return;
    const item = lock.packages[name];
    if (!item) throw new Error(`Unknown Pyodide dependency: ${name}`);
    required.add(name);
    item.depends.forEach(include);
  }
  ['numpy', 'pandas', 'scikit-learn'].forEach(include);
  const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
  await Promise.all(
    [...required].map(async (name) => {
      const item = lock.packages[name];
      const destination = join('public/pyodide', item.file_name);
      try {
        if (digest(await readFile(destination)) === item.sha256) return;
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      const response = await fetch(
        `https://cdn.jsdelivr.net/pyodide/v${version}/full/${item.file_name}`,
      );
      if (!response.ok)
        throw new Error(`Could not fetch ${name}: HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (digest(bytes) !== item.sha256)
        throw new Error(`Pyodide integrity check failed: ${name}`);
      await writeFile(`${destination}.download`, bytes);
      await rename(`${destination}.download`, destination);
      console.log(`Prepared Python package: ${name} ${item.version}`);
    }),
  );
  // Restrict import-driven loading to packages we actually serve locally.
  lock.packages = Object.fromEntries(
    [...required].map((name) => [name, lock.packages[name]]),
  );
  await writeFile('public/pyodide/pyodide-lock.json', JSON.stringify(lock));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
