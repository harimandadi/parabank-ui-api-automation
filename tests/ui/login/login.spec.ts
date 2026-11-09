import { test, expect } from '../../../fixtures/baseTest';
import { ENV } from '../../../config/env';
import data from '../../../test-data/loginData.json';

test.describe('Login - UI', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('login page shows the login form', async ({ loginPage }) => {
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.registerLink).toBeVisible();
    await expect(loginPage.forgotLoginLink).toBeVisible();
  });

  test('valid user can log in and log out', { tag: '@smoke' }, async ({ loginPage, accountsOverviewPage }) => {
    await loginPage.login(ENV.username, ENV.password);

    await expect(accountsOverviewPage.heading).toBeVisible();
    await expect(accountsOverviewPage.welcomeText).toContainText('Welcome');
    await expect(accountsOverviewPage.accountsTable).toBeVisible();

    // The table reads as real numbers (utils: readTable + parseCurrency).
    const accounts = await accountsOverviewPage.getAccounts();
    expect(accounts.length).toBeGreaterThan(0);
    for (const { account, balance, available } of accounts) {
      expect(account).toMatch(/^\d+$/);
      expect(Number.isFinite(balance)).toBe(true);
      expect(Number.isFinite(available)).toBe(true);
    }

    await accountsOverviewPage.logout();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('invalid credentials show an error', async ({ loginPage }) => {
    await loginPage.login(data.invalidUser.username, data.invalidUser.password);
    await expect(loginPage.errorMessage).toHaveText(data.messages.invalidCredentials);
  });

  test('empty credentials show a validation error', async ({ loginPage }) => {
    await loginPage.login('', '');
    await expect(loginPage.errorMessage).toHaveText(data.messages.emptyCredentials);
  });
});
