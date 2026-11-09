import { expect, test } from '@playwright/test';
import type { ZodType } from 'zod';
import type { ApiResult } from './ApiClient';
import { AE_API } from './config';
import { AE_MESSAGES, RESPONSE_CODE } from './messages';
import { ApiMessageSchema, FrameworkErrorSchema, type ApiMessage } from './schemas';

/**
 * Validate a body against a zod schema and return it TYPED.
 * On failure the error lists every broken field path, e.g.
 *   Response does not match ProductsList schema:
 *     • products.3.price: price must look like "Rs. 500"
 */
export function expectSchema<T>(schema: ZodType<T>, body: unknown, schemaName: string): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  • ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Response does not match ${schemaName} schema:\n${details}\nBody: ${JSON.stringify(body).slice(0, 500)}`);
  }
  return result.data;
}

/**
 * Check a { responseCode, message } response.
 * This API always answers HTTP 200 and puts the real code in the body, so BOTH are checked.
 */
export async function expectApiCode(
  result: ApiResult,
  responseCode: number,
  message?: string | RegExp,
): Promise<ApiMessage> {
  return test.step(`expect responseCode ${responseCode}${message ? ` "${message}"` : ''}`, async () => {
    expect(result.httpStatus, `HTTP status of ${result.method} ${result.path} (this API always returns 200)`).toBe(200);
    const body = expectSchema(ApiMessageSchema, result.body, 'ApiMessage');
    expect(body.responseCode, `responseCode in the body of ${result.method} ${result.path}`).toBe(responseCode);
    if (message instanceof RegExp) expect(body.message).toMatch(message);
    else if (message !== undefined) expect(body.message).toBe(message);
    return body;
  });
}

/** A method the API handler rejects: HTTP 200 + { responseCode: 405, "This request method is not supported." }. */
export async function expectMethodNotSupported(result: ApiResult): Promise<void> {
  await expectApiCode(result, RESPONSE_CODE.methodNotAllowed, AE_MESSAGES.methodNotSupported);
}

/** A method the server framework rejects before the handler: REAL HTTP 405 + { detail }. */
export async function expectFrameworkMethodNotAllowed(result: ApiResult): Promise<void> {
  await test.step('expect real HTTP 405 with a "detail" body', async () => {
    expect(result.httpStatus, `HTTP status of ${result.method} ${result.path}`).toBe(405);
    const body = expectSchema(FrameworkErrorSchema, result.body, 'FrameworkError');
    expect(body.detail).toContain(`"${result.method}" not allowed`);
  });
}

/**
 * Non-functional check: the API answers within the configured limit.
 * Calls the endpoint TWICE and measures the second call: the first one may include
 * connection setup (DNS, TLS, an IPv6→IPv4 fallback), which says nothing about the API itself.
 */
export async function expectRespondsWithin(
  call: () => Promise<ApiResult>,
  maxMs: number = AE_API.maxResponseMs,
): Promise<ApiResult> {
  await call(); // warm-up: open the connection
  const result = await call(); // measured call
  expect(result.durationMs, `${result.method} ${result.path} took ${result.durationMs} ms (limit ${maxMs} ms)`).toBeLessThan(maxMs);
  return result;
}
