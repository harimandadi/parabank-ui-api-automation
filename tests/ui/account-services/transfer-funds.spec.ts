import { test, expect } from '../../../fixtures/baseTest';
import { AUTH_FILE } from '../../../config/auth';
import { uniqueAmount } from '../../../utils/date';

// Start every test already logged in (session saved once by tests/auth.setup.ts).
test.use({ storageState: AUTH_FILE });

test.describe('Account Services - Transfer Funds', () => {
  test.beforeEach(async ({ loggedIn, accountServicesMenu, transferFundsPage }) => {
    await accountServicesMenu.openTransferFunds();
    await transferFundsPage.waitForAccounts();
  });

  test('UI: Transfer Funds page shows all form elements', async ({ page, accountServicesMenu, transferFundsPage }) => {
    await expect(page).toHaveURL(/transfer\.htm/);
    await expect(accountServicesMenu.heading).toBeVisible();
    await expect(transferFundsPage.heading).toHaveText('Transfer Funds');
    await expect(transferFundsPage.amountLabel).toBeVisible();
    await expect(transferFundsPage.amountInput).toBeVisible();
    await expect(transferFundsPage.amountInput).toBeEmpty();
    await expect(transferFundsPage.amountInput).toBeEditable();
    await expect(transferFundsPage.fromAccountSelect).toBeVisible();
    await expect(transferFundsPage.toAccountSelect).toBeVisible();
    await expect(transferFundsPage.transferButton).toBeEnabled();

    // Both dropdowns list the same accounts (john may have only one, e.g. 12345).
    const fromOptions = await transferFundsPage.fromAccountSelect.locator('option').allTextContents();
    const toOptions = await transferFundsPage.toAccountSelect.locator('option').allTextContents();
    expect(fromOptions.length).toBeGreaterThan(0);
    expect(toOptions).toEqual(fromOptions);
  });

  test('transfers funds between accounts and shows confirmation', { tag: ['@smoke', '@modifies-data'] }, async ({ transferFundsPage }) => {
    const amount = uniqueAmount();
    const { from, to } = await transferFundsPage.transfer(amount);

    await expect(transferFundsPage.resultHeading).toHaveText('Transfer Complete!');
    await expect(transferFundsPage.amountResult).toHaveText(`$${amount}`);
    await expect(transferFundsPage.fromAccountResult).toHaveText(from);
    await expect(transferFundsPage.toAccountResult).toHaveText(to);
  });

  test('transferred amount appears in Find Transactions for the source account', { tag: '@modifies-data' }, async ({
    accountServicesMenu,
    transferFundsPage,
    findTransactionsPage,
  }) => {
    const amount = uniqueAmount();
    const { from } = await transferFundsPage.transfer(amount);
    await expect(transferFundsPage.resultHeading).toHaveText('Transfer Complete!');

    await accountServicesMenu.openFindTransactions();
    await findTransactionsPage.selectAccount(from);
    await findTransactionsPage.findByAmount(amount);

    await expect(findTransactionsPage.resultsHeading).toHaveText('Transaction Results');
    await expect(findTransactionsPage.resultRows.first()).toBeVisible();
    await expect(findTransactionsPage.resultsTable).toContainText('Funds Transfer');
    await expect(findTransactionsPage.resultsTable).toContainText(`$${amount}`);
  });
});
