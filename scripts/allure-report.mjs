// Generates the Allure report from allure-results while keeping trend history.
// Allure only shows trends if the previous report's history/ folder is copied into the
// new results before generating, so: copy allure-report/history -> allure-results/history,
// then run `allure generate`.
import { cpSync, existsSync } from 'fs';
import { spawnSync } from 'child_process';

const RESULTS = 'allure-results';
const REPORT = 'allure-report';

if (!existsSync(RESULTS)) {
  console.error(`No ${RESULTS}/ folder - run the tests first (npm test).`);
  process.exit(1);
}

if (existsSync(`${REPORT}/history`)) {
  cpSync(`${REPORT}/history`, `${RESULTS}/history`, { recursive: true });
  console.log('Copied previous history into results (trend charts will include past runs).');
}

const result = spawnSync('npx', ['allure', 'generate', RESULTS, '--clean', '-o', REPORT], {
  stdio: 'inherit',
  shell: true,
});
process.exit(result.status ?? 1);
