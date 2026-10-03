import type { APIRoute } from 'astro';
import { courses, skills, type Course } from '../../lib/curriculum';
import { catalogPath, siteUrl } from '../../lib/site';
export const prerender = true;
export function getStaticPaths() {
  return courses.map((course) => ({
    params: { course: course.id },
    props: { course },
  }));
}
export const GET: APIRoute = ({ props }) => {
  const course = props.course as Course;
  const topics = skills.filter((skill) => course.skillIds.includes(skill.id));
  return new Response(
    `# ${course.title}\n\n${course.description}\n\nCanonical: ${siteUrl(catalogPath(course.id))}\n\n${topics.map((skill) => `## ${skill.title}\n\n${skill.summary}`).join('\n\n')}\n`,
    { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } },
  );
};
