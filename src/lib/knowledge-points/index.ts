import type { KnowledgePoint, Skill } from '../curriculum';
import type { KnowledgePointDraft, KnowledgePointModule } from './authoring';
import { knowledgePoints as competitive1 } from './competitive-1.kp';
import { knowledgePoints as competitive2 } from './competitive-2.kp';
import { knowledgePoints as cpp1 } from './cpp-1.kp';
import { knowledgePoints as pythonFoundations } from './python-foundations.kp';
import { knowledgePoints as rust1 } from './rust-1.kp';

export * from './authoring';

// Each course keeps its knowledge points in its own `*.kp.ts` file. Register
// every file here; a catalog test fails if a file in this folder is missing.
const modules: Record<string, KnowledgePointModule> = {
  'competitive-1.kp.ts': competitive1,
  'competitive-2.kp.ts': competitive2,
  'cpp-1.kp.ts': cpp1,
  'python-foundations.kp.ts': pythonFoundations,
  'rust-1.kp.ts': rust1,
};

/** Registered file names, checked against the folder by the catalog tests. */
export const knowledgePointFiles = Object.keys(modules);

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
