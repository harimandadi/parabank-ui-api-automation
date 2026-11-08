import { test } from '../src/fixtures/baseTest';

/**
 * Guest seed for the Playwright agents (planner / generator / healer).
 * Starts on the ParaBank home page, logged out - use for Login and Register flows.
 */
test.describe('Seed', () => {
  test('seed', async ({ loginPage }) => {
    await loginPage.goto();
  });
});
