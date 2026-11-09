/**
 * Endpoint: /api/createAccount
 *   API 11  POST with all user fields → 201 "User created!"
 *
 * Every account created here is deleted again in afterEach, even when a test fails.
 */
import { apiTest as test, expect } from '../../../fixtures/apiTest';
import {
  expectApiCode,
  expectFrameworkMethodNotAllowed,
  expectSchema,
} from '../../../api/automation-exercise/assertions';
import { AE_MESSAGES, RESPONSE_CODE } from '../../../api/automation-exercise/messages';
import { UserDetailSchema } from '../../../api/automation-exercise/schemas';
import { buildUser, type NewUser } from '../../../api/automation-exercise/test-data/userBuilder';

test.describe('API 11: /createAccount', { tag: '@api' }, () => {
  /** Accounts this test created, removed after each test. */
  let created: NewUser[] = [];

  test.afterEach(async ({ accountApi }) => {
    for (const user of created) await accountApi.delete({ email: user.email, password: user.password });
    created = [];
  });

  test.describe('positive', () => {
    test('creates an account → 201 "User created!" (API 11)', { tag: ['@auth', '@creates-account'] }, async ({ accountApi }) => {
      const user = buildUser();
      created.push(user);

      await expectApiCode(await accountApi.create(user), RESPONSE_CODE.created, AE_MESSAGES.userCreated);
    });

    test('end to end: the new account can be read back with the same details', { tag: ['@auth', '@creates-account'] }, async ({ accountApi }) => {
      const user = buildUser({ city: 'Bengaluru' });
      created.push(user);
      await expectApiCode(await accountApi.create(user), RESPONSE_CODE.created, AE_MESSAGES.userCreated);

      const detail = expectSchema(UserDetailSchema, (await accountApi.getByEmail(user.email)).body, 'UserDetail');

      expect(detail.user.email).toBe(user.email);
      expect(detail.user.name).toBe(user.name);
      if (detail.user.city !== undefined) expect(detail.user.city).toBe('Bengaluru');
    });

    for (const title of ['Mr', 'Mrs', 'Miss'] as const) {
      test(`accepts every documented title: ${title}`, { tag: ['@auth', '@creates-account'] }, async ({ accountApi }) => {
        const user = buildUser({ title });
        created.push(user);

        await expectApiCode(await accountApi.create(user), RESPONSE_CODE.created, AE_MESSAGES.userCreated);
      });
    }
  });

  test.describe('negative', () => {
    test('an email that is already registered is rejected with 400', { tag: ['@auth', '@creates-account'] }, async ({ accountApi }) => {
      const user = buildUser();
      created.push(user);
      await expectApiCode(await accountApi.create(user), RESPONSE_CODE.created, AE_MESSAGES.userCreated);

      const duplicate = await accountApi.create({ ...buildUser(), email: user.email });

      await expectApiCode(duplicate, RESPONSE_CODE.badRequest, /exist/i);
    });

    test('missing email → 400 bad request', { tag: '@auth' }, async ({ accountApi }) => {
      const { email, ...withoutEmail } = buildUser();

      await expectApiCode(await accountApi.create(withoutEmail), RESPONSE_CODE.badRequest, /email|missing|bad request/i);
      void email;
    });

    test('missing password → 400 bad request', { tag: '@auth' }, async ({ accountApi }) => {
      const { password, ...withoutPassword } = buildUser();

      await expectApiCode(await accountApi.create(withoutPassword), RESPONSE_CODE.badRequest, /password|missing|bad request/i);
      void password;
    });
  });

  test.describe('edge', () => {
    test('GET is rejected by the server with a REAL HTTP 405', async ({ accountApi }) => {
      await expectFrameworkMethodNotAllowed(await accountApi.call('GET', 'createAccount'));
    });
  });
});
