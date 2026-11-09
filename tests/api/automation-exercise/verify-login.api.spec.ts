/**
 * Endpoint: /api/verifyLogin
 *   API 7   POST valid email + password   → 200 "User exists!"
 *   API 8   POST without email            → 400 "Bad request, email or password parameter is missing in POST request."
 *   API 9   DELETE                        → 405 "This request method is not supported."
 *   API 10  POST invalid email + password → 404 "User not found!"
 *
 * Tests tagged @auth send login details; the positive one creates (and deletes) a real account.
 */
import { apiTest as test, expect } from '../../../src/fixtures/apiTest';
import { expectApiCode, expectMethodNotSupported, expectSchema } from '../../../src/api/automation-exercise/assertions';
import { AE_MESSAGES, RESPONSE_CODE } from '../../../src/api/automation-exercise/messages';
import { ApiMessageSchema } from '../../../src/api/automation-exercise/schemas';
import { uniqueId } from '../../../src/api/automation-exercise/test-data/userBuilder';

/** Made-up details that can never match a real account. */
const unknownUser = () => ({ email: `nobody.${uniqueId()}@example.invalid`, password: 'not-a-real-password' });

test.describe('API 7-10: /verifyLogin', { tag: '@api' }, () => {
  test.describe('positive', () => {
    test('valid email and password → "User exists!" (API 7)', { tag: ['@auth', '@creates-account'] }, async ({ authApi, registeredUser }) => {
      const result = await authApi.verifyLogin({ email: registeredUser.email, password: registeredUser.password });

      await expectApiCode(result, RESPONSE_CODE.ok, AE_MESSAGES.userExists);
    });
  });

  test.describe('negative', () => {
    test('missing email → 400 (API 8)', { tag: '@auth' }, async ({ authApi }) => {
      await expectApiCode(await authApi.verifyLogin({ password: 'any-password' }), RESPONSE_CODE.badRequest, AE_MESSAGES.loginParamMissing);
    });

    test('missing password → 400 (same message as missing email)', { tag: '@auth' }, async ({ authApi }) => {
      await expectApiCode(await authApi.verifyLogin({ email: unknownUser().email }), RESPONSE_CODE.badRequest, AE_MESSAGES.loginParamMissing);
    });

    test('unknown email and password → 404 "User not found!" (API 10)', { tag: '@auth' }, async ({ authApi }) => {
      await expectApiCode(await authApi.verifyLogin(unknownUser()), RESPONSE_CODE.notFound, AE_MESSAGES.userNotFound);
    });

    test('correct email but wrong password → 404', { tag: ['@auth', '@creates-account'] }, async ({ authApi, registeredUser }) => {
      const result = await authApi.verifyLogin({ email: registeredUser.email, password: `${registeredUser.password}-wrong` });

      await expectApiCode(result, RESPONSE_CODE.notFound, AE_MESSAGES.userNotFound);
    });

    test('DELETE is not supported (API 9)', async ({ authApi }) => {
      await expectMethodNotSupported(await authApi.callVerifyLogin('DELETE'));
    });

    test('GET is not supported', async ({ authApi }) => {
      await expectMethodNotSupported(await authApi.callVerifyLogin('GET'));
    });
  });

  test.describe('edge', () => {
    test('empty email and password values → a client error (400 or 404), never a server error', { tag: '@auth' }, async ({ authApi }) => {
      // Parameters present but empty: the API may treat them as "missing" (400) or "no such user" (404).
      // Either is acceptable; what matters is a clean client error with a valid message body.
      const result = await authApi.verifyLogin({ email: '', password: '' });

      expect(result.httpStatus).toBe(200);
      const body = expectSchema(ApiMessageSchema, result.body, 'ApiMessage');
      expect([RESPONSE_CODE.badRequest, RESPONSE_CODE.notFound]).toContain(body.responseCode);
    });
  });
});
