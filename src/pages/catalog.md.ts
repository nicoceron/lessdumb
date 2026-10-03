import { courses } from '../lib/curriculum';
import { catalogPath, siteDescription, siteUrl } from '../lib/site';
export const prerender = true;
export function GET() {
  return new Response(
    `# lessdumb course catalog\n\n${siteDescription}\n\n${courses.map((course) => `- [${course.title}](${siteUrl(catalogPath(course.id))}): ${course.description}`).join('\n')}\n`,
    { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } },
  );
}
