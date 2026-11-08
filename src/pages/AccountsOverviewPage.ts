import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

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

  async logout(): Promise<void> {
    await this.logoutLink.click();
  }
}
