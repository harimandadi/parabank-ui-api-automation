/** Text helpers for comparing UI text, building names and keeping secrets out of logs. */

/** Collapse runs of whitespace (spaces, tabs, new lines) and trim.  "  Welcome \n John " → "Welcome John" */
export const normalizeSpace = (text: string): string => text.replace(/\s+/g, ' ').trim();

/** "transfer-funds" / "transfer_funds" → "Transfer Funds" */
export const toTitleCase = (text: string): string =>
  normalizeSpace(text.replace(/[-_]+/g, ' ')).replace(/\b\w/g, (c) => c.toUpperCase());

/** URL / file-name safe.  "Bill Pay: Electric!" → "bill-pay-electric" */
export const slugify = (text: string): string =>
  text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/**
 * Money text from the UI → number. Handles currency symbols, thousands separators and
 * minus signs:  "$1,234.56" → 1234.56 · "-$12.00" → -12 · "Rs. 500" → 500 · "($5.00)" → -5
 */
export const parseCurrency = (text: string): number => {
  const trimmed = text.trim();
  const negative = trimmed.includes('-') || /^\(.*\)$/.test(trimmed);
  const digits = trimmed.replace(/^Rs\.?/i, '').replace(/[^0-9.]/g, '');
  if (digits === '' || Number.isNaN(Number(digits))) throw new Error(`Not a money amount: "${text}"`);
  return (negative ? -1 : 1) * Number(digits);
};

/** number → "$1,234.56" (US format, as ParaBank shows it).  formatCurrency(-12) → "-$12.00" */
export const formatCurrency = (amount: number, currency = 'USD', locale = 'en-US'): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);

/** Hide a secret for logs and report steps, keeping a short hint.  maskSecret("demo1234") → "de******" */
export const maskSecret = (secret: string, visible = 2): string =>
  secret.length <= visible ? '*'.repeat(secret.length) : secret.slice(0, visible) + '*'.repeat(secret.length - visible);
