import { z } from 'zod';
import { test, expect } from '../../../fixtures/baseTest';
import { ENV } from '../../../config/env';
import { readTestData } from '../../../utils/DataReader';
import messages from '../../../test-data/loginData.json';

/**
 * Data-driven login: the SAME test logic runs once per row, for rows read from three
 * different sources (JSON, CSV, Excel). Add a case by adding a row - no code change.
 *
 * Columns: testName | username | password | expected (success | invalid | empty)
 * Credentials never live in data files: {{PARABANK_USERNAME}} / {{PARABANK_PASSWORD}}
 * are replaced with the values from .env or CI secrets when the test runs.
 */
const LoginRowSchema = z.object({
  testName: z.string().min(1),
  username: z.string(),
  password: z.string(),
  expected: z.enum(['success', 'invalid', 'empty']),
});
type LoginRow = z.infer<typeof LoginRowSchema>;

const SOURCES = [
  'test-data/login/login-data.json',
  'test-data/login/login-data.csv',
  'test-data/login/login-data.xlsx',
] as const;

/** Read at run time (not when tests are collected), so `--list` works without a password. */
const resolve = (value: string): string =>
  value
    .replace('{{PARABANK_USERNAME}}', () => ENV.username)
    .replace('{{PARABANK_PASSWORD}}', () => ENV.password);

for (const source of SOURCES) {
  const rows: LoginRow[] = readTestData(source, LoginRowSchema);
  const format = source.split('.').pop()!.toUpperCase();

  test.describe(`Login - data driven (${format})`, () => {
    test.beforeEach(async ({ loginPage }) => {
      await loginPage.goto();
    });

    for (const row of rows) {
      test(`${row.testName} → ${row.expected}`, async ({ loginPage, accountsOverviewPage }) => {
        await loginPage.login(resolve(row.username), resolve(row.password));

        if (row.expected === 'success') {
          await expect(accountsOverviewPage.heading).toBeVisible();
          await accountsOverviewPage.logout();
          await expect(loginPage.loginButton).toBeVisible();
        } else {
          const message = row.expected === 'empty' ? messages.messages.emptyCredentials : messages.messages.invalidCredentials;
          await expect(loginPage.errorMessage).toHaveText(message);
        }
      });
    }
  });
}
