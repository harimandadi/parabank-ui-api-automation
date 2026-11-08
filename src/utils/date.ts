/** ParaBank's Find Transactions expects dates as MM-DD-YYYY. */
export const formatDate = (d: Date): string => {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}-${dd}-${d.getFullYear()}`;
};

export const today = (): string => formatDate(new Date());

/** Unique-ish amount like "12.34" so a test can find its own transaction. */
export const uniqueAmount = (): string => {
  const cents = 100 + (Date.now() % 9000); // 1.00 - 90.99
  return (cents / 100).toFixed(2);
};
