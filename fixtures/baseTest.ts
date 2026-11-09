import path from 'path';
import { test as base, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { ENV } from '../config/env';
import { LoginPage } from '../pages/LoginPage';
import { AccountsOverviewPage } from '../pages/AccountsOverviewPage';
import { RegisterPage } from '../pages/RegisterPage';
import { TransferFundsPage } from '../pages/TransferFundsPage';
import { FindTransactionsPage } from '../pages/FindTransactionsPage';
import { AccountServicesMenu } from '../components/AccountServicesMenu';

type Fixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  accountsOverviewPage: AccountsOverviewPage;
  transferFundsPage: TransferFundsPage;
  findTransactionsPage: FindTransactionsPage;
  accountServicesMenu: AccountServicesMenu;
  /**
   * Lands on Accounts Overview as a logged-in user. Reuses the saved session when the spec
   * uses `test.use({ storageState: AUTH_FILE })`; otherwise (or if the session expired)
   * logs in through the UI with ENV credentials.
   */
  loggedIn: void;
  /** Auto fixture: Allure Epic/Feature/Story labels from the spec's folder path. */
  allureLabels: void;
};

const titleCase = (s: string): string =>
  s.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const test = base.extend<Fixtures>({
  // tests/ui/account-services/transfer-funds.spec.ts
  //   -> Epic "UI", Feature "Account Services", Story "Transfer Funds"
  allureLabels: [
    async ({}, use, testInfo) => {
      const [layer, module, file] = path.relative(testInfo.project.testDir, testInfo.file).split(path.sep);
      if (layer && module && file) {
        await allure.epic(layer.toUpperCase());
        await allure.feature(titleCase(module));
        await allure.story(titleCase(file.replace(/(\.api)?\.spec\.ts$/, '')));
      }
      await allure.parameter('environment', ENV.name);
      await use();
    },
    { auto: true },
  ],

  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
  accountsOverviewPage: async ({ page }, use) => use(new AccountsOverviewPage(page)),
  transferFundsPage: async ({ page }, use) => use(new TransferFundsPage(page)),
  findTransactionsPage: async ({ page }, use) => use(new FindTransactionsPage(page)),
  accountServicesMenu: async ({ page }, use) => use(new AccountServicesMenu(page)),

  loggedIn: async ({ page, loginPage, accountsOverviewPage }, use) => {
    // Try the saved session first: one page load instead of a full login.
    await page.goto(`${ENV.appPath}/overview.htm`);
    if (!(await accountsOverviewPage.logoutLink.isVisible())) {
      await loginPage.goto();
      await loginPage.login(ENV.username, ENV.password);
    }
    await expect(
      accountsOverviewPage.heading,
      `Login failed for "${ENV.username}" - set PARABANK_USERNAME / PARABANK_PASSWORD to a valid user`,
    ).toBeVisible();
    await use();
  },
});

export { expect };
