# Review and fix prompts

## 1. Fix a failing test

```text
npx playwright test <spec> -g "<test name>" fails with: <paste the error>.
Open the trace / error-context, find the root cause, and say whether it's the app, the test
data, the environment (rate limit, shared data, slow network) or the test code.
Fix locators in pages/, not in the spec. Don't add fixed waits; use web-first assertions.
Re-run the test 3 times (--repeat-each=3) to show it's stable.
```

## 2. Flaky test

```text
<spec> passes locally but fails sometimes in CI. Check for: missing awaits, forEach with
async callbacks, shared data between parallel tests, non-unique test data, fixed sleeps,
and assertions that don't retry. Explain the cause and fix it.
```

## 3. Review a spec

```text
Review <spec> against the framework rules in prompts/README.md: imports, locators only in
pages/, no credentials, unique data, positive/negative/edge coverage, clear test names.
List problems by severity with the line, then fix them.
```
