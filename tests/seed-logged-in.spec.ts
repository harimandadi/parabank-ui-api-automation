import { test } from '../fixtures/baseTest';

/**
 * Logged-in seed for the Playwright agents (planner / generator / healer).
 * Logs in with ENV credentials (PARABANK_USERNAME / PARABANK_PASSWORD) and leaves the
 * page on Accounts Overview - use for Account Services flows (Transfer Funds, Bill Pay,
 * Find Transactions, Open New Account, Request Loan, Update Contact Info).
 */
test.describe('Seed', () => {
  test('seed logged in', async ({ loggedIn }) => {});
});
