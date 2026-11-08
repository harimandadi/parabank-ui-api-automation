import { Locator, Page, test } from '@playwright/test';
import { BasePage } from './BasePage';

export class FindTransactionsPage extends BasePage {
  readonly heading: Locator;
  readonly accountSelect: Locator;

  // Find by Transaction ID
  readonly transactionIdInput: Locator;
  readonly findByIdButton: Locator;

  // Find by Date
  readonly transactionDateInput: Locator;
  readonly findByDateButton: Locator;
  readonly transactionDateError: Locator;
  readonly dateFormatHint: Locator;

  // Find by Date Range
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly findByDateRangeButton: Locator;

  // Find by Amount
  readonly amountInput: Locator;
  readonly findByAmountButton: Locator;

  // Results
  readonly resultsHeading: Locator;
  readonly resultsTable: Locator;
  readonly resultRows: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('#formContainer h1.title');
    this.accountSelect = page.locator('#accountId');

    this.transactionIdInput = page.locator('#transactionId');
    this.findByIdButton = page.locator('#findById');

    this.transactionDateInput = page.locator('#transactionDate');
    this.findByDateButton = page.locator('#findByDate');
    this.transactionDateError = page.locator('#transactionDateError');
    this.dateFormatHint = page.locator('#formContainer').getByText('MM-DD-YYYY').first();

    this.fromDateInput = page.locator('#fromDate');
    this.toDateInput = page.locator('#toDate');
    this.findByDateRangeButton = page.locator('#findByDateRange');

    this.amountInput = page.locator('#formContainer #amount');
    this.findByAmountButton = page.locator('#findByAmount');

    this.resultsHeading = page.locator('#resultContainer h1.title');
    this.resultsTable = page.locator('#transactionTable');
    this.resultRows = page.locator('#transactionTable tbody tr');
  }

  async goto(): Promise<void> {
    await this.open('findtrans.htm');
  }

  async selectAccount(accountId: string): Promise<void> {
    await this.accountSelect.locator(`option[value="${accountId}"]`).waitFor({ state: 'attached' });
    await this.accountSelect.selectOption(accountId);
  }

  async findByAmount(amount: string): Promise<void> {
    await test.step(`Find transactions by amount $${amount}`, async () => {
      await this.amountInput.fill(amount);
      await this.findByAmountButton.click();
    });
  }

  async findByDate(date: string): Promise<void> {
    await test.step(`Find transactions on ${date}`, async () => {
      await this.transactionDateInput.fill(date);
      await this.findByDateButton.click();
    });
  }

  async findByDateRange(from: string, to: string): Promise<void> {
    await test.step(`Find transactions between ${from} and ${to}`, async () => {
      await this.fromDateInput.fill(from);
      await this.toDateInput.fill(to);
      await this.findByDateRangeButton.click();
    });
  }
}
