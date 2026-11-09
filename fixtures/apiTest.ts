import path from 'path';
import { APIRequestContext, test as base, request as playwrightRequest } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { ApiClient } from '../api/automation-exercise/ApiClient';
import { AE_API } from '../api/automation-exercise/config';
import { ProductsApi } from '../api/automation-exercise/services/ProductsApi';
import { BrandsApi } from '../api/automation-exercise/services/BrandsApi';
import { AuthApi } from '../api/automation-exercise/services/AuthApi';
import { AccountApi } from '../api/automation-exercise/services/AccountApi';
import { buildUser, type NewUser } from '../api/automation-exercise/test-data/userBuilder';
import { expectApiCode } from '../api/automation-exercise/assertions';
import { AE_MESSAGES, RESPONSE_CODE } from '../api/automation-exercise/messages';

type ApiWorkerFixtures = {
  /**
   * Request context pointed at the Automation Exercise API (separate from the ParaBank one).
   * WORKER-scoped: one connection shared by all tests in a worker. Opening the first connection
   * can be slow (e.g. a broken IPv6 route makes it wait ~6 s before falling back to IPv4),
   * so paying that once per worker instead of once per test keeps the suite fast.
   */
  aeRequest: APIRequestContext;
};

type ApiFixtures = {
  productsApi: ProductsApi;
  brandsApi: BrandsApi;
  authApi: AuthApi;
  accountApi: AccountApi;
  /**
   * A real, freshly created account. Created before the test and ALWAYS deleted afterwards,
   * even when the test fails, so the shared server isn't left with test data.
   */
  registeredUser: NewUser;
  /** Auto fixture: Allure Epic/Feature/Story labels from the spec's folder path. */
  allureLabels: void;
};

const titleCase = (s: string): string =>
  s.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// Extends plain Playwright `test`, not the ParaBank UI fixtures: these tests need no browser,
// no ParaBank pages and no ParaBank login or config.
export const apiTest = base.extend<ApiFixtures, ApiWorkerFixtures>({
  // tests/api/automation-exercise/products-list.api.spec.ts
  //   -> Epic "API", Feature "Automation Exercise", Story "Products List"
  allureLabels: [
    async ({}, use, testInfo) => {
      const [layer, module, file] = path.relative(testInfo.project.testDir, testInfo.file).split(path.sep);
      if (layer && module && file) {
        await allure.epic(layer.toUpperCase());
        await allure.feature(titleCase(module));
        await allure.story(titleCase(file.replace(/(\.api)?\.spec\.ts$/, '')));
      }
      await allure.parameter('api', AE_API.baseUrl);
      await use();
    },
    { auto: true },
  ],

  aeRequest: [
    async ({}, use) => {
      const context = await playwrightRequest.newContext({ baseURL: AE_API.baseUrl });
      await use(context);
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  productsApi: async ({ aeRequest }, use) => use(new ProductsApi(new ApiClient(aeRequest))),
  brandsApi: async ({ aeRequest }, use) => use(new BrandsApi(new ApiClient(aeRequest))),
  authApi: async ({ aeRequest }, use) => use(new AuthApi(new ApiClient(aeRequest))),
  accountApi: async ({ aeRequest }, use) => use(new AccountApi(new ApiClient(aeRequest))),

  registeredUser: async ({ accountApi }, use) => {
    const user = buildUser();
    await expectApiCode(await accountApi.create(user), RESPONSE_CODE.created, AE_MESSAGES.userCreated);
    await use(user);
    // Teardown runs even if the test failed. A test that already deleted the user gets 404 here: fine.
    await accountApi.delete({ email: user.email, password: user.password });
  },
});

export { expect } from '@playwright/test';
