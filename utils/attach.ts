import { test } from '@playwright/test';

/**
 * Attach data to the current test's report (Playwright HTML and Allure both show attachments).
 * Useful for API bodies, generated test data or anything you'd otherwise console.log.
 *
 *   await attachJson('created user', user);
 *
 * Must be called inside a running test (it uses test.info()).
 */
export async function attachJson(name: string, data: unknown): Promise<void> {
  await test.info().attach(name, {
    body: JSON.stringify(data, null, 2),
    contentType: 'application/json',
  });
}

/** Attach plain text, e.g. a log excerpt or a generated SQL / CSV snippet. */
export async function attachText(name: string, text: string): Promise<void> {
  await test.info().attach(name, { body: text, contentType: 'text/plain' });
}
