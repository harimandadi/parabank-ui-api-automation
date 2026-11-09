/**
 * Endpoint: /api/deleteAccount
 *   API 12  DELETE with email + password → 200 "Account deleted!"
 */
import { apiTest as test } from '../../../src/fixtures/apiTest';
import { expectApiCode } from '../../../src/api/automation-exercise/assertions';
import { AE_MESSAGES, RESPONSE_CODE } from '../../../src/api/automation-exercise/messages';
import { buildUser } from '../../../src/api/automation-exercise/test-data/userBuilder';

test.describe('API 12: /deleteAccount', { tag: ['@api', '@auth', '@creates-account', '@modifies-data'] }, () => {
  test.describe('positive', () => {
    test('deletes an account → 200 "Account deleted!" (API 12)', async ({ accountApi, registeredUser }) => {
      const result = await accountApi.delete({ email: registeredUser.email, password: registeredUser.password });

      await expectApiCode(result, RESPONSE_CODE.ok, AE_MESSAGES.accountDeleted);
    });

    test('end to end: a deleted account can no longer be found or logged into', async ({ accountApi, authApi, registeredUser }) => {
      const { email, password } = registeredUser;
      await expectApiCode(await accountApi.delete({ email, password }), RESPONSE_CODE.ok, AE_MESSAGES.accountDeleted);

      await expectApiCode(await accountApi.getByEmail(email), RESPONSE_CODE.notFound, AE_MESSAGES.emailNotFound);
      await expectApiCode(await authApi.verifyLogin({ email, password }), RESPONSE_CODE.notFound, AE_MESSAGES.userNotFound);
    });
  });

  test.describe('negative', () => {
    test('the wrong password does not delete the account → 404', async ({ accountApi, registeredUser }) => {
      const result = await accountApi.delete({ email: registeredUser.email, password: `${registeredUser.password}-wrong` });

      await expectApiCode(result, RESPONSE_CODE.notFound, /not found/i);
      // ...and the account still exists
      await expectApiCode(
        await accountApi.delete({ email: registeredUser.email, password: registeredUser.password }),
        RESPONSE_CODE.ok,
        AE_MESSAGES.accountDeleted,
      );
    });

    test('an email with no account → 404', async ({ accountApi }) => {
      const stranger = buildUser(); // never created

      await expectApiCode(await accountApi.delete({ email: stranger.email, password: stranger.password }), RESPONSE_CODE.notFound, /not found/i);
    });

    test('missing password → 400 bad request', async ({ accountApi, registeredUser }) => {
      await expectApiCode(await accountApi.delete({ email: registeredUser.email }), RESPONSE_CODE.badRequest, /missing|bad request/i);
    });
  });

  test.describe('edge', () => {
    test('deleting the same account twice: the second call → 404 (already gone)', async ({ accountApi, registeredUser }) => {
      const details = { email: registeredUser.email, password: registeredUser.password };

      await expectApiCode(await accountApi.delete(details), RESPONSE_CODE.ok, AE_MESSAGES.accountDeleted);
      await expectApiCode(await accountApi.delete(details), RESPONSE_CODE.notFound, /not found/i);
    });
  });
});
