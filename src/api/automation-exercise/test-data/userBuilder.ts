/**
 * Builds unique test users for the account APIs (API 11-14).
 *
 * Every call returns a NEW email, so tests never collide on the shared public server,
 * even when they run in parallel. Override any field for a specific case:
 *   buildUser({ city: 'Hyderabad' })
 */
export const TITLES = ['Mr', 'Mrs', 'Miss'] as const;
export type Title = (typeof TITLES)[number];

/** Field names exactly as the createAccount / updateAccount APIs expect them. */
export interface NewUser {
  name: string;
  email: string;
  password: string;
  title: Title;
  birth_date: string;
  birth_month: string;
  birth_year: string;
  firstname: string;
  lastname: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  zipcode: string;
  state: string;
  city: string;
  mobile_number: string;
}

/** e.g. "mhq8x2k9a7": base-36 time + random, unique per call. */
export const uniqueId = (): string =>
  `${Date.now().toString(36)}${Math.floor(Math.random() * 1_679_616).toString(36)}`;

export function buildUser(overrides: Partial<NewUser> = {}): NewUser {
  const id = uniqueId();
  return {
    name: `QA User ${id}`,
    email: `qa.api.${id}@example.com`,
    password: `Pw_${id}!`,
    title: 'Mr',
    birth_date: '15',
    birth_month: '6',
    birth_year: '1990',
    firstname: 'QA',
    lastname: `User${id}`,
    company: 'Test Co',
    address1: '1 Test Street',
    address2: 'Suite 2',
    country: 'India',
    zipcode: '500001',
    state: 'Telangana',
    city: 'Hyderabad',
    mobile_number: '9999999999',
    ...overrides,
  };
}
