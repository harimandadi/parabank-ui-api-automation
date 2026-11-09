/**
 * Endpoint: /api/getUserDetailByEmail
 *   API 14  GET ?email=... → 200 + user details
 */
import { apiTest as test, expect } from '../../../fixtures/apiTest';
import { expectApiCode, expectMethodNotSupported, expectRespondsWithin, expectSchema } from '../../../api/automation-exercise/assertions';
import { AE_MESSAGES, RESPONSE_CODE } from '../../../api/automation-exercise/messages';
import { UserDetailSchema } from '../../../api/automation-exercise/schemas';
import { uniqueId } from '../../../api/automation-exercise/test-data/userBuilder';

test.describe('API 14: /getUserDetailByEmail', { tag: '@api' }, () => {
  test.describe('positive', () => {
    test('returns the user and matches the UserDetail schema (API 14)', { tag: ['@auth', '@creates-account'] }, async ({ accountApi, registeredUser }, testInfo) => {
      const result = await accountApi.getByEmail(registeredUser.email);
      // Attach the raw body to the report: the public docs don't list the fields, so this
      // documents the real contract and lets the schema be tightened later.
      await testInfo.attach('user-detail-response.json', { body: result.raw, contentType: 'application/json' });

      expect(result.httpStatus).toBe(200);
      const detail = expectSchema(UserDetailSchema, result.body, 'UserDetail');
      expect(detail.user.email).toBe(registeredUser.email);
      expect(detail.user.name).toBe(registeredUser.name);
    });

    test('the response never exposes the password', { tag: ['@auth', '@creates-account'] }, async ({ accountApi, registeredUser }) => {
      const result = await accountApi.getByEmail(registeredUser.email);

      expect(result.raw).not.toContain(registeredUser.password);
    });
  });

  test.describe('negative', () => {
    test('an email with no account → 404', async ({ accountApi }) => {
      const result = await accountApi.getByEmail(`nobody.${uniqueId()}@example.invalid`);

      await expectApiCode(result, RESPONSE_CODE.notFound, AE_MESSAGES.emailNotFound);
    });

    test('missing email parameter → 400', async ({ accountApi }) => {
      await expectApiCode(await accountApi.getByEmail(undefined), RESPONSE_CODE.badRequest, AE_MESSAGES.emailParamMissing);
    });

    for (const method of ['POST', 'PUT', 'DELETE'] as const) {
      test(`${method} is not supported`, async ({ accountApi }) => {
        await expectMethodNotSupported(await accountApi.call(method, 'getUserDetailByEmail'));
      });
    }
  });

  test.describe('edge', () => {
    /*
     * FINDING (observed on the live API): sign-up does NOT validate email addresses, so other people
     * have real accounts with emails like "not-an-email" or "" on this shared server.
     * A fixed expectation ("malformed → 404") would therefore be wrong. What must ALWAYS hold is that the
     * lookup is an EXACT match: either "not found", or an account whose email is exactly the value asked for.
     * (These tests never print or attach the returned account: it may belong to someone else.)
     */
    for (const email of ['not-an-email', '']) {
      test(`lookup is an exact match for an unusual value: ${JSON.stringify(email)}`, async ({ accountApi }) => {
        const result = await accountApi.getByEmail(email);

        expect(result.httpStatus).toBe(200);
        const code = (result.body as { responseCode?: unknown }).responseCode;
        if (code === RESPONSE_CODE.ok) {
          const detail = expectSchema(UserDetailSchema, result.body, 'UserDetail');
          expect(detail.user.email, 'returned account must have EXACTLY the requested email').toBe(email);
        } else {
          await expectApiCode(result, RESPONSE_CODE.notFound, AE_MESSAGES.emailNotFound);
        }
      });
    }

    test('lookup is case-sensitive or case-insensitive, but never returns a DIFFERENT account', { tag: ['@auth', '@creates-account'] }, async ({ accountApi, registeredUser }) => {
      const result = await accountApi.getByEmail(registeredUser.email.toUpperCase());
      const code = (result.body as { responseCode?: unknown }).responseCode;

      if (code === RESPONSE_CODE.ok) {
        expect(expectSchema(UserDetailSchema, result.body, 'UserDetail').user.email.toLowerCase()).toBe(registeredUser.email.toLowerCase());
      } else {
        await expectApiCode(result, RESPONSE_CODE.notFound, AE_MESSAGES.emailNotFound);
      }
    });

    test('responds within the time limit', async ({ accountApi }) => {
      await expectRespondsWithin(() => accountApi.getByEmail(`nobody.${uniqueId()}@example.invalid`));
    });
  });
});
