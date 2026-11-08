import fs from 'fs';
import os from 'os';
import { defineConfig, devices, ReporterDescription } from '@playwright/test';
// Importing ENV loads .env / .env.<TEST_ENV> into process.env before anything below reads it.
import { ENV } from './src/config/env';

/**
 * Environment: TEST_ENV=qa|staging|prod (default qa) - see src/config/environments.ts.
 *
 * ParaBank is a shared public demo behind Cloudflare, which rate-limits (Error 1015 / HTTP 429)
 * bursts of requests from one IP. These defaults keep the load low:
 *  - Chromium only by default; set ALL_BROWSERS=1 to add Firefox and WebKit.
 *  - At most 2 workers locally (WORKERS=n to override), 1 on CI.
 *  - Login happens once in the `setup` project; Account Services tests reuse the saved session.
 *  - Agent seed files are skipped in normal runs; the Playwright agents' MCP server sets PW_AGENTS=1.
 */
const allBrowsers = !!process.env.ALL_BROWSERS;
const forAgents = !!process.env.PW_AGENTS;
const isCI = !!process.env.CI;

const ALLURE_RESULTS = 'allure-results';

// Start each run with empty Allure results (main process only - workers also load this file).
// History is kept separately in allure-report/history by `npm run allure:generate`.
if (!process.env.TEST_WORKER_INDEX) {
  fs.rmSync(ALLURE_RESULTS, { recursive: true, force: true });
}

const reporters: ReporterDescription[] = [
  [isCI ? 'github' : 'list'],
  ['html', { outputFolder: 'playwright-report', open: 'never' }],
  [
    'allure-playwright',
    {
      resultsDir: ALLURE_RESULTS,
      detail: true,
      suiteTitle: true,
      environmentInfo: {
        Environment: ENV.name,
        'Base URL': ENV.baseUrl,
        'Data changes allowed': String(ENV.allowDataChanges),
        Browsers: allBrowsers ? 'chromium, firefox, webkit' : 'chromium',
        'Node.js': process.version,
        OS: `${os.platform()} ${os.release()}`,
      },
      categories: [
        {
          name: 'Rate limited by ParaBank (Cloudflare 1015 / HTTP 429)',
          messageRegex: '.*(429|rate limit|Error 1015).*',
          matchedStatuses: ['failed', 'broken'],
        },
        {
          name: 'Login / credentials problem',
          messageRegex: '.*(Login failed|Missing PARABANK_).*',
          matchedStatuses: ['failed', 'broken'],
        },
        { name: 'Timeouts', messageRegex: '.*(Timeout|timeout).*exceeded.*', matchedStatuses: ['failed', 'broken'] },
        { name: 'Assertion failures', messageRegex: '.*expect\\(.*', matchedStatuses: ['failed'] },
        { name: 'Test code errors', matchedStatuses: ['broken'] },
      ],
    },
  ],
];

export default defineConfig({
  testDir: './tests',
  testIgnore: forAgents ? [] : ['**/seed*.spec.ts'],
  /* Environments that must not be modified (prod) skip tests that create or change data. */
  grepInvert: ENV.allowDataChanges ? undefined : /@creates-account|@modifies-data/,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Keep concurrent sessions low to avoid ParaBank's rate limit. */
  workers: process.env.WORKERS ? Number(process.env.WORKERS) : isCI ? 1 : 2,
  reporter: reporters,
  use: {
    baseURL: ENV.baseUrl,
    /* Failure evidence - attached to both the HTML and the Allure report. */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  projects: [
    /* Logs in once and saves the session to playwright/.auth/user.json (see tests/auth.setup.ts).
       Session cookies work in every browser, so one login serves all browser projects. */
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    ...(allBrowsers
      ? [
          { name: 'firefox', use: { ...devices['Desktop Firefox'] }, dependencies: ['setup'] },
          { name: 'webkit', use: { ...devices['Desktop Safari'] }, dependencies: ['setup'] },
        ]
      : []),
  ],
});
