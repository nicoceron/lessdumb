import * as curriculum from './curriculum';
import { buildIndex } from './catalog-outline';

// The graph index: every course, unit, and skill outline (titles, summaries,
// prerequisites, order, stages, and the IDs of points, questions, and cards),
// without lesson content. The scheduler, graph, dashboards, and state merging
// run on it synchronously; lesson content loads per course from `./content`.
//
// On the server and in tests this module derives the index from the full
// curriculum. For the browser bundle, `scripts/catalog-index-plugin.mjs`
// replaces it with the same index precomputed at build time, so no lesson
// content reaches the main bundle. Keep the exports below in step with the
// plugin's generated module (the build fails on a missing export).
const index = buildIndex(curriculum.defaultCatalog);
export const { courses, units, skills, skillById, defaultCatalog } = index;
