// Ships the graph index to the browser without the curriculum behind it.
//
// `src/lib/catalog-index.ts` derives the index (every course, unit, and skill
// outline) from the full curriculum. That is fine on the server, but importing
// it in the browser would bundle every lesson. For client builds this plugin
// loads the real module in Node at build time, encodes its index as compact
// JSON, and serves a replacement module that decodes it. Lesson content
// reaches the browser only through the per-course dynamic imports in
// `src/lib/content`. The plugin also refuses any client import of the full
// curriculum, so that boundary cannot regress silently.
import { fileURLToPath } from 'node:url';
import { runnerImport } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const file = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));
const indexFile = file('src/lib/catalog-index.ts');
const outlineFile = file('src/lib/catalog-outline.ts');
const curriculumFile = file('src/lib/curriculum.ts');
const catalogSources = [
  file('src/lib/curriculum.ts'),
  file('src/lib/catalog-outline.ts'),
  file('src/lib/courses/'),
  file('src/lib/content/'),
  file('src/lib/knowledge-points/'),
];

const strip = (id) => id.split('?')[0];

/** The encoded index, as the server-side module computes it. */
export async function encodedCatalogIndex() {
  const options = { configFile: false, root, logLevel: 'silent' };
  const [{ module: curriculum }, { module: outline }] = await Promise.all([
    runnerImport(curriculumFile, options),
    runnerImport(outlineFile, options),
  ]);
  return outline.encodeIndex(outline.buildIndex(curriculum.defaultCatalog));
}

/** The browser's replacement for `src/lib/catalog-index.ts`. */
export function catalogIndexModule(encoded) {
  return [
    `import { decodeIndex } from ${JSON.stringify(outlineFile)};`,
    `const index = decodeIndex(JSON.parse(${JSON.stringify(JSON.stringify(encoded))}));`,
    'export const { courses, units, skills, skillById, defaultCatalog } = index;',
    '',
  ].join('\n');
}

export function catalogIndexPlugin() {
  let encoded;
  const isClient = (context, options) =>
    context.environment
      ? context.environment.config.consumer === 'client'
      : !options?.ssr;
  return {
    name: 'lessdumb:catalog-index',
    enforce: 'pre',
    async load(id, options) {
      if (!isClient(this, options)) return null;
      const path = strip(id);
      if (path === curriculumFile) {
        const importers = this.getModuleInfo(id)?.importers ?? [];
        this.error(
          `src/lib/curriculum.ts is server-only, but the browser bundle imports it${importers.length ? ` from ${importers.join(', ')}` : ''}. Import types with \`import type\`, graph data from src/lib/catalog-index, and lesson content through src/lib/content.`,
        );
      }
      if (path !== indexFile) return null;
      encoded ??= encodedCatalogIndex();
      return catalogIndexModule(await encoded);
    },
    configureServer(server) {
      // A catalog edit in development rebuilds the index on the next request.
      server.watcher.on('change', (changed) => {
        if (!catalogSources.some((source) => changed.startsWith(source)))
          return;
        encoded = undefined;
        const graph = server.environments?.client?.moduleGraph;
        const module = graph?.getModuleById(indexFile);
        if (module) graph.invalidateModule(module);
      });
    },
  };
}
