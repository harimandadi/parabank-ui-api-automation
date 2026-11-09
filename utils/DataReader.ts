import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import type { ZodType } from 'zod';

/**
 * Test data from JSON, CSV or Excel, returned as typed rows.
 *
 *   const rows = readTestData('test-data/login/login-data.csv', LoginRowSchema);
 *   //    rows: LoginRow[]   (T is inferred from the schema)
 *
 * Every row is validated with the zod schema, so a typo in a data file fails fast with the
 * file, row number and column, instead of producing a confusing test failure later.
 * Reading is synchronous on purpose: Playwright needs the rows while it collects tests.
 */

type RawRow = Record<string, unknown>;

/** Resolve a path relative to the project root, so tests can pass 'test-data/...'. */
const fromRoot = (file: string): string => path.resolve(__dirname, '..', file);

export function readJson(file: string): RawRow[] {
  const data: unknown = JSON.parse(fs.readFileSync(fromRoot(file), 'utf-8'));
  if (!Array.isArray(data)) throw new Error(`${file} must contain a JSON array of rows`);
  return data as RawRow[];
}

/**
 * Minimal CSV reader: first line = headers; supports quoted values ("a, b") and "" escapes.
 * Blank lines are skipped.
 */
export function readCsv(file: string): RawRow[] {
  const text = fs.readFileSync(fromRoot(file), 'utf-8').replace(/^﻿/, ''); // drop Excel's BOM
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  const [headerLine, ...dataLines] = lines;
  if (!headerLine) return [];
  const headers = parseCsvLine(headerLine).map((h) => h.trim());
  return dataLines.map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, i) => [header, values[i] ?? '']));
  });
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') { current += '"'; i++; } // escaped quote
      else if (char === '"') inQuotes = false;
      else current += char;
    } else if (char === '"') inQuotes = true;
    else if (char === ',') { values.push(current); current = ''; }
    else current += char;
  }
  values.push(current);
  return values;
}

/** First worksheet of an .xlsx file; row 1 holds the column names. */
export function readExcel(file: string): RawRow[] {
  const script = path.join(__dirname, 'excelReader.cjs');
  const output = execFileSync(process.execPath, [script, fromRoot(file)], { encoding: 'utf-8' });
  return JSON.parse(output) as RawRow[];
}

/** Pick the reader from the file extension, then validate every row against the schema. */
export function readTestData<T>(file: string, schema: ZodType<T>): T[] {
  const ext = path.extname(file).toLowerCase();
  const rows =
    ext === '.json' ? readJson(file)
    : ext === '.csv' ? readCsv(file)
    : ext === '.xlsx' ? readExcel(file)
    : (() => { throw new Error(`Unsupported test data file type "${ext}" (${file})`); })();

  return rows.map((row, index) => {
    const result = schema.safeParse(row);
    if (!result.success) {
      const details = result.error.issues.map((issue) => `${issue.path.join('.') || '(row)'}: ${issue.message}`).join('; ');
      throw new Error(`${file}, data row ${index + 1}: ${details}`);
    }
    return result.data;
  });
}
