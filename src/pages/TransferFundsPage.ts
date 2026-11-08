import { Locator, Page, test } from '@playwright/test';
import { BasePage } from './BasePage';

export class TransferFundsPage extends BasePage {
  // Form
  readonly heading: Locator;
  readonly amountLabel: Locator;
  readonly amountInput: Locator;
  readonly fromAccountSelect: Locator;
  readonly toAccountSelect: Locator;
  readonly transferButton: Locator;

  // Result
  readonly resultHeading: Locator;
  readonly amountResult: Locator;
  readonly fromAccountResult: Locator;
  readonly toAccountResult: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('#showForm h1.title');
    this.amountLabel = page.locator('#transferForm').getByText('Amount:');
    this.amountInput = page.locator('#amount');
    this.fromAccountSelect = page.locator('#fromAccountId');
    this.toAccountSelect = page.locator('#toAccountId');
    this.transferButton = page.locator('#transferForm input[type="submit"][value="Transfer"]');

    this.resultHeading = page.locator('#showResult h1.title');
    this.amountResult = page.locator('#amountResult');
    this.fromAccountResult = page.locator('#fromAccountIdResult');
    this.toAccountResult = page.locator('#toAccountIdResult');
  }

  async goto(): Promise<void> {
    await this.open('transfer.htm');
  }

  /** Account dropdowns are filled by an AJAX call after the page loads. */
  async waitForAccounts(): Promise<void> {
    await this.fromAccountSelect.locator('option').first().waitFor({ state: 'attached' });
    await this.toAccountSelect.locator('option').first().waitFor({ state: 'attached' });
  }

  async accountIds(): Promise<string[]> {
    await this.waitForAccounts();
    return this.fromAccountSelect.locator('option').evaluateAll((opts) =>
      opts.map((o) => (o as HTMLOptionElement).value),
    );
  }

  /** Transfers between the first and last account (same account if the user has only one). */
  async transfer(amount: string): Promise<{ from: string; to: string }> {
    const ids = await this.accountIds();
    const from = ids[0];
    const to = ids[ids.length - 1];
    await test.step(`Transfer $${amount} from account ${from} to ${to}`, async () => {
      await this.amountInput.fill(amount);
      await this.fromAccountSelect.selectOption(from);
      await this.toAccountSelect.selectOption(to);
      await this.transferButton.click();
    });
    return { from, to };
  }
}
