import { test, expect } from '../../../src/fixtures/baseTest';
import { ENV } from '../../../src/config/env';
import data from '../../../test-data/loginData.json';

test.describe('Login - API', () => {
  test('valid credentials return the customer', async ({ loginApi }) => {
    const response = await loginApi.login(ENV.username, ENV.password);
    expect(response.status()).toBe(200);

    const customer = await response.json();
    expect(customer).toHaveProperty('id');
    expect(customer).toHaveProperty('firstName');
    expect(customer).toHaveProperty('lastName');
  });

  test('invalid credentials return 400', async ({ loginApi }) => {
    const response = await loginApi.login(data.invalidUser.username, data.invalidUser.password);
    expect(response.status()).toBe(400);
    expect(await response.text()).toContain(data.messages.apiInvalidCredentials);
  });
});
