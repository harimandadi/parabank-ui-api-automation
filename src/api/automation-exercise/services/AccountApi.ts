import type { ApiClient, ApiResult, FormFields, HttpMethod } from '../ApiClient';
import type { NewUser } from '../test-data/userBuilder';
import type { LoginDetails } from './AuthApi';

/** Turn a typed object into form fields, dropping keys whose value is undefined. */
function toForm(data: Partial<Record<string, string>>): FormFields {
  return Object.fromEntries(
    Object.entries(data).filter((entry): entry is [string, string] => entry[1] !== undefined),
  );
}

/** API 11, 12, 13, 14: create, delete, update and read a user account. */
export class AccountApi {
  constructor(private readonly client: ApiClient) {}

  /** API 11: POST /createAccount. Partial so negative tests can leave fields out. */
  create(user: Partial<NewUser>): Promise<ApiResult> {
    return this.client.send('POST', 'createAccount', { form: toForm(user) });
  }

  /** API 13: PUT /updateAccount. */
  update(user: Partial<NewUser>): Promise<ApiResult> {
    return this.client.send('PUT', 'updateAccount', { form: toForm(user) });
  }

  /** API 12: DELETE /deleteAccount with email + password. */
  delete(details: Partial<LoginDetails>): Promise<ApiResult> {
    return this.client.send('DELETE', 'deleteAccount', { form: toForm(details) });
  }

  /** API 14: GET /getUserDetailByEmail?email=... Pass undefined to omit the parameter. */
  getByEmail(email: string | undefined): Promise<ApiResult> {
    const query = email === undefined ? undefined : { email };
    return this.client.send('GET', 'getUserDetailByEmail', { query });
  }

  /** Negative cases: call an account endpoint with an unsupported method. */
  call(method: HttpMethod, path: 'createAccount' | 'updateAccount' | 'deleteAccount' | 'getUserDetailByEmail'): Promise<ApiResult> {
    return this.client.send(method, path);
  }
}
