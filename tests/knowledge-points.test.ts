import { beforeAll, describe, expect, it } from 'vitest';
import { loadPyodide, type PyodideInterface } from 'pyodide';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  courses,
  skills,
  validateCurriculum,
  validateKnowledgePointRegistry,
  type CodeLanguage,
  type CodeQuestion,
  type Skill,
} from '../src/lib/curriculum';
import type { PythonResult } from '../src/lib/python';

// Every worked example and every "what does this print?" question is run, and
// its published output must be exactly what the program prints.
interface Program {
  id: string;
  language: CodeLanguage;
  code: string;
  expected: string;
}

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
    for (const question of point.questions)
      if (question.type === 'choice' && question.checksOutput)
        programs.push({
          id: question.id,
          language: languageOf(skill),
          code: question.code!,
          expected: question.choices[question.answer],
        });
      else if (question.type === 'code')
        exercises.push({
          id: question.id,
          language: languageOf(skill, question.language),
          question,
        });
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
  it('names each catalog skill at most once and validates every point', () => {
    expect(validateKnowledgePointRegistry()).toEqual([]);
    expect(validateCurriculum()).toEqual([]);
  });

  it('keeps output questions and examples runnable as complete programs', () => {
    for (const program of programs) {
      if (program.language === 'rust')
        expect(program.code, program.id).toMatch(/fn main\(\)/);
      if (program.language === 'cpp') {
        expect(program.code, program.id).toMatch(/int main\(\)/);
        // Batched programs run main as a void function, so main cannot return
        // a value. Helper functions defined before main may.
        const main = program.code.slice(program.code.search(/\bint main\(\)/));
        expect(main, program.id).not.toMatch(/return\s+[^;\s]/);
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
    runtime = await loadPyodide({
      indexURL: `${resolve('public/pyodide')}/`,
    });
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
      expect(result.output.trim()).toBe(program.expected.trim());
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
          expect(printed.get(program.id), program.id).toBe(
            program.expected.trim(),
          );
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
              `std::cout << "\\n\\001${program.id}\\n"; program_${index}::run();`,
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
          expect(printed.get(program.id), program.id).toBe(
            program.expected.trim(),
          );
      } finally {
        rmSync(directory, { recursive: true, force: true });
      }
    },
    600_000,
  );
});
