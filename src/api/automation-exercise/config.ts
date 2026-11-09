/**
 * Settings for the Automation Exercise REST API (https://automationexercise.com/api_list).
 *
 * The base URL MUST end with "/" and request paths must NOT start with "/":
 * Playwright resolves paths like a browser, so "/productsList" against ".../api" would drop "/api".
 */
const rawBaseUrl = process.env.AE_BASE_URL ?? 'https://automationexercise.com/api';

export const AE_API = {
  /** e.g. https://automationexercise.com/api/  (trailing slash added if missing) */
  baseUrl: rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`,
  /** Upper limit for a "responds in time" check. Generous: this is a shared public server. */
  maxResponseMs: Number(process.env.AE_MAX_RESPONSE_MS ?? 5000),
} as const;
