# Prompts

Reusable prompts for writing tests in this framework with an AI assistant (Claude Code, Copilot Chat, …).
Copy a prompt, fill in the `<placeholders>`, and paste it into the assistant from the project root.

| File | Use it to |
|---|---|
| [parabank-ui-test-prompts.md](parabank-ui-test-prompts.md) | Add a ParaBank page object + UI tests (e.g. Bill Pay, Open New Account) |
| [automation-exercise-api-test-prompts.md](automation-exercise-api-test-prompts.md) | Add an Automation Exercise endpoint: service, schema, positive / negative / edge tests |
| [data-driven-test-prompts.md](data-driven-test-prompts.md) | Turn a scenario into data-driven tests from JSON, CSV or Excel |
| [utilities-prompts.md](utilities-prompts.md) | Add helpers, data generators, readers or reporters to `utils/` |
| [review-and-fix-prompts.md](review-and-fix-prompts.md) | Review a spec, fix a flaky or failing test |

**Not the same as `.claude/prompts/`**: those drive the Playwright planner / generator / healer agents
(`npm run agents:init`). The prompts here are for you to copy into any assistant.

## Rules every prompt repeats (so the assistant follows the framework)

- Import `test` / `expect` from `fixtures/baseTest` (UI) or `fixtures/apiTest` (API), never from `@playwright/test`.
- Locators live in page objects under `pages/` (extend `BasePage`); specs never contain selectors.
- No credentials in code or data files: use `ENV` from `config/env.ts`, or `{{PARABANK_USERNAME}}` placeholders in data.
- ParaBank is a shared public demo: generate unique values (`utils/date.ts`, `utils/random.ts`) so a test finds its own data.
- API responses are validated with zod schemas via `expectSchema`; every endpoint gets positive, negative and edge tests.
- Run `npx tsc --noEmit -p .` and the new tests before calling the work done.
