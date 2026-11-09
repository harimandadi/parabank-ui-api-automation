/**
 * Endpoint: /api/brandsList
 *   API 3  GET → 200 + all brands
 *   API 4  PUT → 405 "This request method is not supported."
 */
import { apiTest as test, expect } from '../../../fixtures/apiTest';
import {
  expectFrameworkMethodNotAllowed,
  expectMethodNotSupported,
  expectRespondsWithin,
  expectSchema,
} from '../../../api/automation-exercise/assertions';
import { BrandsListSchema, ProductsListSchema } from '../../../api/automation-exercise/schemas';

test.describe('API 3-4: /brandsList', { tag: '@api' }, () => {
  test.describe('positive', () => {
    test('GET returns all brands and matches the BrandsList schema (API 3)', { tag: '@smoke' }, async ({ brandsApi }) => {
      const result = await brandsApi.getAll();

      expect(result.httpStatus).toBe(200);
      const body = expectSchema(BrandsListSchema, result.body, 'BrandsList');
      expect(body.brands.length).toBeGreaterThan(0);
    });

    test('every brand id is unique', async ({ brandsApi }) => {
      const { brands } = expectSchema(BrandsListSchema, (await brandsApi.getAll()).body, 'BrandsList');
      const ids = brands.map((b) => b.id);

      expect(new Set(ids).size).toBe(ids.length);
    });

    test('every brand used by a product exists in the brands list (cross-endpoint consistency)', async ({ brandsApi, productsApi }) => {
      const { brands } = expectSchema(BrandsListSchema, (await brandsApi.getAll()).body, 'BrandsList');
      const { products } = expectSchema(ProductsListSchema, (await productsApi.getAll()).body, 'ProductsList');
      const brandNames = new Set(brands.map((b) => b.brand));

      const missing = [...new Set(products.map((p) => p.brand))].filter((name) => !brandNames.has(name));
      expect(missing, 'product brands that are not in /brandsList').toEqual([]);
    });
  });

  test.describe('negative', () => {
    test('PUT is not supported (API 4)', async ({ brandsApi }) => {
      await expectMethodNotSupported(await brandsApi.callBrandsList('PUT'));
    });

    for (const method of ['POST', 'DELETE'] as const) {
      test(`${method} is not supported`, async ({ brandsApi }) => {
        await expectMethodNotSupported(await brandsApi.callBrandsList(method));
      });
    }
  });

  test.describe('edge', () => {
    test('PATCH is rejected with a REAL HTTP 405', async ({ brandsApi }) => {
      await expectFrameworkMethodNotAllowed(await brandsApi.callBrandsList('PATCH'));
    });

    test('responds within the time limit', async ({ brandsApi }) => {
      await expectRespondsWithin(() => brandsApi.getAll());
    });
  });
});
