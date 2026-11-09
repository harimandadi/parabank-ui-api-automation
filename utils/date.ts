/** Dates and amounts for tests. All functions are pure except the ones that read the clock. */

/** ParaBank's Find Transactions expects dates as MM-DD-YYYY.  formatDate(new Date(2026, 0, 5)) → "01-05-2026" */
export const formatDate = (d: Date): string => {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}-${dd}-${d.getFullYear()}`;
};

/** ISO calendar date (local time), e.g. for APIs and file names.  formatIsoDate(new Date(2026, 0, 5)) → "2026-01-05" */
export const formatIsoDate = (d: Date): string => {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

/** Parse ParaBank's MM-DD-YYYY back into a Date. Throws on anything else, so bad input fails loudly. */
export const parseDate = (text: string): Date => {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(text.trim());
  if (!match) throw new Error(`Expected a date like MM-DD-YYYY, got "${text}"`);
  const [, mm, dd, yyyy] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (date.getMonth() !== Number(mm) - 1) throw new Error(`Not a real date: "${text}"`); // e.g. 02-30-2026
  return date;
};

/** A new Date n days later (negative n = earlier). Does not change the input.  addDays(today, -7) → a week ago */
export const addDays = (d: Date, days: number): Date => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
};

/** Today in ParaBank format (MM-DD-YYYY). */
export const today = (): string => formatDate(new Date());

/** Unique-ish amount like "12.34" so a test can find its own transaction. */
export const uniqueAmount = (): string => {
  const cents = 100 + (Date.now() % 9000); // 1.00 - 90.99
  return (cents / 100).toFixed(2);
};
