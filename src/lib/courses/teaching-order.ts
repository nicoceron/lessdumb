import type { Skill } from '../curriculum';

/**
 * Number skills in their authored sequence, moving a prerequisite from the
 * same course ahead of its first dependent. Array order, and therefore the
 * graph's topic rows, stays as authored.
 */
export function withTeachingOrder<
  T extends Pick<Skill, 'id' | 'prerequisites'>,
>(items: T[]): (T & { order: number })[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const order = new Map<string, number>();
  let next = 0;
  const place = (item: T) => {
    if (order.has(item.id)) return;
    order.set(item.id, -1);
    for (const id of item.prerequisites) {
      const prerequisite = byId.get(id);
      if (prerequisite) place(prerequisite);
    }
    order.set(item.id, next++);
  };
  items.forEach(place);
  return items.map((item) => ({ ...item, order: order.get(item.id)! }));
}
