/**
 * Endpoint: /api/updateAccount
 *   API 13  PUT with all user fields → 200 "User updated!"
 *
 * Uses the `registeredUser` fixture: a fresh account per test, always deleted afterwards.
 */
import { apiTest as test, expect } from '../../../fixtures/apiTest';
import { expectApiCode, expectSchema } from '../../../api/automation-exercise/assertions';
import { AE_MESSAGES, RESPONSE_CODE } from '../../../api/automation-exercise/messages';
import { UserDetailSchema } from '../../../api/automation-exercise/schemas';
import { buildUser } from '../../../api/automation-exercise/test-data/userBuilder';

test.describe('API 13: /updateAccount', { tag: ['@api', '@auth', '@creates-account', '@modifies-data'] }, () => {
  test.describe('positive', () => {
    test('updates an account → 200 "User updated!" (API 13)', async ({ accountApi, registeredUser }) => {
      const result = await accountApi.update({ ...registeredUser, company: 'Updated Co' });

      await expectApiCode(result, RESPONSE_CODE.ok, AE_MESSAGES.userUpdated);
    });

    test('end to end: the change is visible when the account is read back', async ({ accountApi, registeredUser }) => {
      const newName = `${registeredUser.name} Updated`;
      await expectApiCode(await accountApi.update({ ...registeredUser, name: newName, city: 'Chennai' }), RESPONSE_CODE.ok, AE_MESSAGES.userUpdated);

      const detail = expectSchema(UserDetailSchema, (await accountApi.getByEmail(registeredUser.email)).body, 'UserDetail');

      expect(detail.user.name).toBe(newName);
      expect(detail.user.email).toBe(registeredUser.email); // email is the identity: unchanged
      if (detail.user.city !== undefined) expect(detail.user.city).toBe('Chennai');
    });
  });

  test.describe('negative', () => {
    test('an email with no account cannot be updated → 404', async ({ accountApi }) => {
      const stranger = buildUser(); // never created

      await expectApiCode(await accountApi.update(stranger), RESPONSE_CODE.notFound, /not found/i);
    });

    test('the wrong password cannot update the account → 404', async ({ accountApi, registeredUser }) => {
      const result = await accountApi.update({ ...registeredUser, password: `${registeredUser.password}-wrong`, company: 'Hacked' });

      await expectApiCode(result, RESPONSE_CODE.notFound, /not found/i);
    });
  });

  test.describe('edge', () => {
    test('updating with the same data again still succeeds (idempotent PUT)', async ({ accountApi, registeredUser }) => {
      await expectApiCode(await accountApi.update(registeredUser), RESPONSE_CODE.ok, AE_MESSAGES.userUpdated);
      await expectApiCode(await accountApi.update(registeredUser), RESPONSE_CODE.ok, AE_MESSAGES.userUpdated);
    });
  });
});
