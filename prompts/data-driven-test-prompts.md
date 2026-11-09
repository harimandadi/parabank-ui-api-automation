# Data-driven test prompts

Example in the framework: `tests/ui/login/login-data-driven.spec.ts` reads
`test-data/login/login-data.{json,csv,xlsx}` with `readTestData()` from `utils/DataReader.ts`.

## 1. Make a scenario data-driven

```text
Make "<scenario, e.g. Transfer Funds validation>" data-driven.

1. Pick the columns: testName, the inputs, and an "expected" column with a small set of
   outcomes (e.g. success | invalidAmount | required).
2. Create test-data/<module>/<module>-data.json (and .csv / .xlsx if asked; for Excel extend
   scripts/build-login-excel.cjs or edit the file in Excel, row 1 = column names).
3. In the spec, define a zod schema for one row (z.enum for "expected") and load rows with
   readTestData(file, Schema) - T is inferred, and bad rows fail with file + row + column.
4. One test per row: test(`${row.testName} → ${row.expected}`, ...). Branch on row.expected
   only for the final assertion; the steps stay the same for every row.
5. No secrets in data files: use {{PARABANK_USERNAME}} / {{PARABANK_PASSWORD}} and replace them
   from ENV inside the test (at run time, so `--list` works without credentials).
6. Run the spec and show one passing and one failing row (temporarily break a value) to prove
   the failure message names the row.
```

## 2. Add rows

```text
Add rows to test-data/<file> for: <cases>. Keep testName unique and expected one of the
schema's values. Do not change the spec.
```
