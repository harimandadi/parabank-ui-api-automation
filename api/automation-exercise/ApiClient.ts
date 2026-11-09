import { APIRequestContext, test } from '@playwright/test';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/** Key/value pairs sent as an x-www-form-urlencoded body (POST/PUT/DELETE) or as query params (GET). */
export type FormFields = Record<string, string>;

/** Everything a test may want to check about one HTTP exchange. */
export interface ApiResult {
  method: HttpMethod;
  path: string;
  httpStatus: number;
  contentType: string;
  durationMs: number;
  /** Parsed JSON body. Typed `unknown` on purpose: validate it with a schema before use. */
  body: unknown;
  /** Raw response text, useful in failure messages. */
  raw: string;
}

/**
 * The single place that talks HTTP for the Automation Exercise API.
 * Services (ProductsApi, AccountApi, ...) call `send`; tests never build requests themselves.
 */
export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async send(
    method: HttpMethod,
    path: string,
    options: { form?: FormFields; query?: FormFields } = {},
  ): Promise<ApiResult> {
    // Step names show method + path only, so passwords sent in forms never appear in reports.
    return test.step(`${method} ${path}`, async () => {
      const started = Date.now();
      const response = await this.request.fetch(path, {
        method,
        form: options.form,
        params: options.query,
      });
      const durationMs = Date.now() - started;
      const raw = await response.text();
      return {
        method,
        path,
        httpStatus: response.status(),
        contentType: response.headers()['content-type'] ?? '',
        durationMs,
        body: parseJson(raw, method, path),
        raw,
      };
    });
  }
}

function parseJson(raw: string, method: HttpMethod, path: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`${method} ${path} did not return JSON. First 200 characters:\n${raw.slice(0, 200)}`);
  }
}
