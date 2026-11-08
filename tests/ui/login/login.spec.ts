import { test, expect } from '../../../src/fixtures/baseTest';
import { ENV } from '../../../src/config/env';
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

  test('valid user can log in and log out', async ({ loginPage, accountsOverviewPage }) => {
    await loginPage.login(ENV.username, ENV.password);

    await expect(accountsOverviewPage.heading).toBeVisible();
    await expect(accountsOverviewPage.welcomeText).toContainText('Welcome');
    await expect(accountsOverviewPage.accountsTable).toBeVisible();

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
