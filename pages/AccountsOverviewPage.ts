import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { readTable } from '../utils/table';
import { parseCurrency } from '../utils/string';

export interface AccountSummary {
  account: string;
  balance: number;
  available: number;
}

export class AccountsOverviewPage extends BasePage {
  readonly heading: Locator;
  readonly welcomeText: Locator;
  readonly logoutLink: Locator;
  readonly accountsTable: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Accounts Overview' });
    this.welcomeText = page.locator('#leftPanel p.smallText');
    this.logoutLink = page.getByRole('link', { name: 'Log Out' });
    this.accountsTable = page.locator('#accountTable');
  }

  /**
   * The accounts table as numbers: [{ account: '13344', balance: 515.5, available: 515.5 }].
   * The table is filled by an AJAX call, so wait for the first account link before reading.
   * The "Total" row is left out.
   */
  async getAccounts(): Promise<AccountSummary[]> {
    await expect(this.accountsTable.locator('tbody tr a').first()).toBeVisible();
    const rows = await readTable(this.accountsTable);
    return rows
      .filter((row) => /^\d+$/.test(row['Account'] ?? ''))
      .map((row) => ({
        account: row['Account']!,
        balance: parseCurrency(row['Balance*'] ?? ''),
        available: parseCurrency(row['Available Amount'] ?? ''),
      }));
  }

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }
}
