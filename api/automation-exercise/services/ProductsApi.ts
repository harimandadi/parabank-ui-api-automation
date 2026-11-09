import type { ApiClient, ApiResult, HttpMethod } from '../ApiClient';

/** API 1, 2, 5, 6: products list and product search. */
export class ProductsApi {
  constructor(private readonly client: ApiClient) {}

  /** API 1: GET /productsList → all products. */
  getAll(): Promise<ApiResult> {
    return this.client.send('GET', 'productsList');
  }

  /** API 2 (and other negative cases): call /productsList with any method. */
  callProductsList(method: HttpMethod): Promise<ApiResult> {
    return this.client.send(method, 'productsList');
  }

  /**
   * API 5: POST /searchProduct with search_product.
   * Pass `undefined` to omit the parameter entirely (API 6, the negative case).
   */
  search(term: string | undefined): Promise<ApiResult> {
    const form = term === undefined ? undefined : { search_product: term };
    return this.client.send('POST', 'searchProduct', { form });
  }

  /** Negative case: call /searchProduct with a method other than POST. */
  callSearch(method: HttpMethod, term = 'top'): Promise<ApiResult> {
    return method === 'GET'
      ? this.client.send(method, 'searchProduct', { query: { search_product: term } })
      : this.client.send(method, 'searchProduct', { form: { search_product: term } });
  }
}
