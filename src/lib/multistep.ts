import type {
  MultistepPart,
  MultistepPartRef,
  MultistepProblem,
  MultistepRef,
  Skill,
  SkillOutline,
} from './curriculum';

// Multistep problems (CEN-163): one scenario, two to four ordered parts, each
// a chosen or typed question on one knowledge point of the problem's skill or
// of one of its ancestors. A learner's state stores no new shape for them:
// each part is answered and recorded as its own attempt, whose question ID
// names the problem and the part (`<skill>-ms<n>#p<k>`). Browser code may
// import this module: it holds no catalog data.

export const MIN_PARTS = 2;
export const MAX_PARTS = 4;

/** A problem's ID from its position: `<skill>-ms<n>`. */
export const problemId = (skillId: string, index: number) =>
  `${skillId}-ms${index + 1}`;
/** A part's ID from its position: `<problem>#p<k>`. */
export const partId = (problem: string, index: number) =>
  `${problem}#p${index + 1}`;

const PART = /^(.+-ms\d+)#p(\d+)$/;

/** The problem and the zero-based part index a part ID names. */
export function parsePartId(
  id: string,
): { problemId: string; index: number } | undefined {
  const match = PART.exec(id);
  return match
    ? { problemId: match[1], index: Number(match[2]) - 1 }
    : undefined;
}

export const isPartId = (id: string) => PART.test(id);

/** The skill a knowledge point belongs to: its ID without `-kp<n>`. */
export function pointSkillId(pointId: string): string {
  return pointId.replace(/-kp\d+$/, '');
}

type ProblemOf<S extends SkillOutline> = S extends Skill
  ? MultistepProblem
  : MultistepRef;
type PartOf<S extends SkillOutline> = S extends Skill
  ? MultistepPart
  : MultistepPartRef;

/** A skill's problems: with content for a full skill, as references otherwise. */
export function problemsOf<S extends SkillOutline>(skill: S): ProblemOf<S>[] {
  return (skill.multistep ?? []) as ProblemOf<S>[];
}

/** The problem, part, and part index a part ID names in this skill. */
export function findPart<S extends SkillOutline>(
  skill: S,
  id: string,
): { problem: ProblemOf<S>; part: PartOf<S>; index: number } | undefined {
  const parsed = parsePartId(id);
  if (!parsed) return undefined;
  const problem = problemsOf(skill).find(
    (item) => item.id === parsed.problemId,
  );
  const part = problem?.parts[parsed.index];
  return problem && part && part.id === id
    ? { problem, part: part as PartOf<S>, index: parsed.index }
    : undefined;
}

/** Whether a part exercises a point of the problem's own skill. */
export const ownPart = (
  skill: Pick<SkillOutline, 'id'>,
  part: { point: string },
) => pointSkillId(part.point) === skill.id;

/**
 * The problem's parts on its own skill's points. When every part is right,
 * these count as review answers on those points.
 */
export function ownPartIds(
  skill: Pick<SkillOutline, 'id'>,
  problem: MultistepRef,
): string[] {
  return problem.parts
    .filter((part) => ownPart(skill, part))
    .map((part) => part.id);
}

/**
 * The point of the skill a missed part counts against: the part's own point
 * when it is one of the skill's, otherwise the problem's first own point.
 * A prerequisite's point never loses evidence through a dependent's problem.
 */
export function partEvidencePoint(
  skill: Pick<SkillOutline, 'id'>,
  problem: MultistepRef,
  part: { point: string },
): string | undefined {
  if (ownPart(skill, part)) return part.point;
  return problem.parts.find((item) => ownPart(skill, item))?.point;
}
