import { test as setup, expect } from '../fixtures/baseTest';
import { ENV } from '../config/env';
import { AUTH_FILE } from '../config/auth';

/**
 * Runs once before the browser projects (see `setup` project in playwright.config.ts).
 * Logs in through the UI a single time and saves the session cookies to AUTH_FILE,
 * so Account Services tests can start already logged in instead of logging in each time.
 */
setup('authenticate', async ({ page, loginPage, accountsOverviewPage }) => {
  await loginPage.goto();
  await loginPage.login(ENV.username, ENV.password);
  await expect(
    accountsOverviewPage.heading,
    `Login failed for "${ENV.username}" - set PARABANK_USERNAME / PARABANK_PASSWORD to a valid user`,
  ).toBeVisible();

  await page.context().storageState({ path: AUTH_FILE });
});
