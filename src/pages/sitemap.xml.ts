import { courses } from '../lib/curriculum';
import { catalogPath, siteUrl } from '../lib/site';
export const prerender = true;
export function GET() {
  const paths = [
    '/',
    '/catalog',
    ...courses.map((course) => catalogPath(course.id)),
  ];
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>${siteUrl(path)}</loc></url>`).join('')}</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
