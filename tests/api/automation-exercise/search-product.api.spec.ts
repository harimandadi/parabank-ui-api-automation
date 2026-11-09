/**
 * Endpoint: /api/searchProduct
 *   API 5  POST with search_product    → 200 + matching products
 *   API 6  POST without search_product → 400 "Bad request, search_product parameter is missing in POST request."
 */
import { apiTest as test, expect } from '../../../fixtures/apiTest';
import {
  expectApiCode,
  expectMethodNotSupported,
  expectRespondsWithin,
  expectSchema,
} from '../../../api/automation-exercise/assertions';
import { AE_MESSAGES, RESPONSE_CODE } from '../../../api/automation-exercise/messages';
import { ProductsListSchema, type Product } from '../../../api/automation-exercise/schemas';

/** Letters only, lower-case: "T-Shirt" → "tshirt", so "tshirt" matches both spellings. */
const normalize = (text: string): string => text.toLowerCase().replace(/[^a-z]/g, '');

/** The search rule observed on the live API: the term appears in the name, category or user type. */
const matchesTerm = (product: Product, term: string): boolean =>
  normalize(`${product.name} ${product.category.category} ${product.category.usertype.usertype}`).includes(normalize(term));

test.describe('API 5-6: /searchProduct', { tag: '@api' }, () => {
  test.describe('positive', () => {
    for (const term of ['top', 'tshirt', 'jean', 'dress']) {
      test(`search "${term}" returns only matching products (API 5)`, async ({ productsApi }) => {
        const result = await productsApi.search(term);

        expect(result.httpStatus).toBe(200);
        const { products } = expectSchema(ProductsListSchema, result.body, 'ProductsList');
        expect(products.length).toBeGreaterThan(0);
        const nonMatching = products.filter((p) => !matchesTerm(p, term)).map((p) => p.name);
        expect(nonMatching, `results that don't contain "${term}"`).toEqual([]);
      });
    }

    test('an exact product name finds that product', { tag: '@smoke' }, async ({ productsApi }) => {
      const { products } = expectSchema(ProductsListSchema, (await productsApi.search('Blue Top')).body, 'ProductsList');

      expect(products.map((p) => p.name)).toContain('Blue Top');
    });

    test('every search result is a real product from /productsList', async ({ productsApi }) => {
      const all = expectSchema(ProductsListSchema, (await productsApi.getAll()).body, 'ProductsList');
      const found = expectSchema(ProductsListSchema, (await productsApi.search('top')).body, 'ProductsList');
      const allIds = new Set(all.products.map((p) => p.id));

      expect(found.products.filter((p) => !allIds.has(p.id))).toEqual([]);
    });
  });

  test.describe('negative', () => {
    test('missing search_product parameter returns 400 (API 6)', async ({ productsApi }) => {
      await expectApiCode(await productsApi.search(undefined), RESPONSE_CODE.badRequest, AE_MESSAGES.searchParamMissing);
    });

    for (const method of ['GET', 'PUT', 'DELETE'] as const) {
      test(`${method} is not supported`, async ({ productsApi }) => {
        await expectMethodNotSupported(await productsApi.callSearch(method));
      });
    }
  });

  test.describe('edge', () => {
    test('search is case-insensitive: "top", "TOP" and "Top" return the same products', async ({ productsApi }) => {
      const ids = async (term: string) =>
        expectSchema(ProductsListSchema, (await productsApi.search(term)).body, 'ProductsList').products.map((p) => p.id);

      const lower = await ids('top');
      expect(await ids('TOP')).toEqual(lower);
      expect(await ids('Top')).toEqual(lower);
    });

    test('a term with no matches returns 200 and an empty list (not an error)', async ({ productsApi }) => {
      const { products } = expectSchema(ProductsListSchema, (await productsApi.search('zzzz-no-such-product')).body, 'ProductsList');

      expect(products).toEqual([]);
    });

    test('an empty search term returns ALL products', async ({ productsApi }) => {
      const all = expectSchema(ProductsListSchema, (await productsApi.getAll()).body, 'ProductsList');
      const empty = expectSchema(ProductsListSchema, (await productsApi.search('')).body, 'ProductsList');

      expect(empty.products.length).toBe(all.products.length);
    });

    for (const term of ['%', '<script>alert(1)</script>', "' OR '1'='1"]) {
      test(`special characters are handled safely: ${JSON.stringify(term)}`, async ({ productsApi }) => {
        const result = await productsApi.search(term);

        expect(result.httpStatus).toBe(200);                                        // no server error
        const { products } = expectSchema(ProductsListSchema, result.body, 'ProductsList'); // still a valid list
        expect(products).toEqual([]);                                               // no accidental matches
      });
    }

    test('a very long search term is handled without a server error', async ({ productsApi }) => {
      const result = await productsApi.search('x'.repeat(1000));

      expect(result.httpStatus).toBe(200);
      expectSchema(ProductsListSchema, result.body, 'ProductsList');
    });

    test('responds within the time limit', async ({ productsApi }) => {
      await expectRespondsWithin(() => productsApi.search('top'));
    });
  });
});
