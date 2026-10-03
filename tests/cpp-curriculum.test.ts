import { describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { cppTopicStages } from '../src/lib/courses/cpp';
// The course with its knowledge points, as a lesson loads it.
import cppCatalog from '../src/lib/content/cpp';
import { validateCurriculum } from '../src/lib/curriculum';
import {
  applyAttempt,
  coursePath,
  getSkillState,
  isMastered,
  isUnlocked,
  nextTask,
  selectQuestion,
  type Progress,
} from '../src/lib/learning';
import { createState } from '../src/lib/state';
import { masterSkill } from './helpers/mastery';

const NOW = Date.parse('2026-10-02T15:00:00Z');
const skillById = Object.fromEntries(
  cppCatalog.skills.map((skill) => [skill.id, skill]),
);

function master(progress: Progress, id: string): Progress {
  let result = progress;
  for (const prerequisite of skillById[id].prerequisites)
    if (getSkillState(result, prerequisite).mastery < 1)
      result = master(result, prerequisite);
  return masterSkill(result, id, NOW, cppCatalog);
}

describe('granular C++20 curriculum', () => {
  it('has 54 complete four-stage topics with original compilable evidence', () => {
    expect(validateCurriculum(cppCatalog.skills, cppCatalog)).toEqual([]);
    expect(cppCatalog.courses[0].id).toBe('cpp');
    expect(cppCatalog.courses[0].language).toBe('cpp');
    expect(cppCatalog.units).toHaveLength(12);
    expect(cppCatalog.skills).toHaveLength(216);
    expect(Object.keys(cppTopicStages)).toHaveLength(54);
    const byId = Object.fromEntries(
      cppCatalog.skills.map((skill) => [skill.id, skill]),
    );
    for (const [topicId, ids] of Object.entries(cppTopicStages)) {
      expect(ids).toHaveLength(4);
      expect(ids[3]).toBe(topicId);
      ids.forEach((id, index) => {
        const skill = byId[id];
        expect(skill.topicId).toBe(topicId);
        expect(skill.stage).toBe(index + 1);
        expect(skill.stageCount).toBe(4);
        expect(skill.topicTitle).toBeTruthy();
        expect(skill.lesson.example.language).toBe('cpp');
        expect(skill.lesson.example.kind).not.toBe('text');
        expect(skill.lesson.example.code).toContain('int main()');
        // Choice practice comes from knowledge points; the exercise keeps
        // its original ID.
        expect(skill.knowledgePoints?.length).toBeGreaterThan(0);
        expect(skill.questions.map((question) => question.id)).toEqual([
          `${id}-q4`,
        ]);
        const question = skill.questions[0];
        if (question.type !== 'code') throw new Error('Missing C++ evidence');
        expect(question.language).toBe('cpp');
        expect(question.solution).not.toContain('int main()');
        expect(question.solution).not.toContain('bits/stdc++.h');
        expect(question.tests).toContain('int main()');
        expect(question.tests).toContain('assert(');
        expect(question.contract).toBe(question.tests);
        expect(question.prompt).toContain('The contract checks below');
        expect(question.prompt).not.toContain(
          'all boundary cases in the tests',
        );
        expect(question.starterCode).toContain('static_assert(false');
        expect(skill.flashcards).toHaveLength(2);
      });
    }
    const reference = byId['cpp-references'].questions[0];
    if (reference.type !== 'code')
      throw new Error('Missing returned-reference exercise');
    expect(reference.starterCode).toContain('int& solve(int& value)');
    expect(reference.contract).toContain('assert(&alias == &value);');
    expect(reference.contract).toContain('assert(value == 7);');
    expect(reference.contract).toContain('solve(negative) = -1;');
    expect(reference.solution).not.toContain('std::vector');
  });

  it('requires real native-language foundations and connects all application ancestors', () => {
    const path = coursePath('cpp', cppCatalog);
    expect(path).toHaveLength(216);
    expect(new Set(path.map((skill) => skill.courseId))).toEqual(
      new Set(['cpp']),
    );
    for (const id of [
      'cpp-integer-values',
      'cpp-unique-allocation',
      'cpp-reference-alias',
      'cpp-reallocation-invalidation',
      'cpp-release-acquire',
      'cpp-ring-buffer',
      'cpp-order-book',
      'cpp-protocol',
      'cpp-determinism',
    ])
      expect(path.some((skill) => skill.id === id)).toBe(true);
    const state = createState();
    expect(nextTask(state.progress, NOW, 'cpp', cppCatalog)?.skillId).toBe(
      'cpp-integer-values',
    );
    expect(isUnlocked(state.progress, 'cpp-ring-buffer', cppCatalog)).toBe(
      false,
    );
    expect(isUnlocked(state.progress, 'cpp-release-acquire', cppCatalog)).toBe(
      false,
    );
  });

  it('unlocks consumers from the operations they use rather than from course position', () => {
    const thread = skillById['cpp-thread-join'];
    expect(thread.prerequisites).toEqual(['cpp-lambda-reference-capture']);
    let progress = master(createState().progress, 'cpp-lambda-value-capture');
    expect(isUnlocked(progress, thread.id, cppCatalog)).toBe(false);
    progress = master(progress, 'cpp-lambda-reference-capture');
    expect(isUnlocked(progress, thread.id, cppCatalog)).toBe(true);
    const ancestors = (id: string): Set<string> =>
      new Set(
        skillById[id].prerequisites.flatMap((parent) => [
          parent,
          ...ancestors(parent),
        ]),
      );
    // Address arithmetic and contract assertions need no lambdas or algorithms.
    for (const id of ['cpp-page-offset', 'cpp-assert-contract']) {
      expect(ancestors(id).has('cpp-lambdas')).toBe(false);
      expect(ancestors(id).has('cpp-algorithms')).toBe(false);
    }
    // Copying a vector really uses vector element access.
    expect(ancestors('cpp-independent-copy').has('cpp-vector-elements')).toBe(
      true,
    );
    const access = skillById['cpp-vector-elements'].questions[0];
    if (access.type !== 'code')
      throw new Error('Missing checked vector contract');
    expect(access.contract).toContain('assert(solve({}, 0) == -1);');
    expect(validateCurriculum(cppCatalog.skills, cppCatalog)).toEqual([]);
  });

  it('needs independent choice and code evidence before unlocking the next atom and creating retention memory', () => {
    const [first, second] = cppTopicStages['cpp-values'];
    const skill = skillById[first];
    const exercise = skill.questions[0];
    let progress = createState().progress;
    // Pass every knowledge point; the code exercise is the last step.
    for (
      let question = selectQuestion(progress, skill, 'learn');
      question.id !== exercise.id;
      question = selectQuestion(progress, skill, 'learn')
    )
      progress = applyAttempt(
        progress,
        {
          skillId: first,
          questionId: question.id,
          correct: true,
          mode: 'learn',
        },
        NOW,
        cppCatalog,
      );
    expect(isMastered(progress, first, cppCatalog)).toBe(false);
    expect(getSkillState(progress, first).mastery).toBeLessThan(1);
    expect(getSkillState(progress, first).memory).toBeUndefined();
    expect(isUnlocked(progress, second, cppCatalog)).toBe(false);
    progress = applyAttempt(
      progress,
      {
        skillId: first,
        questionId: exercise.id,
        correct: true,
        mode: 'learn',
      },
      NOW,
      cppCatalog,
    );
    expect(getSkillState(progress, first).mastery).toBe(1);
    expect(getSkillState(progress, first).memory?.algorithm).toBe('fsrs-6');
    expect(isUnlocked(progress, second, cppCatalog)).toBe(true);
    expect(createState().progress.skills[first]).toBeUndefined();
  });

  it('blocks a dependent application after an ancestor failure without erasing saved descendant evidence', () => {
    let progress = master(createState().progress, 'cpp-ring-buffer');
    const retained = getSkillState(progress, 'cpp-ring-buffer').questionIds;
    const ancestor = skillById['cpp-release-acquire'];
    progress = applyAttempt(
      progress,
      {
        skillId: ancestor.id,
        questionId: ancestor.questions[0].id,
        correct: false,
        mode: 'review',
      },
      NOW + 86_400_000,
      cppCatalog,
    );
    expect(isUnlocked(progress, 'cpp-ring-buffer', cppCatalog)).toBe(false);
    expect(getSkillState(progress, 'cpp-ring-buffer').questionIds).toEqual(
      retained,
    );
    expect(getSkillState(progress, ancestor.id).mastery).toBeLessThan(1);
  });

  it('executes every native reference/example and independently rejects all unfinished and empty submissions', () => {
    const candidates = process.env.CXX
      ? [process.env.CXX]
      : process.platform === 'darwin'
        ? ['clang++', 'g++']
        : ['g++', 'clang++'];
    const compiler = candidates
      .map((command) => ({
        command,
        version: spawnSync(command, ['--version'], {
          encoding: 'utf8',
          timeout: 5_000,
        }),
      }))
      .find(({ version }) => version.status === 0);
    if (!compiler)
      throw new Error(
        'Native C++20 compiler required: set CXX or install clang++/g++.',
      );
    const clang = /clang/i.test(compiler.version.stdout);
    const directory = mkdtempSync(join(tmpdir(), 'lessdumb-cpp-curriculum-'));
    const exercises = cppCatalog.skills.map((skill) => {
      const question = skill.questions.find((item) => item.type === 'code');
      if (!question || question.type !== 'code')
        throw new Error(`${skill.id} has no compiled C++ exercise.`);
      return { skill, question };
    });
    // Headers belong at global scope; wrapping a standard header inside an atom namespace would alter std.
    const includePattern = /^#include[^\n]*$/gm;
    const headers = [
      ...new Set(
        exercises.flatMap(({ skill, question }) =>
          [
            question.solution,
            question.starterCode,
            question.tests,
            skill.lesson.example.code,
          ].flatMap((code) => code.match(includePattern) ?? []),
        ),
      ),
    ]
      .sort()
      .join('\n');
    const stripHeaders = (code: string) => code.replace(includePattern, '');
    const flags = [
      '-std=c++20',
      '-pthread',
      '-UNDEBUG',
      '-fdiagnostics-color=never',
    ];

    function compile(name: string, source: string, expectSuccess = true) {
      const path = join(directory, `${name}.cpp`);
      const binary = join(directory, name);
      writeFileSync(path, `${headers}\n${source}`);
      const options = expectSuccess
        ? ['-O0', path, '-o', binary]
        : ['-fsyntax-only', clang ? '-ferror-limit=0' : '-fmax-errors=0', path];
      const result = spawnSync(compiler!.command, [...flags, ...options], {
        encoding: 'utf8',
        timeout: 60_000,
        maxBuffer: 8 * 1024 * 1024,
        env: { ...process.env, LC_ALL: 'C' },
      });
      expect(result.error, `${name}: ${String(result.error)}`).toBeUndefined();
      if (expectSuccess)
        expect(result.status, `${name}: ${result.stderr}`).toBe(0);
      else {
        expect(
          result.status,
          `${name} must reject every unimplemented operation`,
        ).not.toBe(0);
        // Unlimited diagnostics plus a per-skill #line file prove each operation failed, not merely one aggregate compile.
        for (const { skill } of exercises)
          expect(
            result.stderr,
            `${skill.id}: ${name} unexpectedly compiled`,
          ).toMatch(new RegExp(`${skill.id}:\\d+:\\d+: error:`));
      }
      return binary;
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
    function module(body: string, harness: string, id: string, index: number) {
      return `#line 1 "${id}"\nnamespace skill_${index} {\n${stripHeaders(body)}\n${stripHeaders(harness).replace('int main()', 'void verify()')}\n}`;
    }
    const calls = exercises
      .map((_, index) => `skill_${index}::verify();`)
      .join('\n');
    try {
      const references = exercises
        .map(({ skill, question }, index) =>
          module(question.solution, question.tests, skill.id, index),
        )
        .join('\n');
      run(compile('references', `${references}\nint main() { ${calls} }`));
      const examples = exercises
        .map(
          ({ skill }, index) =>
            `#line 1 "${skill.id}"\nnamespace example_${index} {\n${stripHeaders(skill.lesson.example.code).replace('int main()', 'void run()')}\n}`,
        )
        .join('\n');
      const exampleCalls = exercises
        .map(
          ({ skill }, index) =>
            `std::cout << "@@${skill.id}@@\\n"; example_${index}::run();`,
        )
        .join('\n');
      const output = run(
        compile('examples', `${examples}\nint main() { ${exampleCalls} }`),
      );
      expect(output).toBe(
        exercises
          .map(
            ({ skill }) => `@@${skill.id}@@\n${skill.lesson.example.output}\n`,
          )
          .join(''),
      );
      const starters = exercises
        .map(({ skill, question }, index) =>
          module(question.starterCode, question.tests, skill.id, index),
        )
        .join('\n');
      compile('unfinished', `${starters}\nint main() { ${calls} }`, false);
      const empty = exercises
        .map(({ skill, question }, index) =>
          module('', question.tests, skill.id, index),
        )
        .join('\n');
      compile('empty', `${empty}\nint main() { ${calls} }`, false);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }, 120_000);
});
