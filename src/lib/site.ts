export const siteOrigin = 'https://lessdumb.nicocerond.workers.dev';
export const siteDescription =
  'Learn programming, mathematics, data analysis, machine learning, and data systems through a connected knowledge graph, deliberate practice, and spaced repetition.';

export const catalogPath = (id: string) => `/catalog/${encodeURIComponent(id)}`;
export const siteUrl = (path: string) => new URL(path, siteOrigin).href;
