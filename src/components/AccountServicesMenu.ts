import { Locator, Page, test } from '@playwright/test';

/** Menu items shown under "Account Services" after login, in display order. */
export const ACCOUNT_SERVICES_LINKS = [
  'Open New Account',
  'Accounts Overview',
  'Transfer Funds',
  'Bill Pay',
  'Find Transactions',
  'Update Contact Info',
  'Request Loan',
  'Log Out',
] as const;

export type AccountServicesLink = (typeof ACCOUNT_SERVICES_LINKS)[number];

/** Left-hand "Account Services" menu shown after login. */
export class AccountServicesMenu {
  readonly welcomeText: Locator;
  readonly heading: Locator;
  readonly links: Locator;
  readonly transferFundsLink: Locator;
  readonly findTransactionsLink: Locator;
  readonly accountsOverviewLink: Locator;

  constructor(private readonly page: Page) {
    const panel = page.locator('#leftPanel');
    this.welcomeText = panel.locator('p.smallText');
    this.heading = panel.getByRole('heading', { name: 'Account Services' });
    this.links = panel.locator('ul li a');
    this.transferFundsLink = this.link('Transfer Funds');
    this.findTransactionsLink = this.link('Find Transactions');
    this.accountsOverviewLink = this.link('Accounts Overview');
  }

  link(name: AccountServicesLink): Locator {
    return this.page.locator('#leftPanel').getByRole('link', { name, exact: true });
  }

  async open(name: AccountServicesLink): Promise<void> {
    await test.step(`Open "${name}" from Account Services`, async () => {
      await this.link(name).click();
    });
  }

  async openTransferFunds(): Promise<void> {
    await this.open('Transfer Funds');
  }

  async openFindTransactions(): Promise<void> {
    await this.open('Find Transactions');
  }
}
