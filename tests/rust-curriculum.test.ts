import { describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { rustCatalog, rustTopicStages } from '../src/lib/courses/rust';
import { rustDefinitions } from '../src/lib/courses/rust/content';
import { validateCurriculum } from '../src/lib/curriculum';
import {
  applyAttempt,
  emptyProgress,
  getSkillState,
  isUnlocked,
  nextTask,
  type Progress,
} from '../src/lib/learning';

const NOW = Date.parse('2026-10-02T15:00:00Z');
const catalog = rustCatalog;

function learnAll(): Progress {
  let progress = emptyProgress();
  for (let index = 0; index < catalog.skills.length; index++) {
    const task = nextTask(progress, NOW, 'rust', catalog);
    expect(task?.mode).toBe('learn');
    const skill = catalog.skills.find((item) => item.id === task!.skillId)!;
    for (const question of skill.questions)
      progress = applyAttempt(
        progress,
        {
          skillId: skill.id,
          questionId: question.id,
          correct: true,
          mode: 'learn',
        },
        NOW,
        catalog,
      );
  }
  expect(nextTask(progress, NOW, 'rust', catalog)).toBeNull();
  return progress;
}

describe('atomic Rust course', () => {
  it('provides 128 focused skills with valid prerequisite and four-stage graph contracts', () => {
    expect(validateCurriculum(catalog.skills, catalog)).toEqual([]);
    expect(catalog.skills).toHaveLength(128);
    expect(catalog.units).toHaveLength(10);
    expect(Object.keys(rustTopicStages)).toHaveLength(32);
    expect(catalog.skills.flatMap((skill) => skill.questions)).toHaveLength(
      512,
    );
    expect(catalog.skills.flatMap((skill) => skill.flashcards)).toHaveLength(
      256,
    );
    expect(
      catalog.skills
        .filter((skill) => !skill.prerequisites.length)
        .map((skill) => skill.id),
    ).toEqual(['rust-main']);
    for (const [topicId, sequence] of Object.entries(rustTopicStages)) {
      expect(sequence).toHaveLength(4);
      for (const [index, id] of sequence.entries()) {
        const skill = catalog.skills.find((item) => item.id === id)!;
        expect(skill.topicId).toBe(topicId);
        expect(skill.stage).toBe(index + 1);
        expect(skill.stageCount).toBe(4);
        if (index) expect(skill.prerequisites).toContain(sequence[index - 1]);
        expect(skill.questions.map((question) => question.type)).toEqual([
          'choice',
          'choice',
          'choice',
          'code',
        ]);
        expect(skill.lesson.example.language).toBe('rust');
        expect(skill.lesson.example.code).toContain('fn main()');
        expect(skill.questions[3]).toMatchObject({
          language: 'rust',
          type: 'code',
        });
        const exercise = skill.questions[3];
        if (exercise.type !== 'code')
          throw new Error(`${id} has no code contract`);
        const definition = rustDefinitions.find(
          (item) => `rust-${item.slug}` === id,
        )!;
        expect(exercise.contract?.trim().length).toBeGreaterThan(0);
        expect(exercise.contract).toBe(definition.testCode);
        expect(exercise.contract).toBe(exercise.tests);
        expect(exercise.prompt).not.toContain('```');
        for (const question of skill.questions)
          if (question.type === 'choice')
            expect(new Set(question.choices).size).toBe(
              question.choices.length,
            );
      }
    }
  });

  it('requires independent code evidence, reaches every skill, and keeps learner review schedules separate', () => {
    let learner = emptyProgress();
    const first = catalog.skills[0];
    for (const question of first.questions.slice(0, 3))
      learner = applyAttempt(
        learner,
        {
          skillId: first.id,
          questionId: question.id,
          correct: true,
          mode: 'learn',
        },
        NOW,
        catalog,
      );
    expect(getSkillState(learner, first.id).mastery).toBeLessThan(1);
    expect(isUnlocked(learner, 'rust-format', catalog)).toBe(false);
    learner = applyAttempt(
      learner,
      {
        skillId: first.id,
        questionId: first.questions[3].id,
        correct: true,
        mode: 'learn',
      },
      NOW,
      catalog,
    );
    expect(isUnlocked(learner, 'rust-format', catalog)).toBe(true);
    const complete = learnAll();
    for (const skill of catalog.skills)
      expect(getSkillState(complete, skill.id).mastery).toBe(1);
    const due = getSkillState(complete, first.id).dueAt!;
    const memory = getSkillState(complete, first.id).memory;
    let reviewed = applyAttempt(
      complete,
      {
        skillId: first.id,
        questionId: first.questions[0].id,
        correct: true,
        mode: 'review',
      },
      due,
      catalog,
    );
    expect(getSkillState(reviewed, first.id).dueAt).toBe(due);
    expect(getSkillState(reviewed, first.id).memory).toEqual(memory);
    reviewed = applyAttempt(
      reviewed,
      {
        skillId: first.id,
        questionId: first.questions[3].id,
        correct: true,
        mode: 'review',
      },
      due,
      catalog,
    );
    expect(getSkillState(reviewed, first.id).dueAt).toBeGreaterThan(due);
    expect(getSkillState(reviewed, first.id).memory?.reps).toBe(
      (memory?.reps ?? 0) + 1,
    );
    expect(getSkillState(complete, first.id).dueAt).toBe(due);
    expect(nextTask(emptyProgress(), NOW, 'rust', catalog)?.skillId).toBe(
      'rust-main',
    );
    expect(isUnlocked(emptyProgress(), 'rust-frame-stream', catalog)).toBe(
      false,
    );
  });

  it('blocks dependents after failed retrieval while preserving an unrelated mastered branch', () => {
    const progress = learnAll();
    const ancestor = catalog.skills.find(
      (skill) => skill.id === 'rust-trait-impl',
    )!;
    const due = getSkillState(progress, ancestor.id).dueAt!;
    const failed = applyAttempt(
      progress,
      {
        skillId: ancestor.id,
        questionId: ancestor.questions[0].id,
        correct: false,
        mode: 'review',
      },
      due,
      catalog,
    );
    expect(isUnlocked(failed, 'rust-trait-objects', catalog)).toBe(false);
    expect(isUnlocked(failed, 'rust-frame-stream', catalog)).toBe(false);
    expect(isUnlocked(failed, 'rust-vec-extend', catalog)).toBe(true);
    expect(getSkillState(failed, 'rust-frame-stream').mastery).toBe(1);
    const repaired = applyAttempt(
      failed,
      {
        skillId: ancestor.id,
        questionId: ancestor.questions[0].id,
        correct: true,
        mode: 'learn',
      },
      due,
      catalog,
    );
    expect(isUnlocked(repaired, 'rust-frame-stream', catalog)).toBe(true);
  });

  it('keeps hinted Rust work out of mastery and ignores repeated event delivery', () => {
    const first = catalog.skills[0];
    let progress = emptyProgress();
    for (const question of first.questions.slice(0, 3))
      progress = applyAttempt(
        progress,
        {
          skillId: first.id,
          questionId: question.id,
          correct: true,
          mode: 'learn',
        },
        NOW,
        catalog,
      );
    progress = applyAttempt(
      progress,
      {
        skillId: first.id,
        questionId: first.questions[3].id,
        correct: true,
        usedHint: true,
        mode: 'learn',
        attemptId: 'rust-hinted-answer',
      },
      NOW,
      catalog,
    );
    expect(getSkillState(progress, first.id).mastery).toBeLessThan(1);
    expect(getSkillState(progress, first.id).dueAt).toBeNull();
    const repeated = applyAttempt(
      progress,
      {
        skillId: first.id,
        questionId: first.questions[3].id,
        correct: true,
        mode: 'learn',
        attemptId: 'rust-hinted-answer',
      },
      NOW,
      catalog,
    );
    expect(repeated).toBe(progress);
    const completed = applyAttempt(
      progress,
      {
        skillId: first.id,
        questionId: first.questions[3].id,
        correct: true,
        mode: 'learn',
        attemptId: 'rust-independent-answer',
      },
      NOW,
      catalog,
    );
    expect(getSkillState(completed, first.id).mastery).toBe(1);
    expect(isUnlocked(completed, 'rust-format', catalog)).toBe(true);
  });

  it('compiles all trusted solutions/examples in batches and rejects every starter and empty submission', () => {
    const directory = mkdtempSync(join(tmpdir(), 'lessdumb-rust-curriculum-'));
    const exercises = catalog.skills.map((skill) => {
      const question = skill.questions.find((item) => item.type === 'code');
      if (!question || question.type !== 'code')
        throw new Error(`${skill.id} has no exercise`);
      return { skill, question };
    });
    function compile(name: string, source: string, expectSuccess = true) {
      const path = join(directory, `${name}.rs`);
      const binary = join(directory, name);
      writeFileSync(
        path,
        `#![allow(dead_code, unused_variables, unused_mut)]\n${source}`,
      );
      const result = spawnSync(
        'rustc',
        ['--edition=2021', path, '-o', binary],
        { encoding: 'utf8', timeout: 60_000, maxBuffer: 8 * 1024 * 1024 },
      );
      if (expectSuccess)
        expect(result.status, result.stderr || String(result.error)).toBe(0);
      else
        expect(
          result.status,
          'invalid learner definitions must not compile',
        ).not.toBe(0);
      return { binary, result };
    }
    function run(binary: string) {
      const result = spawnSync(binary, [], {
        encoding: 'utf8',
        timeout: 30_000,
        maxBuffer: 8 * 1024 * 1024,
      });
      expect(result.status, result.stderr || String(result.error)).toBe(0);
      return result.stdout;
    }
    try {
      const module = (body: string, tests: string, index: number) =>
        `mod skill_${index} {\n${body}\n${tests.replace('fn main()', 'pub fn verify()')}\n}`;
      const calls = exercises
        .map((_, index) => `skill_${index}::verify();`)
        .join('\n');
      const solutions = exercises
        .map(({ question }, index) =>
          module(question.solution, question.tests, index),
        )
        .join('\n');
      run(compile('solutions', `${solutions}\nfn main() { ${calls} }`).binary);
      const unit = exercises.find(
        ({ skill }) => skill.id === 'rust-unit',
      )!.question;
      const invalidUnit = compile(
        'unit-is-not-an-integer',
        `${unit.solution.replace('(result, value)', '(value, value)')}\n${unit.tests}`,
        false,
      );
      expect(invalidUnit.result.stderr).toContain('expected `()`, found `i32`');
      const drop = exercises.find(
        ({ skill }) => skill.id === 'rust-drop',
      )!.question;
      const invalidDrop = compile(
        'cannot-reuse-a-dropped-string',
        `${drop.solution.replace('    replacement\n}', '    obsolete\n}')}\n${drop.tests}`,
        false,
      );
      expect(invalidDrop.result.stderr).toContain(
        'use of moved value: `obsolete`',
      );
      const starters = exercises
        .map(({ question }, index) =>
          module(question.starterCode, question.tests, index),
        )
        .join('\n');
      const failures = exercises
        .map(
          (_, index) =>
            `assert!(std::panic::catch_unwind(skill_${index}::verify).is_err(), "starter ${index} unexpectedly passed");`,
        )
        .join('\n');
      run(
        compile(
          'starters',
          `${starters}\nfn main() { std::panic::set_hook(Box::new(|_| {})); ${failures} }`,
        ).binary,
      );
      const empty = exercises
        .map(({ question }, index) => module('', question.tests, index))
        .join('\n');
      const rejected = compile(
        'empty',
        `${empty}\nfn main() { ${calls} }`,
        false,
      );
      for (const { question } of exercises) {
        const functionName = question.solution.match(/fn\s+(\w+)/)?.[1];
        expect(functionName).toBeTruthy();
        expect(rejected.result.stderr).toContain(
          `cannot find function \`${functionName}\``,
        );
      }
      const examples = catalog.skills
        .map(
          (skill, index) =>
            `mod example_${index} { ${skill.lesson.example.code.replace('fn main()', 'pub fn run()')} }`,
        )
        .join('\n');
      const exampleCalls = catalog.skills
        .map(
          (_, index) =>
            `println!("EXAMPLE_${index}"); example_${index}::run();`,
        )
        .join('\n');
      const output = run(
        compile('examples', `${examples}\nfn main() { ${exampleCalls} }`)
          .binary,
      )
        .trim()
        .split('\n');
      expect(output).toHaveLength(catalog.skills.length * 2);
      for (const [index, skill] of catalog.skills.entries()) {
        expect(output[index * 2]).toBe(`EXAMPLE_${index}`);
        expect(output[index * 2 + 1]).toBe(skill.lesson.example.output);
      }
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }, 60_000);
});
