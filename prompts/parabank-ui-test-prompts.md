# ParaBank UI test prompts

## 1. New page + tests for a module

```text
Add UI tests for the ParaBank "<module, e.g. Bill Pay>" page (https://parabank.parasoft.com/parabank/<page>.htm).

1. Open the page in the browser (logged in) and list every field, button, link and message.
2. Create pages/<Name>Page.ts extending BasePage:
   - readonly Locator per element, preferring getByRole / getByLabel, then stable ids
   - one method per business action (e.g. payBill(details)), wrapped in test.step
   - no assertions inside the page object
3. Register it as a fixture in fixtures/baseTest.ts (type + one line).
4. Create tests/ui/<module>/<module>.spec.ts:
   - test.use({ storageState: AUTH_FILE }) and the loggedIn fixture
   - open the page via the accountServicesMenu component
   - cases: page shows all elements · happy path with confirmation · required-field errors ·
     invalid input (amounts, account numbers) · the result appears where the user would check it
   - unique amounts (uniqueAmount()) so the test finds its own data on the shared site
   - tag tests that change data with { tag: '@modifies-data' }
5. Expected texts go in test-data/<module>Data.json, not in the spec.
6. Run: npx tsc --noEmit -p .  and  npx playwright test tests/ui/<module> --project=chromium
```

## 2. Extend an existing page

```text
In pages/<Name>Page.ts add support for "<new behaviour>". Add the locators and a business
method, then add tests to tests/ui/<module>/<module>.spec.ts covering the success case and
the validation messages. Keep the existing tests passing.
```

## 3. Explain a page object (learning)

```text
Explain pages/<Name>Page.ts line by line: what each locator targets, why that locator strategy,
what each method does, and how a spec uses it through the fixture in fixtures/baseTest.ts.
```
