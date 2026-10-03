import { courses } from '../lib/curriculum';
import { catalogPath, siteDescription, siteUrl } from '../lib/site';
export const prerender = true;
export function GET() {
  const body = `# lessdumb\n\n> ${siteDescription}\n\nThe public catalog describes the authored curriculum. Personal progress, account details, cards, and saved code belong to each learner and are not public sources.\n\n## Public curriculum\n\n- [Course catalog](${siteUrl('/catalog')}): Public HTML catalog.\n- [Markdown catalog](${siteUrl('/catalog.md')}): Course directory in Markdown.\n${courses.map((course) => `- [${course.title}](${siteUrl(catalogPath(course.id) + '.md')}): ${course.description}`).join('\n')}\n\n## Discovery\n\n- [Sitemap](${siteUrl('/sitemap.xml')})\n- [Crawler policy](${siteUrl('/robots.txt')})\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
