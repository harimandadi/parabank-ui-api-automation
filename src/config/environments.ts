/**
 * Target environments, selected with TEST_ENV=qa|staging|prod (default: qa).
 *
 * ParaBank only has one public instance, so for now every environment points at the
 * same URL. When real QA / staging / prod hosts exist, change `baseUrl` here (or set
 * BASE_URL in that environment's .env.<env> file).
 */
export type EnvironmentName = 'qa' | 'staging' | 'prod';

export interface EnvironmentConfig {
  baseUrl: string;
  /** false = tests tagged @creates-account / @modifies-data are skipped (see playwright.config.ts). */
  allowDataChanges: boolean;
}

const PARABANK_URL = 'https://parabank.parasoft.com';

export const ENVIRONMENTS: Record<EnvironmentName, EnvironmentConfig> = {
  qa: { baseUrl: PARABANK_URL, allowDataChanges: true },
  staging: { baseUrl: PARABANK_URL, allowDataChanges: true },
  prod: { baseUrl: PARABANK_URL, allowDataChanges: false },
};

export const isEnvironmentName = (value: string): value is EnvironmentName => value in ENVIRONMENTS;
