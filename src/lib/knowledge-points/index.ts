import type {
  ChoiceQuestion,
  CodeQuestion,
  KnowledgePoint,
  LessonExample,
  Skill,
} from '../curriculum';

export type QuestionDraft =
  Omit<ChoiceQuestion, 'id'> | Omit<CodeQuestion, 'id'>;

export interface KnowledgePointDraft {
  title: string;
  explanation: string[];
  example: LessonExample;
  questions: QuestionDraft[];
}

/** One authored file: knowledge points keyed by the skill they teach. */
export type KnowledgePointModule = Record<string, KnowledgePointDraft[]>;

// Each course keeps its knowledge points in `*.kp.ts` files beside this one,
// so independently authored courses never edit a shared registry.
const modules = import.meta.glob<KnowledgePointModule>('./*.kp.ts', {
  eager: true,
  import: 'knowledgePoints',
});

const registry = new Map<
  string,
  { file: string; drafts: KnowledgePointDraft[] }
>();
const duplicates: string[] = [];
for (const [file, module] of Object.entries(modules))
  for (const [skillId, drafts] of Object.entries(module)) {
    if (registry.has(skillId))
      duplicates.push(
        `${skillId}: knowledge points defined in ${registry.get(skillId)!.file} and ${file}.`,
      );
    registry.set(skillId, { file, drafts });
  }

/** Skill IDs with authored knowledge points, for catalog validation. */
export const knowledgePointSkillIds = [...registry.keys()];
export const knowledgePointRegistryErrors = duplicates;

/** Stable IDs: `<skill>-kp<n>` and `<skill>-kp<n>-q<m>`. */
export function attachKnowledgePoints(skill: Skill): Skill {
  const authored = registry.get(skill.id);
  if (!authored) return skill;
  const knowledgePoints: KnowledgePoint[] = authored.drafts.map(
    (draft, index) => {
      const id = `${skill.id}-kp${index + 1}`;
      return {
        ...draft,
        id,
        questions: draft.questions.map((question, questionIndex) => ({
          ...question,
          id: `${id}-q${questionIndex + 1}`,
        })),
      };
    },
  );
  return { ...skill, knowledgePoints };
}

/** Authoring helper for a choice question whose answer is the program output. */
export function predictOutput(
  prompt: string,
  code: string,
  choices: string[],
  answer: number,
  explanation: string,
): Omit<ChoiceQuestion, 'id'> {
  return {
    type: 'choice',
    prompt,
    code,
    choices,
    answer,
    explanation,
    hint: explanation,
    checksOutput: true,
  };
}

/** Authoring helper for a conceptual choice question. */
export function choose(
  prompt: string,
  choices: string[],
  answer: number,
  explanation: string,
  code?: string,
): Omit<ChoiceQuestion, 'id'> {
  return {
    type: 'choice',
    prompt,
    choices,
    answer,
    explanation,
    hint: explanation,
    ...(code ? { code } : {}),
  };
}
