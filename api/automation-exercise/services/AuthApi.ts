import type { ApiClient, ApiResult, FormFields, HttpMethod } from '../ApiClient';

export interface LoginDetails {
  email: string;
  password: string;
}

/** API 7, 8, 9, 10: verify login. */
export class AuthApi {
  constructor(private readonly client: ApiClient) {}

  /**
   * POST /verifyLogin.
   * Accepts a PARTIAL object so negative tests can leave out email or password (API 8).
   */
  verifyLogin(details: Partial<LoginDetails>): Promise<ApiResult> {
    const form: FormFields = {};
    if (details.email !== undefined) form.email = details.email;
    if (details.password !== undefined) form.password = details.password;
    return this.client.send('POST', 'verifyLogin', { form });
  }

  /** API 9 (and other negative cases): call /verifyLogin with any method. */
  callVerifyLogin(method: HttpMethod): Promise<ApiResult> {
    return this.client.send(method, 'verifyLogin');
  }
}
