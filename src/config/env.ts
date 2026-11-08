import path from 'path';
import dotenv from 'dotenv';
import { ENVIRONMENTS, EnvironmentName, isEnvironmentName } from './environments';

/**
 * Loads configuration in this order (first value found wins):
 *   1. Real environment variables (shell, CI secrets)
 *   2. .env.<TEST_ENV>   e.g. .env.staging  - per-environment overrides (git-ignored)
 *   3. .env              - local defaults and credentials (git-ignored)
 *   4. src/config/environments.ts - non-secret defaults such as the base URL
 * Secrets have no defaults in code: copy .env.example to .env and fill them in.
 */
const ROOT = path.resolve(__dirname, '..', '..');
const ROOT_ENV_FILE = path.join(ROOT, '.env');

// TEST_ENV may itself live in .env, so peek at .env first without touching process.env.
const fromRootFile: Record<string, string> = {};
dotenv.config({ path: ROOT_ENV_FILE, processEnv: fromRootFile, quiet: true });

const requestedEnv = (process.env.TEST_ENV ?? fromRootFile.TEST_ENV ?? 'qa').toLowerCase();
if (!isEnvironmentName(requestedEnv)) {
  throw new Error(`Unknown TEST_ENV "${requestedEnv}". Use one of: ${Object.keys(ENVIRONMENTS).join(', ')}`);
}
const envName: EnvironmentName = requestedEnv;

dotenv.config({ path: [path.join(ROOT, `.env.${envName}`), ROOT_ENV_FILE], quiet: true });

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Add it to .env (see .env.example) or set it as an environment variable.`);
  }
  return value;
};

const envConfig = ENVIRONMENTS[envName];

export const ENV = {
  name: envName,
  baseUrl: process.env.BASE_URL ?? envConfig.baseUrl,
  allowDataChanges: envConfig.allowDataChanges,
  appPath: '/parabank',
  apiPath: '/parabank/services/bank',
  // Secrets are read lazily, so listing tests or loading the config works without them.
  get username(): string {
    return required('PARABANK_USERNAME');
  },
  get password(): string {
    return required('PARABANK_PASSWORD');
  },
  get registerUsername(): string {
    return process.env.PARABANK_REGISTER_USERNAME ?? 'john123';
  },
  get registerPassword(): string {
    return required('PARABANK_REGISTER_PASSWORD');
  },
};
