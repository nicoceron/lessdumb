import type {
  Course,
  CurriculumCatalog,
  GraphCatalog,
  Question,
  SkillOutline,
  Unit,
} from './curriculum';

// Pure helpers over skill outlines. Browser code may import this module: it
// holds no catalog data.

/**
 * Conservative default share of a full review that practicing a skill gives
 * each direct prerequisite it uses. A heuristic, not a fitted parameter.
 */
export const DEFAULT_ENCOMPASS_WEIGHT = 0.25;

/** The direct prerequisites a skill exercises, with their weights. */
export function encompassings(
  item: SkillOutline,
): { id: string; weight: number }[] {
  return (
    item.encompasses ??
    item.prerequisites.map((id) => ({ id, weight: DEFAULT_ENCOMPASS_WEIGHT }))
  );
}

const encompassingIndex = new WeakMap<
  SkillOutline[],
  Map<string, SkillOutline[]>
>();
/** Skills whose practice also exercises `skillId`, in catalog order. */
export function encompassedBy<S extends SkillOutline>(
  skillId: string,
  registry: S[],
): S[] {
  let index = encompassingIndex.get(registry);
  if (!index) {
    index = new Map();
    for (const item of registry)
      for (const { id } of encompassings(item))
        index.set(id, [...(index.get(id) ?? []), item]);
    encompassingIndex.set(registry, index);
  }
  return (index.get(skillId) ?? []) as S[];
}

/**
 * Defaults adapt to the available assessments, so choice-only subjects need no
 * code runtime. Knowledge-point questions meet a choice requirement; for those
 * skills `reviewAnswers` counts points reviewed, with code asked in addition.
 */
export function assessmentPolicy(
  item: SkillOutline,
): NonNullable<SkillOutline['assessment']> {
  const points = item.knowledgePoints?.length ?? 0;
  return (
    item.assessment ?? {
      requiredTypes: [
        ...new Set(
          [
            ...item.questions,
            ...(item.knowledgePoints ?? []).flatMap((point) => point.questions),
          ].map((question) => question.type),
        ),
      ],
      reviewAnswers: Math.min(2, points || item.questions.length),
    }
  );
}

/** A skill without its lesson content: what the graph index keeps. */
export function outlineSkill(skill: SkillOutline): SkillOutline {
  return {
    id: skill.id,
    courseId: skill.courseId,
    domain: skill.domain,
    unitId: skill.unitId,
    title: skill.title,
    summary: skill.summary,
    prerequisites: skill.prerequisites,
    order: skill.order,
    estimatedMinutes: skill.estimatedMinutes,
    ...(skill.topicId !== undefined ? { topicId: skill.topicId } : {}),
    ...(skill.topicTitle !== undefined ? { topicTitle: skill.topicTitle } : {}),
    ...(skill.stage !== undefined ? { stage: skill.stage } : {}),
    ...(skill.stageCount !== undefined ? { stageCount: skill.stageCount } : {}),
    ...(skill.knowledgePoints
      ? {
          knowledgePoints: skill.knowledgePoints.map((point) => ({
            id: point.id,
            questions: point.questions.map(({ id, type }) => ({ id, type })),
          })),
        }
      : {}),
    questions: skill.questions.map(({ id, type }) => ({ id, type })),
    flashcards: skill.flashcards.map(({ id }) => ({ id })),
    ...(skill.assessment ? { assessment: skill.assessment } : {}),
    ...(skill.encompasses ? { encompasses: skill.encompasses } : {}),
  };
}

/** Every course, unit, and skill outline, as the browser keeps them. */
export interface CatalogIndex {
  courses: Course[];
  units: Unit[];
  skills: SkillOutline[];
  skillById: Record<string, SkillOutline>;
  defaultCatalog: GraphCatalog;
}

export function buildIndex(
  catalog: CurriculumCatalog<SkillOutline>,
): CatalogIndex {
  return indexOf(
    catalog.courses,
    catalog.units,
    catalog.skills.map(outlineSkill),
  );
}

function indexOf(
  courses: Course[],
  units: Unit[],
  skills: SkillOutline[],
): CatalogIndex {
  return {
    courses,
    units,
    skills,
    skillById: Object.fromEntries(skills.map((skill) => [skill.id, skill])),
    defaultCatalog: { courses, units, skills },
  };
}

// The build ships the index as compact JSON. Knowledge-point and card IDs are
// generated from their position, so counts recreate them exactly.
type EncodedSkill = Omit<
  SkillOutline,
  'knowledgePoints' | 'questions' | 'flashcards'
> & {
  /** Each knowledge point's question types, one letter per question. */
  points?: string[];
  questions: [string, Question['type']][];
  cards: number;
};

const typeLetters: Record<Question['type'], string> = {
  choice: 'c',
  code: 'x',
};
const letterTypes = Object.fromEntries(
  Object.entries(typeLetters).map(([type, letter]) => [letter, type]),
) as Record<string, Question['type']>;

export interface EncodedIndex {
  courses: Course[];
  units: Unit[];
  skills: EncodedSkill[];
}

const pointId = (skillId: string, point: number) => `${skillId}-kp${point + 1}`;
const pointQuestionId = (skillId: string, point: number, question: number) =>
  `${pointId(skillId, point)}-q${question + 1}`;
const cardId = (skillId: string, card: number) => `${skillId}-card${card + 1}`;

export function encodeIndex(index: CatalogIndex): EncodedIndex {
  return {
    courses: index.courses,
    units: index.units,
    skills: index.skills.map((skill) => {
      const { knowledgePoints, questions, flashcards, ...rest } = skill;
      knowledgePoints?.forEach((point, p) => {
        if (
          point.id !== pointId(skill.id, p) ||
          point.questions.some(
            (question, q) => question.id !== pointQuestionId(skill.id, p, q),
          )
        )
          throw new Error(
            `${point.id}: knowledge point IDs must be generated.`,
          );
      });
      flashcards.forEach((card, c) => {
        if (card.id !== cardId(skill.id, c))
          throw new Error(`${card.id}: flashcard IDs must be generated.`);
      });
      return {
        ...rest,
        ...(knowledgePoints
          ? {
              points: knowledgePoints.map((point) =>
                point.questions.map(({ type }) => typeLetters[type]).join(''),
              ),
            }
          : {}),
        questions: questions.map(({ id, type }) => [id, type]),
        cards: flashcards.length,
      };
    }),
  };
}

export function decodeIndex(encoded: EncodedIndex): CatalogIndex {
  return indexOf(
    encoded.courses,
    encoded.units,
    encoded.skills.map(({ points, questions, cards, ...skill }) =>
      outlineSkill({
        ...skill,
        ...(points
          ? {
              knowledgePoints: points.map((types, p) => ({
                id: pointId(skill.id, p),
                questions: [...types].map((letter, q) => ({
                  id: pointQuestionId(skill.id, p, q),
                  type: letterTypes[letter],
                })),
              })),
            }
          : {}),
        questions: questions.map(([id, type]) => ({ id, type })),
        flashcards: Array.from({ length: cards }, (_, c) => ({
          id: cardId(skill.id, c),
        })),
      }),
    ),
  );
}
