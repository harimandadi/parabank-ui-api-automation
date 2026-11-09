import path from 'path';
import dotenv from 'dotenv';
import { ENVIRONMENTS, isEnvironmentName } from './environments';

/**
 * The settings every test reads. Values set in the terminal or CI win over .env,
 * and .env wins over the defaults in environments.ts. Passwords have no defaults in code.
 */

// 1. Load .env from the project root (works whichever folder the command is run from).
dotenv.config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

// 2. Which environment? (terminal/CI, then .env, then 'qa')
const name = (process.env.TEST_ENV ?? 'qa').toLowerCase();

// 3. Is it a real one? Stop early with a helpful message if not.
if (!isEnvironmentName(name)) {
  throw new Error(`Unknown TEST_ENV "${name}". Use one of: ${Object.keys(ENVIRONMENTS).join(', ')}`);
}

// 4. Secrets must exist; say exactly what is missing and where to add it.
const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing ${key}. Add it to .env (see .env.example) or set it as an environment variable.`);
  return value;
};

// 5. The settings card.
export const ENV = {
  name,
  ...ENVIRONMENTS[name], // baseUrl, allowDataChanges, workers
  baseUrl: process.env.BASE_URL ?? ENVIRONMENTS[name].baseUrl,
  appPath: '/parabank',
  // Getters: a password is only read when a test needs it, so `--list` works without one.
  get username() { return required('PARABANK_USERNAME'); },
  get password() { return required('PARABANK_PASSWORD'); },
  get registerUsername() { return process.env.PARABANK_REGISTER_USERNAME ?? 'john123'; },
  get registerPassword() { return required('PARABANK_REGISTER_PASSWORD'); },
};
