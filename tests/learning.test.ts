import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import {
  skills as allSkills,
  skillById,
  validateCurriculum,
  type CurriculumCatalog,
  type Skill,
} from '../src/lib/curriculum';
import {
  applyAttempt,
  DAY_MS,
  dateKey,
  emptyProgress,
  earnedFlashcards,
  getSkillState,
  getStats,
  isMastered,
  isUnlocked,
  lessonState,
  nextTask,
  recordLesson,
  selectQuestion,
  type Progress,
} from '../src/lib/learning';
import { earnedXp, lessonXp, REVIEW_XP } from '../src/lib/xp';
import { lessonAnswerIds, masterSkill } from './helpers/mastery';

const skills = allSkills.filter((s) => s.courseId === 'python-foundations');
const allFlashcards = skills.flatMap((s) => s.flashcards);
const NOW = Date.parse('2026-10-01T16:00:00Z');
function fresh() {
  return emptyProgress(NOW, 'America/Bogota');
}
function master(progress: Progress, skillId: string, now = NOW): Progress {
  return masterSkill(progress, skillId, now);
}

function subjectCatalog(): CurriculumCatalog {
  const math: Skill = {
    id: 'fixture-addition',
    courseId: 'fixture-math',
    domain: 'mathematics',
    unitId: 'fixture-arithmetic',
    title: 'Addition',
    summary: 'Combine small quantities.',
    prerequisites: [],
    order: 0,
    estimatedMinutes: 3,
    lesson: {
      paragraphs: ['Addition combines quantities.'],
      example: { code: '', output: '3', explanation: 'One plus two is three.' },
    },
    questions: [
      {
        id: 'fixture-addition-q1',
        type: 'choice',
        prompt: '1 + 2 = ?',
        choices: ['2', '3'],
        answer: 1,
        explanation: 'One plus two is three.',
        hint: 'Count two more after one.',
      },
      {
        id: 'fixture-addition-q2',
        type: 'choice',
        prompt: '2 + 2 = ?',
        choices: ['3', '4'],
        answer: 1,
        explanation: 'Two plus two is four.',
        hint: 'Count two more after two.',
      },
      {
        id: 'fixture-addition-q3',
        type: 'choice',
        prompt: '3 + 2 = ?',
        choices: ['5', '6'],
        answer: 0,
        explanation: 'Three plus two is five.',
        hint: 'Count two more after three.',
      },
    ],
    flashcards: [],
  };
  const language: Skill = {
    id: 'fixture-number-words',
    courseId: 'fixture-language',
    domain: 'language',
    unitId: 'fixture-vocabulary',
    title: 'Number words',
    summary: 'Connect quantities to words.',
    prerequisites: [math.id],
    order: 1,
    estimatedMinutes: 3,
    lesson: {
      paragraphs: ['Number words describe quantities.'],
      example: {
        code: '',
        output: 'three',
        explanation: 'The word three names the quantity 3.',
      },
    },
    questions: [
      {
        id: 'fixture-number-words-q1',
        type: 'choice',
        prompt: 'Which word names 3?',
        choices: ['three', 'five'],
        answer: 0,
        explanation: 'Three names 3.',
        hint: 'Read the numeral aloud.',
      },
      {
        id: 'fixture-number-words-q2',
        type: 'choice',
        prompt: 'Which word names 4?',
        choices: ['two', 'four'],
        answer: 1,
        explanation: 'Four names 4.',
        hint: 'Read the numeral aloud.',
      },
    ],
    flashcards: [],
    assessment: { requiredTypes: ['choice'], reviewAnswers: 1 },
  };
  return {
    skills: [math, language],
    courses: [
      {
        id: math.courseId,
        title: 'Fixture math',
        description: 'Test-only catalog.',
        domain: 'mathematics',
        skillIds: [math.id],
      },
      {
        id: language.courseId,
        title: 'Fixture language',
        description: 'Test-only catalog.',
        domain: 'language',
        skillIds: [language.id],
      },
    ],
    units: [
      {
        id: math.unitId,
        title: 'Arithmetic',
        description: 'Test-only unit.',
        courseId: math.courseId,
      },
      {
        id: language.unitId,
        title: 'Vocabulary',
        description: 'Test-only unit.',
        courseId: language.courseId,
      },
    ],
  };
}

describe('curriculum integrity', () => {
  it('provides a complete original Python graph with executable exercises', () => {
    expect(validateCurriculum()).toEqual([]);
    expect(skills).toHaveLength(48);
    expect(skills.flatMap((skill) => skill.questions)).toHaveLength(192);
    expect(allFlashcards).toHaveLength(96);
    expect(
      skills.every(
        (skill) =>
          skill.lesson.paragraphs.length >= 2 && skill.lesson.example.code,
      ),
    ).toBe(true);
  });

  it('detects a missing prerequisite and a prerequisite cycle', () => {
    const missing: Skill[] = [
      { ...skills[0], prerequisites: ['missing-node'] },
    ];
    expect(
      validateCurriculum(missing).some((error) =>
        error.includes('unknown prerequisite'),
      ),
    ).toBe(true);
    const cycle: Skill[] = [
      { ...skills[0], prerequisites: [skills[1].id] },
      { ...skills[1], prerequisites: [skills[0].id] },
    ];
    expect(
      validateCurriculum(cycle).some((error) => error.includes('cycle')),
    ).toBe(true);
  });

  it('executes every reference solution against its real Python assertions', () => {
    const exercises = skills.flatMap((skill) =>
      skill.questions.filter((question) => question.type === 'code'),
    );
    const runner = `import contextlib, io, json, sys, traceback
questions = json.load(sys.stdin)
failures = []
for question in questions:
    namespace = {}
    output = io.StringIO()
    try:
        with contextlib.redirect_stdout(output):
            exec(question['solution'], namespace)
        namespace['__lessdumb_output'] = output.getvalue()
        exec(question['tests'], namespace)
    except Exception:
        failures.append(question['id'] + ': ' + traceback.format_exc())
print(json.dumps({'exercises': len(questions), 'failures': failures}))
sys.exit(1 if failures else 0)
`;
    const result = spawnSync('python3', ['-c', runner], {
      input: JSON.stringify(exercises),
      encoding: 'utf8',
      timeout: 10_000,
    });
    expect(
      result.error,
      'Native Python is required to verify curriculum solutions.',
    ).toBeUndefined();
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({ exercises: 48, failures: [] });
  });

  it('verifies every displayed example produces its documented output', () => {
    const runner = `import contextlib, io, json, sys
examples = json.load(sys.stdin)
failures = []
for example in examples:
    output = io.StringIO()
    with contextlib.redirect_stdout(output):
        exec(example['code'], {})
    if output.getvalue().strip() != example['output'].strip():
        failures.append({'id': example['id'], 'actual': output.getvalue(), 'expected': example['output']})
print(json.dumps(failures))
sys.exit(1 if failures else 0)
`;
    const result = spawnSync('python3', ['-c', runner], {
      input: JSON.stringify(
        skills.map((skill) => ({ id: skill.id, ...skill.lesson.example })),
      ),
      encoding: 'utf8',
      timeout: 10_000,
    });
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual([]);
  });

  it('verifies executable multiple-choice output predictions', () => {
    const questions = skills.flatMap((skill) =>
      skill.questions.filter(
        (question) => question.type === 'choice' && question.code,
      ),
    );
    const runner = `import contextlib, io, json, sys
questions = json.load(sys.stdin)
failures = []
checked = 0
for question in questions:
    # This is an intentional infinite-loop diagnosis, not an output-prediction item.
    if question['id'] == 'while-loops-q3':
        continue
    output = io.StringIO()
    with contextlib.redirect_stdout(output):
        exec(question['code'], {})
    actual = output.getvalue().strip()
    if question['id'] == 'for-loops-q1':
        actual = str(len(actual.splitlines()))
    expected = question['choices'][question['answer']]
    if actual != expected:
        failures.append({'id': question['id'], 'actual': actual, 'expected': expected})
    checked += 1
print(json.dumps({'checked': checked, 'failures': failures}))
sys.exit(1 if failures else 0)
`;
    const result = spawnSync('python3', ['-c', runner], {
      input: JSON.stringify(questions),
      encoding: 'utf8',
      timeout: 10_000,
    });
    expect(result.status, result.stdout + result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({ checked: 66, failures: [] });
  });
});

const PRINT = skillById['print-output'];
const [P1, P2] = PRINT.knowledgePoints!;
const PRINT_CODE = PRINT.questions.find(
  (question) => question.type === 'code',
)!;
const PRINT_LESSON_XP = earnedXp(lessonXp(PRINT), 0, true);

function answer(
  progress: Progress,
  questionId: string,
  correct = true,
  at = NOW,
  mode: 'learn' | 'review' = 'learn',
  skillId = 'print-output',
  usedHint = false,
) {
  return applyAttempt(
    progress,
    { skillId, questionId, correct, mode, usedHint },
    at,
  );
}

/** Answer a due review cycle correctly with the engine's own selections. */
function review(progress: Progress, skillId: string, at: number) {
  const skill = skillById[skillId];
  const cycle = getSkillState(progress, skillId).reviewCount;
  let result = progress;
  for (
    let index = 0;
    getSkillState(result, skillId).reviewCount === cycle && index < 8;
    index++
  )
    result = answer(
      result,
      selectQuestion(result, skill, 'review').id,
      true,
      at,
      'review',
      skillId,
    );
  return result;
}

describe('mastery and the prerequisite frontier', () => {
  it('starts at the first prerequisite-ready skill and refuses locked submissions', () => {
    const progress = fresh();
    expect(nextTask(progress, NOW)?.skillId).toBe('print-output');
    expect(isUnlocked(progress, 'variables')).toBe(false);
    expect(() => recordLesson(progress, 'variables', NOW)).toThrow(
      'prerequisites',
    );
    expect(() =>
      applyAttempt(
        progress,
        {
          skillId: 'variables',
          questionId: 'variables-kp1-q1',
          correct: true,
          mode: 'learn',
        },
        NOW,
      ),
    ).toThrow('prerequisites');
  });

  it('requires distinct point evidence and a correct unassisted code exercise', () => {
    let progress = fresh();
    for (let i = 0; i < 10; i++)
      progress = answer(progress, P1.questions[0].id);
    // Repeating one correct choice cannot pass a point.
    expect(lessonState(progress, PRINT).current?.id).toBe(P1.id);
    progress = answer(progress, P1.questions[1].id);
    progress = answer(progress, P2.questions[0].id);
    progress = answer(progress, P2.questions[1].id);
    expect(lessonState(progress, PRINT).current?.id).toBe(PRINT_CODE.id);
    progress = answer(
      progress,
      PRINT_CODE.id,
      true,
      NOW,
      'learn',
      'print-output',
      true,
    );
    expect(isMastered(progress, 'print-output')).toBe(false);
    expect(progress.totalXp).toBe(0);
    progress = answer(progress, PRINT_CODE.id);
    expect(isMastered(progress, 'print-output')).toBe(true);
    expect(isUnlocked(progress, 'variables')).toBe(true);
    expect(progress.totalXp).toBe(PRINT_LESSON_XP);
    expect(earnedFlashcards(progress)).toHaveLength(2);
  });

  it('does not unlock prerequisites from a forged numeric mastery value', () => {
    const progress = fresh();
    progress.skills['print-output'] = {
      ...getSkillState(progress, 'print-output'),
      mastery: 1,
    };
    expect(isUnlocked(progress, 'variables')).toBe(false);
  });

  it('serves unseen variants before returning to a missed question', () => {
    let progress = fresh();
    const first = nextTask(progress, NOW)!;
    expect(first.questionId).toBe(P1.questions[0].id);
    progress = applyAttempt(progress, { ...first, correct: false }, NOW);
    expect(nextTask(progress, NOW)?.questionId).toBe(P1.questions[1].id);
    progress = answer(progress, P1.questions[1].id);
    progress = answer(progress, P1.questions[2].id);
    expect(nextTask(progress, NOW)?.questionId).toBe(P2.questions[0].id);
    for (const question of P2.questions.slice(0, 3))
      progress = answer(progress, question.id, false);
    // The failed lesson restarts at its first point: the unseen variant
    // first, then the least-practiced one that was missed.
    expect(nextTask(progress, NOW, 'python-foundations')?.questionId).toBe(
      P1.questions[3].id,
    );
    progress = answer(progress, P1.questions[3].id);
    expect(nextTask(progress, NOW, 'python-foundations')?.questionId).toBe(
      P1.questions[0].id,
    );
  });

  it('remediates the actual failed skill without deleting ancestor evidence', () => {
    let progress = master(master(fresh(), 'print-output'), 'variables');
    progress = applyAttempt(
      progress,
      {
        skillId: 'variables',
        questionId: selectQuestion(progress, skillById['variables'], 'review')
          .id,
        correct: false,
        mode: 'review',
      },
      NOW + DAY_MS,
    );
    expect(isMastered(progress, 'print-output')).toBe(true);
    expect(isMastered(progress, 'variables')).toBe(false);
    expect(isUnlocked(progress, 'numbers')).toBe(false);
    // The due prerequisite review comes first; finish it to reveal the remediation task.
    expect(nextTask(progress, NOW + DAY_MS)).toMatchObject({
      skillId: 'print-output',
      mode: 'review',
    });
    progress = review(progress, 'print-output', NOW + DAY_MS);
    expect(nextTask(progress, NOW + DAY_MS)?.skillId).toBe('variables');
    expect(nextTask(progress, NOW + DAY_MS)?.mode).toBe('learn');
    const xpBefore = progress.totalXp;
    progress = masterSkill(progress, 'variables', NOW + DAY_MS);
    expect(progress.totalXp).toBe(xpBefore);
    expect(isMastered(progress, 'variables')).toBe(true);
  });

  it('adapts a deep prerequisite path to two learners with different retention histories', () => {
    const shared = master(
      master(master(fresh(), 'print-output'), 'variables'),
      'numbers',
    );
    const original = JSON.stringify(shared);
    const missed = P1.questions[2].id;
    const lapse = answer(shared, missed, false, NOW + DAY_MS, 'review');
    const retained = review(shared, 'print-output', NOW + DAY_MS);

    expect(isMastered(lapse, 'variables')).toBe(true);
    expect(isMastered(lapse, 'numbers')).toBe(true);
    expect(isUnlocked(lapse, 'numbers')).toBe(false);
    expect(isUnlocked(retained, 'numbers')).toBe(true);
    const repair = nextTask(lapse, NOW + DAY_MS, 'python-foundations')!;
    expect(repair).toMatchObject({ skillId: 'print-output', mode: 'learn' });
    expect(P1.questions.map((question) => question.id)).toContain(
      repair.questionId,
    );
    // Both dependents are due; reviewing numbers also credits variables,
    // so review compression takes numbers first.
    expect(
      nextTask(retained, NOW + DAY_MS, 'python-foundations'),
    ).toMatchObject({
      skillId: 'numbers',
      mode: 'review',
    });
    expect(() => recordLesson(lapse, 'numbers', NOW + DAY_MS)).toThrow(
      'prerequisites',
    );
    expect(() =>
      applyAttempt(
        lapse,
        {
          skillId: 'numbers',
          questionId: 'numbers-kp1-q1',
          correct: true,
          mode: 'learn',
        },
        NOW + DAY_MS,
      ),
    ).toThrow('prerequisites');

    // Repair passes the missed point again; the other point and code keep their evidence.
    let repaired = applyAttempt(
      lapse,
      { ...repair, correct: true },
      NOW + DAY_MS,
    );
    expect(isUnlocked(repaired, 'numbers')).toBe(false);
    repaired = answer(
      repaired,
      selectQuestion(repaired, PRINT, 'learn').id,
      true,
      NOW + DAY_MS,
    );
    expect(isUnlocked(repaired, 'numbers')).toBe(true);
    expect(repaired.totalXp).toBe(lapse.totalXp);
    expect(JSON.stringify(shared)).toBe(original);
  });

  it('distinguishes independent evidence from hints despite identical answer accuracy', () => {
    let independent = fresh();
    let assisted = fresh();
    for (const questionId of lessonAnswerIds('print-output')) {
      const input = {
        skillId: 'print-output',
        questionId,
        correct: true,
        mode: 'learn' as const,
      };
      independent = applyAttempt(independent, input, NOW);
      assisted = applyAttempt(
        assisted,
        { ...input, usedHint: questionId === PRINT_CODE.id },
        NOW,
      );
    }
    expect(getStats(independent, NOW).accuracy).toBe(1);
    expect(getStats(assisted, NOW).accuracy).toBe(1);
    expect(independent.attempts).toHaveLength(assisted.attempts.length);
    expect(nextTask(independent, NOW, 'python-foundations')).toMatchObject({
      skillId: 'variables',
      mode: 'learn',
    });
    expect(nextTask(assisted, NOW, 'python-foundations')).toMatchObject({
      skillId: 'print-output',
      questionId: PRINT_CODE.id,
      mode: 'learn',
    });
    expect(getSkillState(independent, 'print-output').dueAt).toBe(NOW + DAY_MS);
    expect(getSkillState(assisted, 'print-output').dueAt).toBeNull();
  });

  it('can reach every skill from the graph without manually unlocking nodes', () => {
    let progress = fresh();
    let answers = 0;
    for (; answers < 1000; answers++) {
      const task = nextTask(progress, NOW, 'python-foundations');
      if (!task) break;
      progress = applyAttempt(progress, { ...task, correct: true }, NOW);
    }
    expect(getStats(progress, NOW).mastered).toBe(48);
    expect(nextTask(progress, NOW, 'python-foundations')).toBeNull();
    expect(answers).toBe(
      skills.reduce((sum, skill) => sum + lessonAnswerIds(skill.id).length, 0),
    );
    expect(earnedFlashcards(progress)).toHaveLength(96);
  });
});

describe('spaced retrieval, XP and dates', () => {
  it('requires due, distinct retrieval and executable evidence before advancing a review', () => {
    let progress = master(fresh(), 'print-output');
    const initialDue = getSkillState(progress, 'print-output').dueAt;
    progress = answer(progress, PRINT_CODE.id, true, NOW + 1000, 'review');
    expect(progress.totalXp).toBe(PRINT_LESSON_XP);
    expect(getSkillState(progress, 'print-output').dueAt).toBe(initialDue);
    expect(getStats(progress, NOW + DAY_MS).dueCount).toBe(1);
    const task = nextTask(progress, NOW + DAY_MS)!;
    expect(task.mode).toBe('review');
    expect(P1.questions.map((question) => question.id)).toContain(
      task.questionId,
    );
    progress = applyAttempt(progress, { ...task, correct: true }, NOW + DAY_MS);
    // Repeating an answer adds nothing to the cycle.
    progress = applyAttempt(progress, { ...task, correct: true }, NOW + DAY_MS);
    expect(getSkillState(progress, 'print-output').reviewQuestionIds).toEqual([
      task.questionId,
    ]);
    expect(progress.totalXp).toBe(PRINT_LESSON_XP);
    progress = answer(
      progress,
      selectQuestion(progress, PRINT, 'review').id,
      true,
      NOW + DAY_MS,
      'review',
    );
    // Two points covered, but the code exercise is still required.
    expect(getSkillState(progress, 'print-output').reviewCount).toBe(0);
    expect(selectQuestion(progress, PRINT, 'review').id).toBe(PRINT_CODE.id);
    progress = answer(progress, PRINT_CODE.id, true, NOW + DAY_MS, 'review');
    expect(getSkillState(progress, 'print-output').reviewCount).toBe(1);
    expect(getSkillState(progress, 'print-output').intervalDays).toBe(7);
    expect(getSkillState(progress, 'print-output').dueAt).toBe(
      NOW + 8 * DAY_MS,
    );
    expect(progress.totalXp).toBe(
      PRINT_LESSON_XP + earnedXp(REVIEW_XP, 0, true),
    );
    expect(getStats(progress, NOW + DAY_MS).dueCount).toBe(0);
  });

  it('interleaves due skills and never schedules a child with an unmastered prerequisite', () => {
    let progress = master(master(fresh(), 'print-output'), 'variables');
    let task = nextTask(progress, NOW + DAY_MS)!;
    progress = applyAttempt(progress, { ...task, correct: true }, NOW + DAY_MS);
    expect(nextTask(progress, NOW + DAY_MS)?.skillId).not.toBe(task.skillId);
    progress = answer(
      progress,
      P2.questions[3].id,
      false,
      NOW + DAY_MS,
      'review',
    );
    task = nextTask(progress, NOW + DAY_MS)!;
    expect(task.skillId).toBe('print-output');
    expect(task.mode).toBe('learn');
  });

  it('keeps reading old hinted review answers without counting them', () => {
    let progress = master(fresh(), 'print-output');
    const first = nextTask(progress, NOW + DAY_MS)!;
    progress = applyAttempt(
      progress,
      { ...first, correct: true, usedHint: true },
      NOW + DAY_MS,
    );
    expect(getSkillState(progress, 'print-output').reviewQuestionIds).toEqual(
      [],
    );
    expect(getSkillState(progress, 'print-output').reviewHadHint).toBe(true);
    // The next question is another unseen variant of the same point.
    const next = nextTask(progress, NOW + DAY_MS)!;
    expect(next.questionId).not.toBe(first.questionId);
    expect(P1.questions.map((question) => question.id)).toContain(
      next.questionId,
    );
    progress = review(progress, 'print-output', NOW + DAY_MS);
    // A cycle that needed help is graded Hard, not Good.
    expect(getSkillState(progress, 'print-output').intervalDays).toBeLessThan(
      7,
    );
  });

  it('restarts spacing after a lapse instead of using lifetime reviews as current strength', () => {
    let established = master(fresh(), 'print-output');
    for (let i = 0; i < 4; i++)
      established = review(
        established,
        'print-output',
        getSkillState(established, 'print-output').dueAt!,
      );
    expect(
      getSkillState(established, 'print-output').intervalDays,
    ).toBeGreaterThan(30);
    const lapseTime = getSkillState(established, 'print-output').dueAt!;
    const retained = review(established, 'print-output', lapseTime);
    let recovered = answer(
      established,
      PRINT_CODE.id,
      false,
      lapseTime,
      'review',
    );
    recovered = answer(recovered, PRINT_CODE.id, true, lapseTime);
    expect(getSkillState(recovered, 'print-output').intervalDays).toBe(1);
    expect(getSkillState(recovered, 'print-output').reviewCount).toBe(4);
    recovered = review(recovered, 'print-output', lapseTime + DAY_MS);

    expect(getSkillState(retained, 'print-output').reviewCount).toBe(5);
    expect(getSkillState(recovered, 'print-output').reviewCount).toBe(5);
    expect(getSkillState(recovered, 'print-output').memory!.lapses).toBe(1);
    expect(
      getSkillState(recovered, 'print-output').memory!.stability,
    ).toBeLessThan(getSkillState(retained, 'print-output').memory!.stability);
    expect(getSkillState(recovered, 'print-output').intervalDays).toBeLessThan(
      getSkillState(retained, 'print-output').intervalDays,
    );
    expect(getSkillState(recovered, 'print-output').dueAt).toBe(
      lapseTime +
        DAY_MS +
        getSkillState(recovered, 'print-output').intervalDays * DAY_MS,
    );
  });

  it('keeps updates immutable and rejects unknown questions', () => {
    const original = fresh();
    const serialized = JSON.stringify(original);
    const updated = answer(original, P1.questions[0].id);
    expect(JSON.stringify(original)).toBe(serialized);
    expect(updated).not.toBe(original);
    expect(() => answer(updated, 'variables-q1')).toThrow('does not belong');
  });

  it('counts streaks by the learner calendar and breaks after a missed day', () => {
    expect(dateKey('2026-10-02T02:00:00Z', 'America/Bogota')).toBe(
      '2026-10-01',
    );
    let progress = answer(fresh(), P1.questions[0].id, true, NOW);
    progress = answer(progress, P1.questions[1].id, true, NOW + 1000);
    expect(progress.streak).toBe(1);
    progress = answer(progress, P2.questions[0].id, true, NOW + DAY_MS);
    expect(progress.streak).toBe(2);
    expect(getStats(progress, NOW + 3 * DAY_MS).streak).toBe(0);
    progress = answer(progress, P2.questions[1].id, true, NOW + 3 * DAY_MS);
    progress = answer(progress, PRINT_CODE.id, true, NOW + 3 * DAY_MS);
    expect(progress.streak).toBe(1);
    // The lesson's XP belongs to the day it was completed.
    expect(getStats(progress, NOW + 3 * DAY_MS).todayXp).toBe(PRINT_LESSON_XP);
    expect(getStats(progress, NOW + DAY_MS).todayXp).toBe(0);
    expect(
      getStats(progress, NOW + 3 * DAY_MS, 'unknown-course').totalSkills,
    ).toBe(0);
  });
});

describe('subject-specific catalogs and assessment policies', () => {
  it('validates choice-only skills and cross-course prerequisites without adding public courses', () => {
    const catalog = subjectCatalog();
    expect(validateCurriculum(catalog.skills, catalog)).toEqual([]);
    expect(nextTask(fresh(), NOW, 'fixture-language', catalog)?.skillId).toBe(
      'fixture-addition',
    );
    expect(nextTask(fresh(), NOW, undefined, catalog)?.skillId).toBe(
      'fixture-addition',
    );
    expect(skills).toHaveLength(48);
    const cyclic = {
      ...catalog,
      skills: [
        { ...catalog.skills[0], prerequisites: [catalog.skills[1].id] },
        catalog.skills[1],
      ],
    };
    expect(
      validateCurriculum(cyclic.skills, cyclic).some((error) =>
        error.includes('cycle'),
      ),
    ).toBe(true);
  });

  it('masters and reviews mathematics through distinct choice evidence with no Python requirement', () => {
    const catalog = subjectCatalog();
    let progress = fresh();
    const math = catalog.skills[0];
    for (const question of math.questions)
      progress = applyAttempt(
        progress,
        {
          skillId: math.id,
          questionId: question.id,
          correct: true,
          mode: 'learn',
        },
        NOW,
        catalog,
      );
    expect(isMastered(progress, math.id, catalog)).toBe(true);
    expect(isUnlocked(progress, catalog.skills[1].id, catalog)).toBe(true);
    expect(getStats(progress, NOW, math.courseId, catalog).mastered).toBe(1);
    const first = nextTask(progress, NOW + DAY_MS, math.courseId, catalog)!;
    expect(first.mode).toBe('review');
    progress = applyAttempt(
      progress,
      { ...first, correct: true },
      NOW + DAY_MS,
      catalog,
    );
    expect(getSkillState(progress, math.id).reviewCount).toBe(0);
    const second = nextTask(progress, NOW + DAY_MS, math.courseId, catalog)!;
    expect(second.questionId).not.toBe(first.questionId);
    progress = applyAttempt(
      progress,
      { ...second, correct: true },
      NOW + DAY_MS,
      catalog,
    );
    expect(getSkillState(progress, math.id).reviewCount).toBe(1);
    expect(getSkillState(progress, math.id).dueAt).toBe(NOW + 8 * DAY_MS);
  });

  it('honors a declared one-answer language review policy and rejects impossible policies', () => {
    const catalog = subjectCatalog();
    let progress = fresh();
    for (const item of catalog.skills)
      for (const question of item.questions)
        progress = applyAttempt(
          progress,
          {
            skillId: item.id,
            questionId: question.id,
            correct: true,
            mode: 'learn',
          },
          NOW,
          catalog,
        );
    const language = catalog.skills[1];
    const task = nextTask(progress, NOW + DAY_MS, language.courseId, catalog)!;
    progress = applyAttempt(
      progress,
      { ...task, correct: true },
      NOW + DAY_MS,
      catalog,
    );
    expect(getSkillState(progress, language.id).reviewCount).toBe(1);
    expect(
      getStats(progress, NOW + DAY_MS, language.courseId, catalog).dueCount,
    ).toBe(0);
    const impossible = {
      ...language,
      assessment: { requiredTypes: ['code' as const], reviewAnswers: 1 },
    };
    expect(
      validateCurriculum([catalog.skills[0], impossible], catalog).some(
        (error) => error.includes('missing required assessment type code'),
      ),
    ).toBe(true);
  });
});
