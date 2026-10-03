// Ships the graph index and the lesson content to the browser without the
// curriculum module behind them.
//
// `src/lib/catalog-index.ts` derives the index (every course, unit, and skill
// outline) from the full curriculum. That is fine on the server, but importing
// it in the browser would bundle every lesson. For client builds this plugin
// loads the real curriculum in Node at build time and serves replacements:
//
// - the index, encoded as compact JSON, in place of `src/lib/catalog-index.ts`;
// - in place of `src/lib/content/parts.ts`, one content part per unit: each
//   unit's skills, with their lessons, points, exercises, and cards, become a
//   virtual module that only a dynamic import reaches, so each unit is its own
//   small chunk, named after the unit and hashed from its content alone.
//
// Lesson content reaches the browser only through those dynamic imports. The
// plugin also refuses any client import of the full curriculum, so that
// boundary cannot regress silently.
import { fileURLToPath } from 'node:url';
import { runnerImport } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const file = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));
const indexFile = file('src/lib/catalog-index.ts');
const partsFile = file('src/lib/content/parts.ts');
const outlineFile = file('src/lib/catalog-outline.ts');
const curriculumFile = file('src/lib/curriculum.ts');
const knowledgePointsFile = file('src/lib/knowledge-points/index.ts');
const catalogSources = [
  file('src/lib/curriculum.ts'),
  file('src/lib/catalog-outline.ts'),
  file('src/lib/courses/'),
  file('src/lib/content/'),
  file('src/lib/knowledge-points/'),
];
// `import('lessdumb:content/<unit>')` resolves to `\0lessdumb/content-<unit>`,
// whose last path segment names the chunk: `content-<unit>.<hash>.js`.
const unitSpecifier = 'lessdumb:content/';
const unitModule = '\0lessdumb/content-';

const strip = (id) => id.split('?')[0];

async function loadCatalog() {
  const options = { configFile: false, root, logLevel: 'silent' };
  const [{ module: curriculum }, { module: outline }] = await Promise.all([
    runnerImport(curriculumFile, options),
    runnerImport(outlineFile, options),
  ]);
  return { curriculum, outline };
}

/** The encoded index, as the server-side module computes it. */
export async function encodedCatalogIndex(catalog) {
  const { curriculum, outline } = await (catalog ?? loadCatalog());
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

const generated = (skill) =>
  (skill.knowledgePoints ?? []).some((point) =>
    point.questions.some((question) => question.generated),
  );

/**
 * Every unit with skills, in catalog order, holding its skills' content and,
 * when they have generated questions, the paths of their course's question
 * generator modules.
 */
export async function contentUnits(catalog) {
  const { curriculum } = await (catalog ?? loadCatalog());
  return curriculum.units
    .map((unit) => {
      const skills = curriculum.skills.filter(
        (skill) => skill.unitId === unit.id,
      );
      return {
        id: unit.id,
        courseId: unit.courseId,
        skills,
        generators: skills.some(generated)
          ? (curriculum.generatorFiles[unit.courseId] ?? []).map((name) =>
              file(`src/lib/knowledge-points/${name}`),
            )
          : [],
      };
    })
    .filter((unit) => unit.skills.length);
}

/** The browser's replacement for `src/lib/content/parts.ts`. */
export function contentPartsModule(units) {
  return [
    'const part = (courseId, load) => ({',
    '  courseId,',
    '  load: () => load().then((module) => module.default),',
    '});',
    'export const contentParts = {',
    ...units.map(
      (unit) =>
        `  ${JSON.stringify(unit.id)}: part(${JSON.stringify(unit.courseId)}, () => import(${JSON.stringify(unitSpecifier + unit.id)})),`,
    ),
    '};',
    'export function partOf(skill) {',
    '  return skill.unitId;',
    '}',
    '',
  ].join('\n');
}

/**
 * One unit's content module: its skills as JSON, which parses fastest. JSON
 * has no functions, so a unit with generated questions also imports its
 * course's generator modules and attaches them by question ID, as the
 * server's curriculum does.
 */
export function contentUnitModule(unit) {
  const skills = `JSON.parse(${JSON.stringify(JSON.stringify(unit.skills))})`;
  if (!unit.generators?.length) return `export default ${skills};\n`;
  return [
    `import { attachGenerators } from ${JSON.stringify(knowledgePointsFile)};`,
    ...unit.generators.map(
      (path, index) =>
        `import { generators as g${index} } from ${JSON.stringify(path)};`,
    ),
    `export default attachGenerators(${skills}, [${unit.generators.map((_, index) => `g${index}`).join(', ')}]);`,
    '',
  ].join('\n');
}

export function catalogIndexPlugin() {
  let catalog;
  let encoded;
  let units;
  const isClient = (context, options) =>
    context.environment
      ? context.environment.config.consumer === 'client'
      : !options?.ssr;
  return {
    name: 'lessdumb:catalog-index',
    enforce: 'pre',
    config: () => ({
      build: {
        rollupOptions: {
          // The server bundles the whole curriculum statically, so its
          // per-course dynamic imports stay in place there, as intended.
          onLog(level, log, handler) {
            if (
              log.code === 'INEFFECTIVE_DYNAMIC_IMPORT' &&
              log.message.includes('src/lib/content/')
            )
              return;
            handler(level, log);
          },
        },
      },
    }),
    resolveId(source) {
      if (source.startsWith(unitSpecifier))
        return unitModule + source.slice(unitSpecifier.length);
      return null;
    },
    async load(id, options) {
      if (id.startsWith(unitModule)) {
        const unitId = id.slice(unitModule.length);
        units ??= contentUnits((catalog ??= loadCatalog()));
        const unit = (await units).find((item) => item.id === unitId);
        if (!unit) this.error(`No content for unit ${unitId}.`);
        return contentUnitModule(unit);
      }
      if (!isClient(this, options)) return null;
      const path = strip(id);
      if (path === curriculumFile) {
        const importers = this.getModuleInfo(id)?.importers ?? [];
        this.error(
          `src/lib/curriculum.ts is server-only, but the browser bundle imports it${importers.length ? ` from ${importers.join(', ')}` : ''}. Import types with \`import type\`, graph data from src/lib/catalog-index, and lesson content through src/lib/content.`,
        );
      }
      if (path === partsFile) {
        units ??= contentUnits((catalog ??= loadCatalog()));
        return contentPartsModule(await units);
      }
      if (path !== indexFile) return null;
      encoded ??= encodedCatalogIndex((catalog ??= loadCatalog()));
      return catalogIndexModule(await encoded);
    },
    configureServer(server) {
      // A catalog edit in development rebuilds the index and the content
      // parts on the next request.
      server.watcher.on('change', (changed) => {
        if (!catalogSources.some((source) => changed.startsWith(source)))
          return;
        catalog = encoded = units = undefined;
        const graph = server.environments?.client?.moduleGraph;
        if (!graph) return;
        for (const [id, module] of graph.idToModuleMap)
          if (id === indexFile || id === partsFile || id.startsWith(unitModule))
            graph.invalidateModule(module);
      });
    },
  };
}
