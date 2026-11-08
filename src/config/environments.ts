/**
 * Target environments, selected with TEST_ENV=local|qa|staging|prod (default: qa).
 *
 * ParaBank only has one public instance, so qa / staging / prod all point at the same URL
 * for now. When real hosts exist, change `baseUrl` here (or set BASE_URL in .env.<env>).
 * `local` is a private ParaBank in Docker (see docker-compose.yml).
 */
export type EnvironmentName = 'local' | 'qa' | 'staging' | 'prod';

export interface EnvironmentConfig {
  baseUrl: string;
  /** false = tests tagged @creates-account / @modifies-data are skipped (see playwright.config.ts). */
  allowDataChanges: boolean;
  /**
   * Default parallel workers. The public site is rate-limited by Cloudflare, so keep it low there;
   * a private Docker instance can take more. Override any time with WORKERS=n.
   */
  workers: number;
}

const PARABANK_URL = 'https://parabank.parasoft.com';

export const ENVIRONMENTS: Record<EnvironmentName, EnvironmentConfig> = {
  // 127.0.0.1, not localhost: on Windows "localhost" tries IPv6 first, adding a delay per request.
  local: { baseUrl: 'http://127.0.0.1:8080', allowDataChanges: true, workers: 4 },
  qa: { baseUrl: PARABANK_URL, allowDataChanges: true, workers: 2 },
  staging: { baseUrl: PARABANK_URL, allowDataChanges: true, workers: 2 },
  prod: { baseUrl: PARABANK_URL, allowDataChanges: false, workers: 2 },
};

export const isEnvironmentName = (value: string): value is EnvironmentName => value in ENVIRONMENTS;
