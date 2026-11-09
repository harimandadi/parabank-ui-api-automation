import type { Locator } from '@playwright/test';
import { normalizeSpace } from './string';

/**
 * Read an HTML table into one object per row, keyed by the header text.
 *
 *   const rows = await readTable(page.locator('#accountTable'));
 *   // [{ Account: '13344', 'Balance*': '$515.50', 'Available Amount': '$515.50' }, ...]
 *
 * Headers come from `thead th` (or the first row's cells when there is no thead).
 * Rows with a different number of cells (totals, notes) are skipped.
 * Call it after the table has loaded, e.g. after `await expect(table.locator('tbody tr').first()).toBeVisible()`.
 */
export async function readTable(table: Locator): Promise<Record<string, string>[]> {
  const grid = await table.evaluate((element) => {
    const text = (cell: Element) => (cell.textContent ?? '');
    const headerCells = element.querySelectorAll('thead th');
    const allRows = Array.from(element.querySelectorAll('tr'));
    const headers = headerCells.length > 0
      ? Array.from(headerCells).map(text)
      : Array.from(allRows.shift()?.querySelectorAll('th, td') ?? []).map(text);
    const body = allRows
      .filter((row) => row.closest('thead') === null)
      .map((row) => Array.from(row.querySelectorAll('td')).map(text));
    return { headers, body };
  });

  const headers = grid.headers.map(normalizeSpace);
  return grid.body
    .filter((cells) => cells.length === headers.length)
    .map((cells) => Object.fromEntries(headers.map((header, i) => [header, normalizeSpace(cells[i] ?? '')])));
}
