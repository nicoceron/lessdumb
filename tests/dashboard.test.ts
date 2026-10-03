import { describe, expect, it } from 'vitest';
import { courses, skillById, skills } from '../src/lib/curriculum';
import {
  applyAttempt,
  coursePath,
  DAY_MS,
  emptyProgress,
  getSkillState,
  nextTask,
  type Progress,
} from '../src/lib/learning';
import {
  addDays,
  courseMastery,
  courseOutline,
  courseSequence,
  estimateCompletion,
  formatClockTime,
  formatDayHeading,
  formatMonthYear,
  groupByDay,
  remainingLessonXp,
  taskHistory,
  taskQueue,
  weekXp,
} from '../src/lib/dashboard';
import { lessonXp, REVIEW_XP } from '../src/lib/xp';

// Thursday afternoon in Bogotá (UTC-5).
const NOW = Date.parse('2026-10-01T16:00:00Z');
const ZONE = 'America/Bogota';
const fresh = () => emptyProgress(NOW, ZONE);

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
function masterPath(progress: Progress, skillId: string, now = NOW) {
  let result = progress;
  const done = new Set<string>();
  const visit = (id: string) => {
    if (done.has(id)) return;
    done.add(id);
    skillById[id].prerequisites.forEach(visit);
    result = master(result, id, now);
  };
  visit(skillId);
  return result;
}
/** Answer one choice and the code question, the default review evidence. */
function passReview(progress: Progress, skillId: string, now: number) {
  const skill = skillById[skillId];
  let result = progress;
  for (const question of [
    skill.questions.find((q) => q.type === 'choice')!,
    skill.questions.find((q) => q.type === 'code')!,
  ])
    result = applyAttempt(
      result,
      { skillId, questionId: question.id, correct: true, mode: 'review' },
      now,
    );
  return result;
}

describe('task queue', () => {
  it('starts with the scheduler’s next lesson and shows up to five tasks', () => {
    const tasks = taskQueue(fresh(), 'python-foundations', NOW);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].skill.id).toBe(
      nextTask(fresh(), NOW, 'python-foundations')!.skillId,
    );
    expect(tasks[0]).toMatchObject({
      mode: 'learn',
      xp: lessonXp(tasks[0].skill),
      started: false,
      progress: 0,
    });
    const later = masterPath(fresh(), 'strings');
    const queue = taskQueue(later, 'python-foundations', NOW);
    expect(queue.length).toBeGreaterThan(1);
    expect(queue.length).toBeLessThanOrEqual(5);
    expect(queue[0].skill.id).toBe(
      nextTask(later, NOW, 'python-foundations')!.skillId,
    );
    expect(new Set(queue.map((task) => task.skill.id)).size).toBe(queue.length);
    for (const task of queue)
      expect(task.skill.prerequisites.every((id) => later.skills[id])).toBe(
        true,
      );
  });

  it('puts due reviews first with the fixed review XP', () => {
    const progress = master(fresh(), 'print-output');
    const due = NOW + 2 * DAY_MS;
    const tasks = taskQueue(progress, 'python-foundations', due);
    expect(tasks[0]).toMatchObject({ mode: 'review', xp: REVIEW_XP });
    expect(tasks[0].skill.id).toBe('print-output');
    expect(tasks.slice(1).every((task) => task.mode === 'learn')).toBe(true);
  });

  it('labels a started lesson as resumable with its evidence fraction', () => {
    const skill = skillById['print-output'];
    const progress = applyAttempt(
      fresh(),
      {
        skillId: skill.id,
        questionId: skill.questions[0].id,
        correct: true,
        mode: 'learn',
      },
      NOW,
    );
    const [task] = taskQueue(progress, 'python-foundations', NOW);
    expect(task.started).toBe(true);
    expect(task.progress).toBe(1 / skill.questions.length);
  });

  it('draws prerequisite lessons from other courses', () => {
    const [task] = taskQueue(fresh(), 'machine-learning', NOW);
    expect(task.skill.courseId).toBe('python-foundations');
  });
});

describe('XP summaries and completion estimate', () => {
  it('builds the learner’s Sunday-to-Saturday week in their timezone', () => {
    const progress = master(fresh(), 'print-output');
    const week = weekXp(progress, NOW);
    expect(week.map((day) => day.label).join('')).toBe('SMTWTFS');
    expect(week[0].key).toBe('2026-09-27');
    expect(week[4]).toMatchObject({
      key: '2026-10-01',
      today: true,
      xp: progress.totalXp,
    });
    expect(week[5].future).toBe(true);
    // 03:00 UTC on Oct 4 is still Saturday Oct 3 in Bogotá.
    expect(weekXp(progress, Date.parse('2026-10-04T03:00:00Z'))[6].today).toBe(
      true,
    );
  });

  it('divides remaining lesson XP of the course path by the daily goal', () => {
    const remaining = remainingLessonXp(fresh(), 'python-foundations');
    expect(remaining).toBe(
      coursePath('python-foundations').reduce((n, s) => n + lessonXp(s), 0),
    );
    const estimate = estimateCompletion(fresh(), 50, 'python-foundations', NOW);
    const days = Math.ceil(remaining / 50);
    expect(estimate).toEqual({
      status: 'estimated',
      days,
      dateKey: addDays('2026-10-01', days - 1),
    });
    expect(estimateCompletion(fresh(), 0, 'python-foundations', NOW)).toEqual({
      status: 'no-goal',
    });
    expect(formatMonthYear('2026-10-05')).toBe('October 2026');
  });

  it('starts counting tomorrow once today’s goal is met', () => {
    const progress = master(fresh(), 'print-output');
    const goal = progress.totalXp;
    const estimate = estimateCompletion(
      progress,
      goal,
      'python-foundations',
      NOW,
    );
    const days = Math.ceil(
      remainingLessonXp(progress, 'python-foundations') / goal,
    );
    expect(estimate).toEqual({
      status: 'estimated',
      days,
      dateKey: addDays('2026-10-01', days),
    });
  });

  it('reports a finished course path', () => {
    let progress = fresh();
    for (const skill of coursePath('quantitative-foundations'))
      progress = master(progress, skill.id);
    expect(
      estimateCompletion(progress, 50, 'quantitative-foundations', NOW),
    ).toEqual({ status: 'complete' });
    const course = courses.find((c) => c.id === 'quantitative-foundations')!;
    expect(courseMastery(progress, course).percent).toBe(100);
  });
});

describe('task history', () => {
  it('records a completed lesson with earned and possible XP', () => {
    const progress = master(fresh(), 'print-output');
    const [entry] = taskHistory(progress);
    expect(entry).toMatchObject({
      id: 'lesson:print-output',
      kind: 'lesson',
      at: NOW,
      possible: lessonXp(skillById['print-output']),
      earned: progress.attempts.reduce((n, a) => n + a.xp, 0),
    });
  });

  it('records a passed review cycle and omits a failed one', () => {
    let progress = master(fresh(), 'print-output');
    const due = getSkillState(progress, 'print-output').dueAt!;
    progress = passReview(progress, 'print-output', due + 60_000);
    const history = taskHistory(progress);
    expect(history.map((entry) => entry.kind)).toEqual(['review', 'lesson']);
    expect(history[0]).toMatchObject({
      possible: REVIEW_XP,
      at: due + 60_000,
      earned: progress.attempts
        .filter((a) => a.mode === 'review')
        .reduce((n, a) => n + a.xp, 0),
    });

    const second = getSkillState(progress, 'print-output').dueAt!;
    const question = skillById['print-output'].questions[0];
    const failed = applyAttempt(
      progress,
      {
        skillId: 'print-output',
        questionId: question.id,
        correct: false,
        mode: 'review',
      },
      second + 60_000,
    );
    expect(taskHistory(failed)).toHaveLength(2);
  });

  it('omits an unfinished review cycle', () => {
    let progress = master(fresh(), 'print-output');
    const due = getSkillState(progress, 'print-output').dueAt!;
    const choice = skillById['print-output'].questions.find(
      (q) => q.type === 'choice',
    )!;
    progress = applyAttempt(
      progress,
      {
        skillId: 'print-output',
        questionId: choice.id,
        correct: true,
        mode: 'review',
      },
      due + 1,
    );
    expect(taskHistory(progress).map((entry) => entry.kind)).toEqual([
      'lesson',
    ]);
  });

  it('groups by learner-local day and formats Math Academy-style labels', () => {
    let progress = master(fresh(), 'print-output', NOW);
    // 02:00 UTC on Oct 2 is the evening of Oct 1 in Bogotá.
    progress = masterPath(
      progress,
      'variables',
      Date.parse('2026-10-02T02:00:00Z'),
    );
    progress = masterPath(
      progress,
      'numbers',
      Date.parse('2026-10-02T15:00:00Z'),
    );
    const days = groupByDay(taskHistory(progress), ZONE);
    expect(days.map((day) => day.key)).toEqual(['2026-10-02', '2026-10-01']);
    expect(days[1].entries.map((entry) => entry.skill.id)).toEqual([
      'variables',
      'print-output',
    ]);
    expect(formatDayHeading('2026-09-16')).toBe('Wed, Sep 16th, 2026');
    expect(formatDayHeading('2026-10-01')).toBe('Thu, Oct 1st, 2026');
    expect(formatDayHeading('2026-10-12')).toBe('Mon, Oct 12th, 2026');
    expect(formatDayHeading('2026-10-22')).toBe('Thu, Oct 22nd, 2026');
    expect(formatClockTime(NOW, ZONE)).toBe('11:00 AM');
  });
});

describe('course page', () => {
  it('orders the course sequence by cross-course prerequisites', () => {
    expect(courseSequence('machine-learning').map((c) => c.id)).toEqual([
      'python-foundations',
      'quantitative-foundations',
      'python-data-analysis',
      'machine-learning',
    ]);
    expect(courseSequence('rust').map((c) => c.id)).toEqual(['rust']);
    expect(courseSequence('missing')).toEqual([]);
  });

  it('numbers staged skills by unit, topic, and step', () => {
    const outline = courseOutline(fresh(), 'rust');
    const first = outline[0];
    expect(first.number).toBe(1);
    expect(first.topics[0].number).toBe('1.1');
    expect(first.topics[0].skills.map((entry) => entry.number)).toEqual([
      '1.1.1',
      '1.1.2',
      '1.1.3',
      '1.1.4',
    ]);
    expect(first.topics[1].skills[0].number).toBe('1.2.1');
    expect(outline.reduce((n, unit) => n + unit.total, 0)).toBe(
      skills.filter((s) => s.courseId === 'rust').length,
    );
    expect(first.topics[0].skills[0].status).toBe('ready');
    expect(first.topics[0].skills[1].status).toBe('locked');
  });

  it('numbers ordinary skills by unit and position with their status', () => {
    const progress = applyAttempt(
      master(fresh(), 'print-output'),
      {
        skillId: 'variables',
        questionId: skillById['variables'].questions[0].id,
        correct: true,
        mode: 'learn',
      },
      NOW,
    );
    const [unit] = courseOutline(progress, 'python-foundations');
    expect(unit.topics).toHaveLength(1);
    expect(unit.topics[0].title).toBeNull();
    expect(
      unit.topics[0].skills
        .slice(0, 3)
        .map((entry) => [entry.number, entry.status]),
    ).toEqual([
      ['1.1', 'mastered'],
      ['1.2', 'in-progress'],
      ['1.3', expect.stringMatching(/ready|locked/)],
    ]);
    expect(unit.mastered).toBe(1);
  });
});
