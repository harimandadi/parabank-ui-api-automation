import { test, expect } from '../../../src/fixtures/baseTest';
import { ENV } from '../../../src/config/env';
import { CustomerDetails } from '../../../src/pages/RegisterPage';
import data from '../../../test-data/registerData.json';

const newCustomer = (overrides: Partial<CustomerDetails> = {}): CustomerDetails => ({
  ...data.customer,
  username: ENV.registerUsername,
  password: ENV.registerPassword,
  confirmPassword: ENV.registerPassword,
  ...overrides,
});

test.describe('Register - UI', () => {
  test.beforeEach(async ({ registerPage }) => {
    await registerPage.goto();
  });

  test('register page shows the sign-up form', async ({ registerPage }) => {
    await expect(registerPage.heading).toBeVisible();
    await expect(registerPage.firstNameInput).toBeVisible();
    await expect(registerPage.usernameInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.confirmPasswordInput).toBeVisible();
    await expect(registerPage.registerButton).toBeVisible();
  });

  test('submitting an empty form shows required-field errors', async ({ registerPage }) => {
    await registerPage.registerButton.click();
    for (const [fieldId, message] of Object.entries(data.requiredFieldErrors)) {
      await expect(registerPage.fieldError(fieldId)).toHaveText(message);
    }
  });

  test('mismatched passwords show an error', async ({ registerPage }) => {
    await registerPage.register(newCustomer({ confirmPassword: 'different_pass' }));
    await expect(registerPage.fieldError('repeatedPassword')).toHaveText(data.messages.passwordMismatch);
  });

  // Tagged @creates-account: submits a real registration on the target site.
  // A username can only be registered once, so each run uses a unique one.
  test('new user can register and then log in @creates-account', async ({ registerPage, loginPage, accountsOverviewPage }) => {
    const username = `${ENV.registerUsername}_${Date.now().toString().slice(-7)}`;
    await registerPage.register(newCustomer({ username }));

    await expect(registerPage.welcomeHeading).toHaveText(`Welcome ${username}`);
    await expect(registerPage.successMessage).toHaveText(data.messages.success);

    await accountsOverviewPage.logout();
    await loginPage.login(username, ENV.registerPassword);
    await expect(accountsOverviewPage.heading).toBeVisible();
  });

  // ENV.registerUsername (john123) is already registered on ParaBank, so this is rejected.
  test('registering an existing username shows an error', async ({ registerPage }) => {
    await registerPage.register(newCustomer());
    await expect(registerPage.fieldError('customer.username')).toHaveText(data.messages.usernameExists);
  });
});
