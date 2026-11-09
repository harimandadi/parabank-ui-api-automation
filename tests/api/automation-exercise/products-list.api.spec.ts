/**
 * Endpoint: /api/productsList
 *   API 1  GET  → 200 + all products
 *   API 2  POST → 405 "This request method is not supported."
 */
import { apiTest as test, expect } from '../../../fixtures/apiTest';
import {
  expectFrameworkMethodNotAllowed,
  expectMethodNotSupported,
  expectRespondsWithin,
  expectSchema,
} from '../../../api/automation-exercise/assertions';
import { ProductsListSchema } from '../../../api/automation-exercise/schemas';

test.describe('API 1-2: /productsList', { tag: '@api' }, () => {
  test.describe('positive', () => {
    test('GET returns all products and matches the ProductsList schema (API 1)', async ({ productsApi }) => {
      const result = await productsApi.getAll();

      expect(result.httpStatus).toBe(200);
      const body = expectSchema(ProductsListSchema, result.body, 'ProductsList'); // shape, types, price format
      expect(body.responseCode).toBe(200);
      expect(body.products.length).toBeGreaterThan(0);
    });

    test('every product id is unique', async ({ productsApi }) => {
      const { products } = expectSchema(ProductsListSchema, (await productsApi.getAll()).body, 'ProductsList');
      const ids = products.map((p) => p.id);

      expect(new Set(ids).size).toBe(ids.length);
    });

    test('every product belongs to a known user type', async ({ productsApi }) => {
      const { products } = expectSchema(ProductsListSchema, (await productsApi.getAll()).body, 'ProductsList');
      const knownUserTypes = ['Women', 'Men', 'Kids'];

      const unknown = products.filter((p) => !knownUserTypes.includes(p.category.usertype.usertype));
      expect(unknown, 'products with an unexpected user type').toEqual([]);
    });
  });

  test.describe('negative', () => {
    test('POST is not supported (API 2)', async ({ productsApi }) => {
      await expectMethodNotSupported(await productsApi.callProductsList('POST'));
    });

    for (const method of ['PUT', 'DELETE'] as const) {
      test(`${method} is not supported`, async ({ productsApi }) => {
        await expectMethodNotSupported(await productsApi.callProductsList(method));
      });
    }
  });

  test.describe('edge', () => {
    test('PATCH is rejected by the server itself with a REAL HTTP 405 and a different body', async ({ productsApi }) => {
      // Unlike POST/PUT/DELETE (HTTP 200 + responseCode 405), PATCH never reaches the API handler.
      await expectFrameworkMethodNotAllowed(await productsApi.callProductsList('PATCH'));
    });

    test('responds within the time limit', async ({ productsApi }) => {
      await expectRespondsWithin(() => productsApi.getAll());
    });

    test('returns JSON even though the Content-Type header says text/html', async ({ productsApi }) => {
      const result = await productsApi.getAll();

      expect(result.contentType).toMatch(/text\/html|application\/json/); // documents the server's header
      expect(typeof result.body).toBe('object');                          // ...but the body still parses as JSON
    });

    test('repeated calls return the same products (stable, idempotent GET)', async ({ productsApi }) => {
      const first = expectSchema(ProductsListSchema, (await productsApi.getAll()).body, 'ProductsList');
      const second = expectSchema(ProductsListSchema, (await productsApi.getAll()).body, 'ProductsList');

      expect(second.products.map((p) => p.id)).toEqual(first.products.map((p) => p.id));
    });
  });
});
