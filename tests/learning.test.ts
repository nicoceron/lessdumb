import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import {
  skills,
  skillById,
  allFlashcards,
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
  nextTask,
  recordLesson,
  type Progress,
} from '../src/lib/learning';

const NOW = Date.parse('2026-10-01T16:00:00Z');
function fresh() {
  return emptyProgress(NOW, 'America/Bogota');
}
function master(progress: Progress, skillId: string, now = NOW): Progress {
  let result = progress;
  for (const question of skillById[skillId].questions)
    result = applyAttempt(
      result,
      { skillId, questionId: question.id, correct: true, mode: 'learn' },
      now,
    );
  return result;
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
    expect(skills).toHaveLength(24);
    expect(skills.flatMap((skill) => skill.questions)).toHaveLength(96);
    expect(allFlashcards).toHaveLength(48);
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
    expect(JSON.parse(result.stdout)).toEqual({ exercises: 24, failures: [] });
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
    expect(JSON.parse(result.stdout)).toEqual({ checked: 26, failures: [] });
  });
});

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
          questionId: 'variables-q1',
          correct: true,
          mode: 'learn',
        },
        NOW,
      ),
    ).toThrow('prerequisites');
  });

  it('requires distinct choice evidence and a correct unassisted code exercise', () => {
    let progress = fresh();
    for (let i = 0; i < 10; i++)
      progress = applyAttempt(
        progress,
        {
          skillId: 'print-output',
          questionId: 'print-output-q1',
          correct: true,
          mode: 'learn',
        },
        NOW,
      );
    expect(isMastered(progress, 'print-output')).toBe(false);
    expect(progress.totalXp).toBe(10);
    for (const id of ['print-output-q2', 'print-output-q3'])
      progress = applyAttempt(
        progress,
        {
          skillId: 'print-output',
          questionId: id,
          correct: true,
          mode: 'learn',
        },
        NOW,
      );
    progress = applyAttempt(
      progress,
      {
        skillId: 'print-output',
        questionId: 'print-output-q4',
        correct: true,
        mode: 'learn',
        usedHint: true,
      },
      NOW,
    );
    expect(isMastered(progress, 'print-output')).toBe(false);
    expect(progress.totalXp).toBe(30);
    progress = applyAttempt(
      progress,
      {
        skillId: 'print-output',
        questionId: 'print-output-q4',
        correct: true,
        mode: 'learn',
      },
      NOW,
    );
    expect(isMastered(progress, 'print-output')).toBe(true);
    expect(isUnlocked(progress, 'variables')).toBe(true);
    expect(progress.totalXp).toBe(45);
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

  it('serves unattempted questions before returning to a failed question', () => {
    let progress = fresh();
    const first = nextTask(progress, NOW)!;
    progress = applyAttempt(progress, { ...first, correct: false }, NOW);
    expect(nextTask(progress, NOW)?.questionId).toBe('print-output-q2');
    for (const id of ['print-output-q2', 'print-output-q3', 'print-output-q4'])
      progress = applyAttempt(
        progress,
        {
          skillId: 'print-output',
          questionId: id,
          correct: true,
          mode: 'learn',
        },
        NOW,
      );
    expect(nextTask(progress, NOW)?.questionId).toBe('print-output-q1');
  });

  it('remediates the actual failed skill without deleting ancestor evidence', () => {
    let progress = master(master(fresh(), 'print-output'), 'variables');
    progress = applyAttempt(
      progress,
      {
        skillId: 'variables',
        questionId: 'variables-q1',
        correct: false,
        mode: 'review',
      },
      NOW + DAY_MS,
    );
    expect(isMastered(progress, 'print-output')).toBe(true);
    expect(isMastered(progress, 'variables')).toBe(false);
    expect(isUnlocked(progress, 'numbers')).toBe(false);
    // The due prerequisite review comes first; finish it to reveal the remediation task.
    for (const id of ['print-output-q4', 'print-output-q2'])
      progress = applyAttempt(
        progress,
        {
          skillId: 'print-output',
          questionId: id,
          correct: true,
          mode: 'review',
        },
        NOW + DAY_MS,
      );
    expect(nextTask(progress, NOW + DAY_MS)?.skillId).toBe('variables');
    expect(nextTask(progress, NOW + DAY_MS)?.mode).toBe('learn');
    const xpBefore = progress.totalXp;
    progress = applyAttempt(
      progress,
      {
        skillId: 'variables',
        questionId: 'variables-q1',
        correct: true,
        mode: 'learn',
      },
      NOW + DAY_MS,
    );
    expect(progress.totalXp).toBe(xpBefore);
    expect(isMastered(progress, 'variables')).toBe(true);
  });

  it('can reach every skill from the graph without manually unlocking nodes', () => {
    let progress = fresh();
    for (let i = 0; i < 96; i++) {
      const task = nextTask(progress, NOW);
      expect(task, `The graph stalled after ${i} answers.`).not.toBeNull();
      progress = applyAttempt(progress, { ...task!, correct: true }, NOW);
    }
    expect(getStats(progress, NOW).mastered).toBe(24);
    expect(nextTask(progress, NOW)).toBeNull();
    expect(earnedFlashcards(progress)).toHaveLength(48);
  });
});

describe('spaced retrieval, XP and dates', () => {
  it('requires due, distinct retrieval and executable evidence before advancing a review', () => {
    let progress = master(fresh(), 'print-output');
    const initialDue = getSkillState(progress, 'print-output').dueAt;
    progress = applyAttempt(
      progress,
      {
        skillId: 'print-output',
        questionId: 'print-output-q4',
        correct: true,
        mode: 'review',
      },
      NOW + 1000,
    );
    expect(progress.totalXp).toBe(45);
    expect(getSkillState(progress, 'print-output').dueAt).toBe(initialDue);
    expect(getStats(progress, NOW + DAY_MS).dueCount).toBe(1);
    const task = nextTask(progress, NOW + DAY_MS)!;
    expect(task.mode).toBe('review');
    expect(task.questionId).toBe('print-output-q4');
    progress = applyAttempt(progress, { ...task, correct: true }, NOW + DAY_MS);
    const reviewXp = progress.totalXp;
    progress = applyAttempt(progress, { ...task, correct: true }, NOW + DAY_MS);
    expect(progress.totalXp).toBe(reviewXp);
    expect(getSkillState(progress, 'print-output').reviewCount).toBe(0);
    progress = applyAttempt(
      progress,
      {
        skillId: 'print-output',
        questionId: 'print-output-q1',
        correct: true,
        mode: 'review',
      },
      NOW + DAY_MS,
    );
    expect(getSkillState(progress, 'print-output').reviewCount).toBe(1);
    expect(getSkillState(progress, 'print-output').intervalDays).toBe(3);
    expect(getSkillState(progress, 'print-output').dueAt).toBe(
      NOW + 4 * DAY_MS,
    );
    expect(getStats(progress, NOW + DAY_MS).dueCount).toBe(0);
  });

  it('interleaves due skills and never schedules a child with an unmastered prerequisite', () => {
    let progress = master(master(fresh(), 'print-output'), 'variables');
    let task = nextTask(progress, NOW + DAY_MS)!;
    progress = applyAttempt(progress, { ...task, correct: true }, NOW + DAY_MS);
    expect(nextTask(progress, NOW + DAY_MS)?.skillId).not.toBe(task.skillId);
    progress = applyAttempt(
      progress,
      {
        skillId: 'print-output',
        questionId: 'print-output-q1',
        correct: false,
        mode: 'review',
      },
      NOW + DAY_MS,
    );
    task = nextTask(progress, NOW + DAY_MS)!;
    expect(task.skillId).toBe('print-output');
    expect(task.mode).toBe('learn');
  });

  it('rotates through unseen review questions after a hinted answer', () => {
    let progress = master(fresh(), 'print-output');
    const first = nextTask(progress, NOW + DAY_MS)!;
    expect(first.questionId).toBe('print-output-q4');
    progress = applyAttempt(
      progress,
      { ...first, correct: true, usedHint: true },
      NOW + DAY_MS,
    );
    expect(nextTask(progress, NOW + DAY_MS)?.questionId).toBe(
      'print-output-q1',
    );
    expect(getSkillState(progress, 'print-output').reviewQuestionIds).toEqual(
      [],
    );
  });

  it('keeps updates immutable and rejects unknown questions', () => {
    const original = fresh();
    const serialized = JSON.stringify(original);
    const updated = applyAttempt(
      original,
      {
        skillId: 'print-output',
        questionId: 'print-output-q1',
        correct: true,
        mode: 'learn',
      },
      NOW,
    );
    expect(JSON.stringify(original)).toBe(serialized);
    expect(updated).not.toBe(original);
    expect(() =>
      applyAttempt(
        updated,
        {
          skillId: 'print-output',
          questionId: 'variables-q1',
          correct: true,
          mode: 'learn',
        },
        NOW,
      ),
    ).toThrow('does not belong');
  });

  it('counts streaks by the learner calendar and breaks after a missed day', () => {
    expect(dateKey('2026-10-02T02:00:00Z', 'America/Bogota')).toBe(
      '2026-10-01',
    );
    let progress = applyAttempt(
      fresh(),
      {
        skillId: 'print-output',
        questionId: 'print-output-q1',
        correct: true,
        mode: 'learn',
      },
      NOW,
    );
    progress = applyAttempt(
      progress,
      {
        skillId: 'print-output',
        questionId: 'print-output-q2',
        correct: true,
        mode: 'learn',
      },
      NOW + 1000,
    );
    expect(progress.streak).toBe(1);
    progress = applyAttempt(
      progress,
      {
        skillId: 'print-output',
        questionId: 'print-output-q3',
        correct: true,
        mode: 'learn',
      },
      NOW + DAY_MS,
    );
    expect(progress.streak).toBe(2);
    expect(getStats(progress, NOW + 3 * DAY_MS).streak).toBe(0);
    progress = applyAttempt(
      progress,
      {
        skillId: 'print-output',
        questionId: 'print-output-q4',
        correct: true,
        mode: 'learn',
      },
      NOW + 3 * DAY_MS,
    );
    expect(progress.streak).toBe(1);
    expect(getStats(progress, NOW + 3 * DAY_MS).todayXp).toBe(15);
    expect(
      getStats(progress, NOW + 3 * DAY_MS, 'unknown-course').totalSkills,
    ).toBe(0);
  });
});

describe('subject-specific catalogs and assessment policies', () => {
  it('validates choice-only skills and cross-course prerequisites without adding public courses', () => {
    const catalog = subjectCatalog();
    expect(validateCurriculum(catalog.skills, catalog)).toEqual([]);
    expect(nextTask(fresh(), NOW, 'fixture-language', catalog)).toBeNull();
    expect(nextTask(fresh(), NOW, undefined, catalog)?.skillId).toBe(
      'fixture-addition',
    );
    expect(skills).toHaveLength(24);
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
    expect(getSkillState(progress, math.id).dueAt).toBe(NOW + 4 * DAY_MS);
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
