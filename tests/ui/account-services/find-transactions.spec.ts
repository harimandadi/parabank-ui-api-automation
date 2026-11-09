import { test, expect } from '../../../fixtures/baseTest';
import { AUTH_FILE } from '../../../config/auth';
import { today, uniqueAmount } from '../../../utils/date';

// Start every test already logged in (session saved once by tests/auth.setup.ts).
test.use({ storageState: AUTH_FILE });

test.describe('Account Services - Find Transactions', () => {
  test.beforeEach(async ({ loggedIn }) => {});

  test('UI: Find Transactions page shows all search options', { tag: '@smoke' }, async ({ page, accountServicesMenu, findTransactionsPage }) => {
    await accountServicesMenu.openFindTransactions();

    await expect(page).toHaveURL(/findtrans\.htm/);
    await expect(findTransactionsPage.heading).toHaveText('Find Transactions');
    await expect(findTransactionsPage.accountSelect).toBeVisible();
    await expect(findTransactionsPage.accountSelect.locator('option').first()).toBeAttached();

    // Find by Transaction ID
    await expect(findTransactionsPage.transactionIdInput).toBeEditable();
    await expect(findTransactionsPage.findByIdButton).toBeEnabled();
    // Find by Date
    await expect(findTransactionsPage.transactionDateInput).toBeEditable();
    await expect(findTransactionsPage.dateFormatHint).toBeVisible();
    await expect(findTransactionsPage.findByDateButton).toBeEnabled();
    // Find by Date Range
    await expect(findTransactionsPage.fromDateInput).toBeEditable();
    await expect(findTransactionsPage.toDateInput).toBeEditable();
    await expect(findTransactionsPage.findByDateRangeButton).toBeEnabled();
    // Find by Amount
    await expect(findTransactionsPage.amountInput).toBeEditable();
    await expect(findTransactionsPage.findByAmountButton).toBeEnabled();

    // Results are hidden until a search is made.
    await expect(findTransactionsPage.resultsTable).toBeHidden();
  });

  test("finds today's transactions by date and by date range", { tag: '@modifies-data' }, async ({
    accountServicesMenu,
    transferFundsPage,
    findTransactionsPage,
  }) => {
    // Create a transaction dated today so the search has something to find.
    await accountServicesMenu.openTransferFunds();
    const amount = uniqueAmount();
    const { from } = await transferFundsPage.transfer(amount);
    await expect(transferFundsPage.resultHeading).toHaveText('Transfer Complete!');

    await accountServicesMenu.openFindTransactions();
    await findTransactionsPage.selectAccount(from);
    await findTransactionsPage.findByDate(today());
    await expect(findTransactionsPage.resultsHeading).toHaveText('Transaction Results');
    await expect(findTransactionsPage.resultsTable).toContainText(`$${amount}`);

    await accountServicesMenu.openFindTransactions();
    await findTransactionsPage.selectAccount(from);
    await findTransactionsPage.findByDateRange(today(), today());
    await expect(findTransactionsPage.resultsHeading).toHaveText('Transaction Results');
    await expect(findTransactionsPage.resultsTable).toContainText(`$${amount}`);
  });

  test('invalid date format shows a validation error', async ({ accountServicesMenu, findTransactionsPage }) => {
    await accountServicesMenu.openFindTransactions();
    await findTransactionsPage.findByDate('2026/13/45');

    await expect(findTransactionsPage.transactionDateError).toBeVisible();
    await expect(findTransactionsPage.transactionDateError).not.toBeEmpty();
    await expect(findTransactionsPage.resultsTable).toBeHidden();
  });
});
