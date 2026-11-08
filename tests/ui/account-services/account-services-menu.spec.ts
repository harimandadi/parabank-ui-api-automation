import { test, expect } from '../../../src/fixtures/baseTest';
import { AUTH_FILE } from '../../../src/config/auth';
import { ACCOUNT_SERVICES_LINKS } from '../../../src/components/AccountServicesMenu';

// Start every test already logged in (session saved once by tests/auth.setup.ts).
test.use({ storageState: AUTH_FILE });

test.describe('Account Services - Menu', () => {
  test.beforeEach(async ({ loggedIn }) => {});

  test('UI: shows welcome message and all Account Services links in order', async ({ accountServicesMenu }) => {
    await expect(accountServicesMenu.welcomeText).toContainText('Welcome');
    await expect(accountServicesMenu.welcomeText).not.toHaveText('Welcome');
    await expect(accountServicesMenu.heading).toBeVisible();
    await expect(accountServicesMenu.links).toHaveText([...ACCOUNT_SERVICES_LINKS]);
  });

  test('Transfer Funds and Find Transactions links open their pages', async ({
    page,
    accountServicesMenu,
    transferFundsPage,
    findTransactionsPage,
  }) => {
    await accountServicesMenu.openTransferFunds();
    await expect(page).toHaveURL(/transfer\.htm/);
    await expect(transferFundsPage.heading).toHaveText('Transfer Funds');

    await accountServicesMenu.openFindTransactions();
    await expect(page).toHaveURL(/findtrans\.htm/);
    await expect(findTransactionsPage.heading).toHaveText('Find Transactions');
  });
});
