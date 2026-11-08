// Builds two Allure reports from allure-results:
//
//  1. allure-report/              Full report with trend history. Needs a web server to view
//                                 (`npm run allure:open`) - opening its index.html directly
//                                 shows "500 Failed to fetch", because browsers block file:// reads.
//  2. allure-report-single/index.html
//                                 Everything embedded in ONE file, so it opens with a plain
//                                 double-click. This is the one CI uploads as an artifact.
//
// History: Allure only shows trends if the previous report's history/ folder is copied into
// the new results before generating.
import { cpSync, existsSync } from 'fs';
import { spawnSync } from 'child_process';

const RESULTS = 'allure-results';
const REPORT = 'allure-report';
const SINGLE_FILE_REPORT = 'allure-report-single';

if (!existsSync(RESULTS)) {
  console.error(`No ${RESULTS}/ folder - run the tests first (npm test).`);
  process.exit(1);
}

if (existsSync(`${REPORT}/history`)) {
  cpSync(`${REPORT}/history`, `${RESULTS}/history`, { recursive: true });
  console.log('Copied previous history into results (trend charts will include past runs).');
}

const allure = (...args) =>
  spawnSync('npx', ['allure', 'generate', RESULTS, '--clean', ...args], { stdio: 'inherit', shell: true }).status ?? 1;

const status = allure('-o', REPORT) || allure('--single-file', '-o', SINGLE_FILE_REPORT);
if (status === 0) {
  console.log(`Double-click to view: ${SINGLE_FILE_REPORT}/index.html`);
}
process.exit(status);
