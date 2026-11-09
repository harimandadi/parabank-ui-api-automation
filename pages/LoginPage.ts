import { Locator, Page, test } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly registerLink: Locator;
  readonly forgotLoginLink: Locator;

  constructor(page: Page) {
    super(page);
    const panel = page.locator('#loginPanel');
    this.usernameInput = panel.locator('input[name="username"]');
    this.passwordInput = panel.locator('input[name="password"]');
    this.loginButton = panel.locator('input[type="submit"][value="Log In"]');
    this.errorMessage = page.locator('#rightPanel p.error');
    this.registerLink = panel.getByRole('link', { name: 'Register' });
    this.forgotLoginLink = panel.getByRole('link', { name: 'Forgot login info?' });
  }

  async goto(): Promise<void> {
    await this.open('index.htm');
  }

  async login(username: string, password: string): Promise<void> {
    await test.step(`Log in as "${username}"`, async () => {
      await this.usernameInput.fill(username);
      await this.passwordInput.fill(password);
      await this.loginButton.click();
    });
  }
}
