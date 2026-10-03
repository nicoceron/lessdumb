import { describe, expect, it } from 'vitest';
import {
  activityTotals,
  createActivity,
  defaultActivityWriterId,
  mergeActivity,
  recordActivity,
  type ActivityState,
} from '../src/lib/activity';

function observations(
  state: ActivityState,
  writer: string,
  values: boolean[],
): ActivityState {
  return values.reduce(
    (next, correct) => recordActivity(next, correct, writer),
    state,
  );
}

describe('durable per-writer activity counters', () => {
  it('retains an offline observation after 2,000 recent events have been compacted', () => {
    const base = createActivity(4, 4);
    const left = observations(base, 'left-device', [
      false,
      ...Array<boolean>(2010).fill(true),
    ]);
    const right = recordActivity(base, true, 'offline-device');
    expect(activityTotals(left)).toEqual({ attempts: 2015, correct: 2014 });
    const merged = mergeActivity(left, right);
    expect(activityTotals(merged)).toEqual({ attempts: 2016, correct: 2015 });
    // Counters do not depend on a retained event or its wall-clock timestamp.
    expect(Object.keys(merged.writers)).toHaveLength(2);
    expect(mergeActivity(merged, left)).toEqual(merged);
    expect(mergeActivity(merged, right)).toEqual(merged);
    expect(mergeActivity(merged, base)).toEqual(merged);
  });

  it('merges a writer snapshot by maxima rather than adding replayed totals', () => {
    const base = createActivity();
    const older = observations(base, 'device-a', [true, false]);
    const newer = observations(older, 'device-a', [true, true]);
    const independent = observations(base, 'device-b', [false, true]);
    const combined = mergeActivity(newer, independent);
    expect(activityTotals(combined)).toEqual({ attempts: 6, correct: 4 });
    expect(mergeActivity(combined, older)).toEqual(combined);
    expect(mergeActivity(combined, newer)).toEqual(combined);
    expect(mergeActivity(combined, combined)).toEqual(combined);
  });

  it('converges regardless of merge direction and grouping across multiple writers', () => {
    const base = createActivity(20, 13);
    const a = observations(base, 'a', [true, false, true]);
    const b = observations(base, 'b', [false, false, true, true]);
    const c = observations(base, 'c', [true, true]);
    expect(mergeActivity(a, b)).toEqual(mergeActivity(b, a));
    expect(mergeActivity(mergeActivity(a, b), c)).toEqual(
      mergeActivity(a, mergeActivity(b, c)),
    );
    expect(activityTotals(mergeActivity(mergeActivity(a, b), c))).toEqual({
      attempts: 29,
      correct: 19,
    });
  });

  it('converges after seeded out-of-order and repeated snapshot delivery', () => {
    let seed = 702;
    const random = () => {
      seed = (1664525 * seed + 1013904223) >>> 0;
      return seed / 2 ** 32;
    };
    const base = createActivity(11, 7);
    const current = Array.from({ length: 5 }, () => base);
    const snapshots: ActivityState[] = [base];
    let successes = 0;
    for (let index = 0; index < 250; index++) {
      const writer = Math.floor(random() * current.length);
      const correct = random() > 0.35;
      successes += correct ? 1 : 0;
      current[writer] = recordActivity(
        current[writer],
        correct,
        `device-${writer}`,
      );
      snapshots.push(current[writer]);
    }
    for (let index = snapshots.length - 1; index > 0; index--) {
      const swap = Math.floor(random() * (index + 1));
      [snapshots[index], snapshots[swap]] = [snapshots[swap], snapshots[index]];
    }
    const received = [...snapshots, ...snapshots].reduce(mergeActivity, base);
    const expected = current.reduce(mergeActivity, base);
    expect(received).toEqual(expected);
    expect(activityTotals(received)).toEqual({
      attempts: 261,
      correct: 7 + successes,
    });
  });

  it('counts a shared legacy baseline once and preserves the larger unknown legacy snapshot', () => {
    const baseline = createActivity(30, 24);
    const a = recordActivity(baseline, false, 'upgraded-a');
    const b = recordActivity(baseline, true, 'upgraded-b');
    expect(activityTotals(mergeActivity(a, b))).toEqual({
      attempts: 32,
      correct: 25,
    });
    const older = createActivity(25, 20);
    expect(mergeActivity(mergeActivity(a, b), older)).toEqual(
      mergeActivity(a, b),
    );
    // Untracked legacy snapshots have no writer provenance. Maxima avoid adding
    // a shared history twice; they cannot reconstruct disjoint forgotten events.
    expect(
      activityTotals(
        mergeActivity(createActivity(30, 24), createActivity(31, 25)),
      ),
    ).toEqual({ attempts: 31, correct: 25 });
  });

  it('returns immutable JSON-safe state and uses a per-runtime writer by default', () => {
    const base = createActivity(2, 1);
    const before = JSON.stringify(base);
    const one = recordActivity(base, true);
    expect(one.writers[defaultActivityWriterId()]).toEqual({
      attempts: 1,
      correct: 1,
    });
    expect(activityTotals(one)).toEqual({ attempts: 3, correct: 2 });
    expect(JSON.stringify(base)).toBe(before);
    expect(JSON.parse(JSON.stringify(one))).toEqual(one);
    const merged = mergeActivity(
      one,
      recordActivity(base, false, 'another-runtime'),
    );
    expect(JSON.parse(JSON.stringify(merged))).toEqual(merged);
    expect(one.writers).not.toHaveProperty('another-runtime');
  });

  it('rejects unsafe IDs and invalid or overflowing counter totals', () => {
    expect(() => createActivity(-1, 0)).toThrow('Activity counters');
    expect(() => createActivity(1, 2)).toThrow('Activity counters');
    expect(() => createActivity(1.5, 1)).toThrow('Activity counters');
    for (const writer of [
      '',
      '__proto__',
      'constructor',
      'prototype',
      'a'.repeat(129),
    ])
      expect(() => recordActivity(createActivity(), true, writer)).toThrow(
        'writer',
      );
    expect(() =>
      recordActivity(createActivity(Number.MAX_SAFE_INTEGER, 0), false),
    ).toThrow('Activity counters');
  });
});
