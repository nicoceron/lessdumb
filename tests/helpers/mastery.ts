import {
  defaultCatalog,
  skillById,
  type CurriculumCatalog,
} from '../../src/lib/curriculum';
import {
  applyAttempt,
  emptyProgress,
  isMastered,
  selectQuestion,
  type Progress,
} from '../../src/lib/learning';
import { recordLearningAnswer, type LearnerState } from '../../src/lib/state';

const MAX_LESSON_ANSWERS = 64;

/**
 * Master a skill through the real engine by answering its lesson correctly:
 * every knowledge point (two questions each) and the code exercise, or each
 * question of a skill without knowledge points.
 */
export function masterSkill(
  progress: Progress,
  skillId: string,
  at: number | Date | string = Date.now(),
  catalog: CurriculumCatalog = defaultCatalog,
): Progress {
  const skill = catalog.skills.find((candidate) => candidate.id === skillId)!;
  let result = progress;
  for (
    let index = 0;
    !isMastered(result, skillId, catalog) && index < MAX_LESSON_ANSWERS;
    index++
  ) {
    const question = selectQuestion(result, skill, 'learn');
    result = applyAttempt(
      result,
      { skillId, questionId: question.id, correct: true, mode: 'learn' },
      at,
      catalog,
    );
  }
  if (!isMastered(result, skillId, catalog))
    throw new Error(`Could not master ${skillId}.`);
  return result;
}

/** Master a skill and every unmastered prerequisite, ancestors first. */
export function masterWithPrerequisites(
  progress: Progress,
  skillId: string,
  at: number | Date | string = Date.now(),
): Progress {
  if (isMastered(progress, skillId)) return progress;
  let result = progress;
  for (const parent of skillById[skillId].prerequisites)
    result = masterWithPrerequisites(result, parent, at);
  return masterSkill(result, skillId, at);
}

/** Like masterSkill, through recordLearningAnswer so cards are queued too. */
export function masterSkillState(
  state: LearnerState,
  skillId: string,
): LearnerState {
  const skill = skillById[skillId];
  let result = state;
  for (
    let index = 0;
    !isMastered(result.progress, skillId) && index < MAX_LESSON_ANSWERS;
    index++
  ) {
    const question = selectQuestion(result.progress, skill, 'learn');
    result = recordLearningAnswer(result, {
      skillId,
      questionId: question.id,
      correct: true,
      mode: 'learn',
    });
  }
  if (!isMastered(result.progress, skillId))
    throw new Error(`Could not master ${skillId}.`);
  return result;
}

/** Question IDs answered, in order, to master a fresh skill without mistakes. */
export function lessonAnswerIds(skillId: string): string[] {
  const ids: string[] = [];
  const skill = skillById[skillId];
  let state = emptyProgress(0, 'UTC');
  // Prerequisites only gate submissions; seed them so the path can be read.
  for (const parent of skill.prerequisites)
    state = masterWithPrerequisites(state, parent, 0);
  for (
    let index = 0;
    !isMastered(state, skillId) && index < MAX_LESSON_ANSWERS;
    index++
  ) {
    const question = selectQuestion(state, skill, 'learn');
    ids.push(question.id);
    state = applyAttempt(
      state,
      { skillId, questionId: question.id, correct: true, mode: 'learn' },
      0,
    );
  }
  return ids;
}
