/**
 * Random and unique test data. Tests run in parallel against shared servers, so anything a
 * test creates (users, emails, names) must be unique per call.
 */

let counter = 0;

/**
 * Unique per call, e.g. "mhq8x2k9-1-a7f3": base-36 time + a counter + a random part.
 * - the counter guarantees uniqueness inside one worker process, even in the same millisecond
 *   (time + random alone collided in the unit test: 1000 ids in one ms ≈ 25% chance of a clash)
 * - the random part separates parallel workers that start in the same millisecond
 */
export const uniqueId = (): string => {
  counter = (counter + 1) % 1_296; // 2 base-36 digits; wraps long after the millisecond changes
  const random = Math.floor(Math.random() * 1_679_616).toString(36).padStart(4, '0');
  return `${Date.now().toString(36)}-${counter.toString(36)}-${random}`;
};

/** "user_1731150000000_123" - readable unique string with a prefix. */
export const randomString = (prefix = 'user'): string =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

/** Whole number from min to max, both included.  randomInt(1, 6) → a dice roll */
export const randomInt = (min: number, max: number): number => {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
    throw new Error(`randomInt needs whole numbers with min <= max, got ${min}, ${max}`);
  }
  return min + Math.floor(Math.random() * (max - min + 1));
};

/** Unique email on a reserved test domain (never a real inbox).  randomEmail('qa') → "qa.mhq8x2k9a7@example.com" */
export const randomEmail = (prefix = 'qa', domain = 'example.com'): string => `${prefix}.${uniqueId()}@${domain}`;

/** 10-digit phone number that doesn't start with 0. */
export const randomPhone = (): string => `${randomInt(6, 9)}${String(randomInt(0, 999_999_999)).padStart(9, '0')}`;

/** One random item from a non-empty array. The return type is the array's item type (generic T). */
export const pickRandom = <T>(items: readonly T[]): T => {
  if (items.length === 0) throw new Error('pickRandom needs at least one item');
  return items[randomInt(0, items.length - 1)] as T;
};
