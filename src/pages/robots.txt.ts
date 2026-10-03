import { siteUrl } from '../lib/site';
export const prerender = true;
export function GET() {
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /settings\nDisallow: /cards\nDisallow: /learn\nDisallow: /lab\nContent-signal: search=yes, ai-input=yes\n\nSitemap: ${siteUrl('/sitemap.xml')}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}
