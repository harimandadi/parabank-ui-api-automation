import { APIRequestContext, APIResponse, test } from '@playwright/test';
import { ENV } from '../config/env';

export class LoginApi {
  constructor(private readonly request: APIRequestContext) {}

  /** GET /services/bank/login/{username}/{password} - returns the customer on success. */
  async login(username: string, password: string): Promise<APIResponse> {
    const path = `${ENV.apiPath}/login/${encodeURIComponent(username)}/${encodeURIComponent(password)}`;
    return test.step(`API: GET /login for "${username}"`, () =>
      this.request.get(path, { headers: { Accept: 'application/json' } }),
    );
  }
}
