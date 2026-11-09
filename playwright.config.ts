import fs from 'fs';
import os from 'os';
import { defineConfig, devices, ReporterDescription } from '@playwright/test';
// Importing ENV loads .env into process.env before anything below reads it.
import { ENV } from './config/env';

/**
 * Environment: TEST_ENV=qa|staging|prod (default qa) - see config/environments.ts.
 *
 * ParaBank is a shared public demo behind Cloudflare, which rate-limits (Error 1015 / HTTP 429)
 * bursts of requests from one IP. These defaults keep the load low:
 *  - Chromium only by default; set ALL_BROWSERS=1 to add Firefox and WebKit.
 *  - 2 workers on the public site, 4 on local Docker (WORKERS=n to override).
 *  - Login happens once in the `setup` project; Account Services tests reuse the saved session.
 *  - Agent seed files are skipped in normal runs; the Playwright agents' MCP server sets PW_AGENTS=1.
 */
const allBrowsers = !!process.env.ALL_BROWSERS;
const forAgents = !!process.env.PW_AGENTS;
const isCI = !!process.env.CI;

const ALLURE_RESULTS = 'allure-results';

/* Agent seed files only run for the Playwright agents. */
const seedIgnore = forAgents ? [] : ['**/seed*.spec.ts'];
/* Automation Exercise API tests live in their own `api` project (see projects below). */
const AE_API_TESTS = /automation-exercise[\\/].*\.spec\.ts$/;
const browserTestIgnore = [...seedIgnore, AE_API_TESTS];

// Start each run with empty Allure results (main process only - workers also load this file).
// History is kept separately in allure-report/history by `npm run allure:generate`.
// Only the contents are removed: in Docker the folder itself is a mounted volume.
if (!process.env.TEST_WORKER_INDEX && fs.existsSync(ALLURE_RESULTS)) {
  for (const entry of fs.readdirSync(ALLURE_RESULTS)) {
    fs.rmSync(`${ALLURE_RESULTS}/${entry}`, { recursive: true, force: true });
  }
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
  testIgnore: seedIgnore,
  /* Environments that must not be modified (prod) skip tests that create or change data. */
  grepInvert: ENV.allowDataChanges ? undefined : /@creates-account|@modifies-data/,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: isCI,
  /* Retry on CI only */
  retries: isCI ? 2 : 0,
  /* Per-environment default (low on the rate-limited public site, higher on local Docker). */
  workers: process.env.WORKERS ? Number(process.env.WORKERS) : ENV.workers,
  reporter: reporters,
  use: {
    baseURL: ENV.baseUrl,
    /* Failure evidence - attached to both the HTML and the Allure report.
       Trace is cheap and has a full timeline with screenshots, so it is kept for every failure.
       Video is expensive (it records every test, roughly +50% run time), so only on retries. */
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    /* Logs in once and saves the session to playwright/.auth/user.json (see tests/auth.setup.ts).
       Session cookies work in every browser, so one login serves all browser projects. */
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testIgnore: browserTestIgnore,
    },
    ...(allBrowsers
      ? [
          { name: 'firefox', use: { ...devices['Desktop Firefox'] }, dependencies: ['setup'], testIgnore: browserTestIgnore },
          { name: 'webkit', use: { ...devices['Desktop Safari'] }, dependencies: ['setup'], testIgnore: browserTestIgnore },
        ]
      : []),
    /* Automation Exercise REST API tests: no browser, no ParaBank login, so no `setup` dependency.
       Run them alone with:  npm run test:api:ae   (or  npx playwright test --project=api) */
    { name: 'api', testMatch: AE_API_TESTS },
  ],
});
