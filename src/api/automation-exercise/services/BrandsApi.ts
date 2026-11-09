import type { ApiClient, ApiResult, HttpMethod } from '../ApiClient';

/** API 3, 4: brands list. */
export class BrandsApi {
  constructor(private readonly client: ApiClient) {}

  /** API 3: GET /brandsList → all brands. */
  getAll(): Promise<ApiResult> {
    return this.client.send('GET', 'brandsList');
  }

  /** API 4 (and other negative cases): call /brandsList with any method. */
  callBrandsList(method: HttpMethod): Promise<ApiResult> {
    return this.client.send(method, 'brandsList');
  }
}
