import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import * as curriculum from '../src/lib/curriculum';
import * as index from '../src/lib/catalog-index';
import {
  assessmentPolicy,
  buildIndex,
  decodeIndex,
  encodeIndex,
} from '../src/lib/catalog-outline';
import {
  contentCourseIds,
  loadCourseContent,
  loadSkill,
} from '../src/lib/content';
import {
  findQuestion,
  hasKnowledgePoints,
  legacyQuestionIds,
  lessonEvidenceIds,
  lessonSteps,
  reviewRequirement,
} from '../src/lib/lesson-plan';
import { lessonXp } from '../src/lib/xp';
import * as parts from '../src/lib/content/parts';
import {
  catalogIndexModule,
  contentPartsModule,
  contentUnitModule,
  contentUnits,
  encodedCatalogIndex,
} from '../scripts/catalog-index-plugin.mjs';

// The browser schedules on the graph index and loads lesson content per
// course. These tests keep the index, its build-time encoding, and the
// content modules in step with the full curriculum.
describe('graph index', () => {
  it('equals the index the full curriculum derives', () => {
    const derived = buildIndex(curriculum.defaultCatalog);
    expect(index.courses).toEqual(curriculum.courses);
    expect(index.units).toEqual(curriculum.units);
    expect(index.skills).toEqual(derived.skills);
    expect(Object.keys(index.skillById)).toEqual(
      curriculum.skills.map((skill) => skill.id),
    );
    expect(index.defaultCatalog.skills).toBe(index.skills);
  });

  it('ships to the browser exactly as the server derives it', async () => {
    // What the build plugin embeds in the client bundle.
    const encoded = await encodedCatalogIndex();
    const shipped = decodeIndex(JSON.parse(JSON.stringify(encoded)));
    expect(shipped.courses).toEqual(index.courses);
    expect(shipped.units).toEqual(index.units);
    expect(shipped.skills).toEqual(index.skills);
    expect(encoded).toEqual(encodeIndex(buildIndex(curriculum.defaultCatalog)));
    // The replacement module exports what the real module exports.
    const source = catalogIndexModule(encoded);
    const exported = source.match(/export const \{ (.+) \} = index;/)![1];
    expect(exported.split(', ').sort()).toEqual(Object.keys(index).sort());
  });

  it('keeps every skill outline small and free of lesson content', () => {
    const outline = JSON.stringify(encodeIndex(index));
    const full = JSON.stringify(curriculum.skills);
    expect(outline.length).toBeLessThan(full.length / 10);
    for (const skill of index.skills) {
      expect(skill).not.toHaveProperty('lesson');
      for (const question of [
        ...skill.questions,
        ...(skill.knowledgePoints ?? []).flatMap((point) => point.questions),
      ])
        expect(Object.keys(question).sort()).toEqual(['id', 'type']);
      for (const card of skill.flashcards)
        expect(Object.keys(card)).toEqual(['id']);
    }
  });

  it('gives the engine the same plan from an outline as from the full skill', () => {
    for (const skill of curriculum.skills) {
      const outline = index.skillById[skill.id];
      expect(lessonEvidenceIds(outline), skill.id).toEqual(
        lessonEvidenceIds(skill),
      );
      expect(
        lessonSteps(outline).map((step) => [
          step.id,
          step.kind,
          step.questions.map((question) => [question.id, question.type]),
        ]),
      ).toEqual(
        lessonSteps(skill).map((step) => [
          step.id,
          step.kind,
          step.questions.map((question) => [question.id, question.type]),
        ]),
      );
      expect(hasKnowledgePoints(outline)).toBe(hasKnowledgePoints(skill));
      expect(reviewRequirement(outline)).toEqual(reviewRequirement(skill));
      expect(assessmentPolicy(outline)).toEqual(assessmentPolicy(skill));
      expect(lessonXp(outline)).toBe(lessonXp(skill));
      for (const step of lessonSteps(skill))
        for (const question of step.questions)
          expect(findQuestion(outline, question.id)?.type).toBe(question.type);
      expect(outline.flashcards.map((card) => card.id)).toEqual(
        skill.flashcards.map((card) => card.id),
      );
    }
  });
});

describe('per-course content', () => {
  it('has one content module per course, each holding only that course', async () => {
    expect([...contentCourseIds].sort()).toEqual(
      curriculum.courses.map((course) => course.id).sort(),
    );
    for (const course of curriculum.courses) {
      const skills = await loadCourseContent(course.id);
      expect(skills.map((skill) => skill.id)).toEqual(course.skillIds);
      // The same objects the server and tests use.
      for (const skill of skills)
        expect(skill).toBe(curriculum.skillById[skill.id]);
    }
    expect(await loadSkill(index.skillById['print-output'])).toBe(
      curriculum.skillById['print-output'],
    );
  });

  it('ships each unit to the browser as its own part, exactly as the server derives it', async () => {
    // What the build plugin serves in place of src/lib/content/parts.ts.
    const units: {
      id: string;
      courseId: string;
      skills: typeof curriculum.skills;
    }[] = await contentUnits();
    expect(units.map((unit) => unit.id)).toEqual(
      curriculum.units
        .filter((unit) => curriculum.skills.some((s) => s.unitId === unit.id))
        .map((unit) => unit.id),
    );
    const shipped = new Map<string, unknown>();
    for (const unit of units) {
      const source = contentUnitModule(unit);
      expect(source).toMatch(/^export default JSON\.parse\(".*"\);\n$/s);
      const skills = JSON.parse(
        JSON.parse(source.slice('export default JSON.parse('.length, -3)),
      ) as typeof curriculum.skills;
      for (const skill of skills) {
        expect(skill.unitId).toBe(unit.id);
        expect(skill.courseId).toBe(unit.courseId);
        shipped.set(skill.id, skill);
      }
    }
    // Every skill exactly once, with all of its content.
    expect([...shipped.keys()].sort()).toEqual(
      curriculum.skills.map((skill) => skill.id).sort(),
    );
    for (const skill of curriculum.skills)
      expect(shipped.get(skill.id), skill.id).toEqual(skill);

    // The replacement module exports what the real module exports, keys its
    // parts by unit, and loads each through its own dynamic import.
    const source = contentPartsModule(units);
    const generated = await import(
      `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
    );
    expect(Object.keys(generated).sort()).toEqual(Object.keys(parts).sort());
    expect(Object.keys(generated.contentParts)).toEqual(
      units.map((unit) => unit.id),
    );
    for (const unit of units) {
      expect(generated.contentParts[unit.id].courseId).toBe(unit.courseId);
      expect(source).toContain(`import("lessdumb:content/${unit.id}")`);
    }
    const skill = index.skillById['print-output'];
    expect(generated.partOf(skill)).toBe(skill.unitId);
    expect(parts.partOf(skill)).toBe(skill.courseId);
  });

  it('keeps the browser off the full curriculum', () => {
    // Client code reaches the curriculum through the index and the content
    // loaders; the build fails on any other import (scripts/catalog-index-plugin.mjs).
    const clientFiles = [
      ...readdirSync(resolve('src/components'), { recursive: true }),
    ]
      .map(String)
      .filter((file) => /\.tsx?$/.test(file))
      .map((file) => join('src/components', file));
    for (const file of clientFiles) {
      const source = readFileSync(file, 'utf8');
      for (const statement of source.match(
        /import[^;]*from '[./]*lib\/curriculum';/g,
      ) ?? [])
        expect(statement, file).toMatch(/^import type /);
    }
  });
});

describe('retired four-question lessons (CEN-117)', () => {
  it('serves choice practice only from knowledge points and keeps the exercise ID', () => {
    for (const skill of curriculum.skills) {
      expect(skill.knowledgePoints?.length, skill.id).toBeGreaterThan(0);
      expect(
        skill.questions.every((question) => question.type === 'code'),
      ).toBe(true);
      expect(skill.questions.map((question) => question.id)).toEqual(
        skill.questions.length ? [`${skill.id}-q4`] : [],
      );
      expect(legacyQuestionIds(skill)).toContain(
        skill.questions[0]?.id ?? `${skill.id}-q4`,
      );
    }
  });
});
