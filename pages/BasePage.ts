import { Page } from '@playwright/test';
import { ENV } from '../config/env';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async open(path: string): Promise<void> {
    await this.page.goto(`${ENV.appPath}/${path}`);
  }
}
