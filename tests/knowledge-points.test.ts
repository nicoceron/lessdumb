import { beforeAll, describe, expect, it } from 'vitest';
import { loadPyodide, type PyodideInterface } from 'pyodide';
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  courses,
  generatorFiles,
  knowledgePointFiles,
  multistepFiles,
  skills,
  validateCurriculum,
  validateKnowledgePointRegistry,
  type CodeLanguage,
  type CodeQuestion,
  type Question,
  type Skill,
  type TextQuestion,
} from '../src/lib/curriculum';
import type { PythonResult } from '../src/lib/python';
import { gradeText } from '../src/lib/typed-answer';
import { GENERATOR_SAMPLES, questionVariant } from '../src/lib/variants';
import { pyodideDirectory } from './helpers/pyodide';

// Every worked example and every "what does this print?" question is run, and
// its published output must be exactly what the program prints. A typed output
// question's one accepted answer is that output, and the real output grades
// as correct.
interface Program {
  id: string;
  language: CodeLanguage;
  code: string;
  expected: string;
  typed?: TextQuestion;
}

/** The program printed its published output, and a typed answer accepts it. */
function expectPrinted(program: Program, printed: string | undefined) {
  expect(printed, program.id).toBe(program.expected.trim());
  if (program.typed)
    expect(gradeText(program.typed, printed ?? ''), program.id).toEqual({
      status: 'correct',
    });
}

/**
 * A generated output question runs as authored and as a sample of its
 * variants: the first ones learners meet and a few later ones. The validator
 * checks the structure of all GENERATOR_SAMPLES variants; this proves their
 * answers by running them.
 */
const EXECUTED_VARIANTS = [0, 1, 2, 10, 25, GENERATOR_SAMPLES - 1];
function executedVariants(question: Question): Question[] {
  if (!question.generated || question.type === 'code') return [question];
  return [
    question,
    ...EXECUTED_VARIANTS.map((variant) => questionVariant(question, variant)),
  ];
}
const programId = (question: Question) =>
  question.variant === undefined
    ? question.id
    : `${question.id}#${question.variant}`;

function languageOf(skill: Skill, declared?: CodeLanguage): CodeLanguage {
  const course = courses.find((item) => item.id === skill.courseId);
  return (
    declared ??
    (course?.language === 'rust' || course?.language === 'cpp'
      ? course.language
      : 'python')
  );
}

const programs: Program[] = [];
const exercises: {
  id: string;
  language: CodeLanguage;
  question: CodeQuestion;
}[] = [];
for (const skill of skills)
  for (const point of skill.knowledgePoints ?? []) {
    if (point.example.kind !== 'text')
      programs.push({
        id: `${point.id}-example`,
        language: languageOf(skill, point.example.language),
        code: point.example.code,
        expected: point.example.output,
      });
    for (const authored of point.questions)
      for (const question of executedVariants(authored))
        if (question.type === 'choice' && question.checksOutput)
          programs.push({
            id: programId(question),
            language: languageOf(skill),
            code: question.code!,
            expected: question.choices[question.answer],
          });
        else if (question.type === 'text' && question.checksOutput)
          programs.push({
            id: programId(question),
            language: languageOf(skill),
            code: question.code!,
            expected: question.answers[0],
            typed: question,
          });
        else if (question.type === 'code')
          exercises.push({
            id: question.id,
            language: languageOf(skill, question.language),
            question,
          });
  }
// Multistep problems (CEN-163): a setup's published output, and each output
// part's answer. In Python a part's code runs after the setup's, as one
// program; in Rust and C++ a part's code is a complete program, and a part
// without code asks what the setup's program prints.
for (const skill of skills)
  for (const problem of skill.multistep ?? []) {
    const { setup } = problem;
    const language = languageOf(skill, setup.language);
    if (setup.code && setup.output !== undefined)
      programs.push({
        id: `${problem.id}-setup`,
        language,
        code: setup.code,
        expected: setup.output,
      });
    for (const part of problem.parts) {
      if (!(part.type === 'choice' || part.type === 'text')) continue;
      if (!part.checksOutput) continue;
      const code =
        language === 'python' && setup.code && part.code
          ? `${setup.code}\n\n${part.code}`
          : (part.code ?? setup.code!);
      programs.push(
        part.type === 'choice'
          ? { id: part.id, language, code, expected: part.choices[part.answer] }
          : {
              id: part.id,
              language,
              code,
              expected: part.answers[0],
              typed: part,
            },
      );
    }
  }
const inLanguage = <T extends { language: CodeLanguage }>(
  items: T[],
  language: CodeLanguage,
) => items.filter((item) => item.language === language);
const MARKER = '\u0001';

/** Splits one batch run's stdout into each program's own output. */
function outputs(stdout: string): Map<string, string> {
  const result = new Map<string, string>();
  for (const part of stdout.split(`\n${MARKER}`).slice(1)) {
    const newline = part.indexOf('\n');
    result.set(part.slice(0, newline), part.slice(newline + 1).trim());
  }
  return result;
}

/**
 * The statements written directly in a C++ program's main, without nested
 * blocks, lambda bodies, or the helper functions defined before main.
 */
function mainStatements(code: string): string {
  let depth = 0;
  let statements = '';
  for (const char of code.slice(
    code.indexOf('{', code.search(/\bint main\(\)/)),
  )) {
    if (char === '{') depth += 1;
    else if (char === '}' && --depth === 0) break;
    else if (depth === 1) statements += char;
  }
  return statements;
}

function run(binary: string) {
  const result = spawnSync(binary, [], {
    encoding: 'utf8',
    timeout: 60_000,
    maxBuffer: 32 * 1024 * 1024,
  });
  expect(result.status, result.stderr || String(result.error)).toBe(0);
  return result.stdout;
}

describe('knowledge point registry', () => {
  it('registers every knowledge point file in the folder', () => {
    const files = readdirSync(resolve('src/lib/knowledge-points'))
      .filter((file) => file.endsWith('.kp.ts'))
      .sort();
    expect([...knowledgePointFiles].sort()).toEqual(files);
  });

  it('registers every multistep problem file in the folder', () => {
    const files = readdirSync(resolve('src/lib/knowledge-points'))
      .filter((file) => file.endsWith('.multistep.ts'))
      .sort();
    expect([...multistepFiles].sort()).toEqual(files);
  });

  it('names each catalog skill at most once and validates every point', () => {
    expect(validateKnowledgePointRegistry()).toEqual([]);
    expect(validateCurriculum()).toEqual([]);
  });

  it('registers every question generator file and runs sampled variants', () => {
    const files = readdirSync(resolve('src/lib/knowledge-points'))
      .filter((file) => file.endsWith('.gen.ts'))
      .sort();
    expect(Object.values(generatorFiles).flat().sort()).toEqual(files);
    // Every generated output question contributes its sampled variants.
    const generated = skills.flatMap((skill) =>
      (skill.knowledgePoints ?? []).flatMap((point) =>
        point.questions.filter(
          (question) =>
            question.generated &&
            (question.type === 'text' || question.type === 'choice') &&
            question.checksOutput,
        ),
      ),
    );
    expect(generated.length).toBeGreaterThan(50);
    for (const question of generated)
      for (const variant of EXECUTED_VARIANTS)
        expect(
          programs.some(
            (program) => program.id === `${question.id}#${variant}`,
          ),
          `${question.id}#${variant}`,
        ).toBe(true);
  });

  it('varies at least 40 C++, 40 Rust, and 25 data analysis points and runs them', () => {
    // CEN-162: points with a generated question, and the sampled variants
    // the rustc, clang++, and Pyodide batches below execute for them.
    const varied = (courseId: string) =>
      skills
        .filter((skill) => skill.courseId === courseId)
        .flatMap((skill) => skill.knowledgePoints ?? [])
        .filter((point) => point.questions.some((q) => q.generated));
    const executed = (prefix: string, language: CodeLanguage) =>
      inLanguage(programs, language).filter(
        (program) => program.id.startsWith(prefix) && program.id.includes('#'),
      ).length;
    expect(varied('cpp').length).toBeGreaterThanOrEqual(40);
    expect(varied('rust').length).toBeGreaterThanOrEqual(40);
    expect(varied('python-data-analysis').length).toBeGreaterThanOrEqual(25);
    expect(executed('cpp-', 'cpp')).toBeGreaterThanOrEqual(
      40 * EXECUTED_VARIANTS.length,
    );
    expect(executed('rust-', 'rust')).toBeGreaterThanOrEqual(
      40 * EXECUTED_VARIANTS.length,
    );
    expect(executed('da-', 'python')).toBeGreaterThanOrEqual(
      25 * EXECUTED_VARIANTS.length,
    );
  });

  it('keeps output questions and examples runnable as complete programs', () => {
    for (const program of programs) {
      if (program.language === 'rust')
        expect(program.code, program.id).toMatch(/fn main\(\)/);
      if (program.language === 'cpp') {
        expect(program.code, program.id).toMatch(/int main\(\)/);
        // Batched programs run main as a void function, so main cannot return
        // a value. Helper functions and lambdas before or inside main may.
        expect(mainStatements(program.code), program.id).not.toMatch(
          /\breturn\s+[^;\s]/,
        );
      }
    }
  });
});

describe('Python knowledge points run as published', () => {
  const python = inLanguage(programs, 'python');
  const pythonExercises = inLanguage(exercises, 'python');
  let runtime: PyodideInterface;
  let executePython: (
    runtime: PyodideInterface,
    code: string,
    tests?: string,
  ) => Promise<PythonResult>;
  beforeAll(async () => {
    if (!python.length && !pythonExercises.length) return;
    runtime = await loadPyodide({ indexURL: pyodideDirectory });
    await runtime.loadPackage(['numpy', 'pandas', 'scikit-learn']);
    executePython = (
      await import(pathToFileURL(resolve('public/python-runtime.mjs')).href)
    ).executePython;
  }, 120_000);

  for (const program of python)
    it(`prints the published output for ${program.id}`, async () => {
      const result = await executePython(runtime, program.code);
      expect(result, program.id).toMatchObject({
        passed: true,
        error: null,
        infrastructure: false,
      });
      expectPrinted(program, result.output.trim());
    }, 30_000);

  for (const { id, question } of pythonExercises)
    it(`passes the reference solution for ${id} and rejects an empty submission`, async () => {
      expect(
        await executePython(runtime, question.solution, question.tests),
      ).toMatchObject({ passed: true, error: null, infrastructure: false });
      expect(await executePython(runtime, '', question.tests)).toMatchObject({
        passed: false,
        infrastructure: false,
      });
    }, 30_000);
});

describe('Rust knowledge points compile and print as published', () => {
  const rust = inLanguage(programs, 'rust');
  const rustExercises = inLanguage(exercises, 'rust');
  it.skipIf(!rust.length && !rustExercises.length)(
    'runs every program and reference solution in one native batch',
    () => {
      const directory = mkdtempSync(join(tmpdir(), 'lessdumb-rust-kp-'));
      try {
        const modules = rust.map(
          (program, index) =>
            `mod program_${index} {\n${program.code.replace(/\bfn main\(\)/, 'pub fn main()')}\n}`,
        );
        const verifiers = rustExercises.map(
          ({ question }, index) =>
            `mod exercise_${index} {\n${question.solution}\n${question.tests.replace(/\bfn main\(\)/, 'pub fn verify()')}\n}`,
        );
        const calls = [
          ...rust.map(
            (program, index) =>
              `println!("\\n\\u{1}{}", "${program.id}"); program_${index}::main();`,
          ),
          ...rustExercises.map((_, index) => `exercise_${index}::verify();`),
        ];
        const path = join(directory, 'points.rs');
        const binary = join(directory, 'points');
        writeFileSync(
          path,
          `#![allow(dead_code, unused_variables, unused_mut, unused_imports)]\n${[...modules, ...verifiers].join('\n')}\nfn main() {\n${calls.join('\n')}\n}\n`,
        );
        const compiled = spawnSync(
          'rustc',
          ['--edition=2021', path, '-o', binary],
          { encoding: 'utf8', timeout: 300_000, maxBuffer: 32 * 1024 * 1024 },
        );
        expect(compiled.status, compiled.stderr || String(compiled.error)).toBe(
          0,
        );
        const printed = outputs(run(binary));
        for (const program of rust)
          expectPrinted(program, printed.get(program.id));
      } finally {
        rmSync(directory, { recursive: true, force: true });
      }
    },
    600_000,
  );
});

describe('C++ knowledge points compile and print as published', () => {
  const cpp = inLanguage(programs, 'cpp');
  const cppExercises = inLanguage(exercises, 'cpp');
  it.skipIf(!cpp.length && !cppExercises.length)(
    'runs every program and reference solution in one native batch',
    () => {
      const compiler = (
        process.env.CXX
          ? [process.env.CXX]
          : process.platform === 'darwin'
            ? ['clang++', 'g++']
            : ['g++', 'clang++']
      ).find(
        (command) =>
          spawnSync(command, ['--version'], { timeout: 5_000 }).status === 0,
      );
      if (!compiler)
        throw new Error(
          'Native C++20 compiler required: set CXX or install clang++/g++.',
        );
      const directory = mkdtempSync(join(tmpdir(), 'lessdumb-cpp-kp-'));
      try {
        // Headers stay at global scope; each program runs inside its namespace.
        const includePattern = /^#include[^\n]*$/gm;
        const sources = [
          ...cpp.map((program) => program.code),
          ...cppExercises.flatMap(({ question }) => [
            question.solution,
            question.tests,
          ]),
        ];
        const headers = [
          ...new Set([
            '#include <iostream>',
            ...sources.flatMap((code) => code.match(includePattern) ?? []),
          ]),
        ]
          .sort()
          .join('\n');
        const strip = (code: string) => code.replace(includePattern, '');
        const namespaces = [
          ...cpp.map(
            (program, index) =>
              `#line 1 "${program.id}"\nnamespace program_${index} {\n${strip(program.code).replace(/\bint main\(\)/, 'void run()')}\n}`,
          ),
          ...cppExercises.map(
            ({ id, question }, index) =>
              `#line 1 "${id}"\nnamespace exercise_${index} {\n${strip(question.solution)}\n${strip(question.tests).replace(/\bint main\(\)/, 'void verify()')}\n}`,
          ),
        ];
        const calls = [
          ...cpp.map(
            (program, index) =>
              // Programs share one stream: reset its formatting so one program's
              // std::boolalpha or std::fixed cannot change the next one's output.
              `std::cout.flags(std::ios_base::dec | std::ios_base::skipws); std::cout.precision(6); std::cout.fill(' '); std::cout << "\\n\\001${program.id}\\n"; program_${index}::run();`,
          ),
          ...cppExercises.map((_, index) => `exercise_${index}::verify();`),
        ];
        const path = join(directory, 'points.cpp');
        const binary = join(directory, 'points');
        writeFileSync(
          path,
          `${headers}\n${namespaces.join('\n')}\nint main() {\n${calls.join('\n')}\nstd::cout << std::flush;\n}\n`,
        );
        const compiled = spawnSync(
          compiler,
          [
            '-std=c++20',
            '-pthread',
            '-UNDEBUG',
            '-O0',
            '-fdiagnostics-color=never',
            path,
            '-o',
            binary,
          ],
          {
            encoding: 'utf8',
            timeout: 300_000,
            maxBuffer: 32 * 1024 * 1024,
            env: { ...process.env, LC_ALL: 'C' },
          },
        );
        expect(compiled.status, compiled.stderr || String(compiled.error)).toBe(
          0,
        );
        const printed = outputs(run(binary));
        for (const program of cpp)
          expectPrinted(program, printed.get(program.id));
      } finally {
        rmSync(directory, { recursive: true, force: true });
      }
    },
    600_000,
  );
});
