# Utility prompts

## 1. New helper

```text
Add a helper to utils/<file>.ts that <what it does>. Requirements:
- a pure, typed function (no Playwright imports unless it needs a Page)
- a JSDoc comment with one usage example
- reuse existing helpers in utils/ instead of duplicating them
Then use it in <spec or page> and run npx tsc --noEmit -p .
```

## 2. New test data generator

```text
Add a factory in utils/ (or api/automation-exercise/test-data/) that builds a valid
<entity> with unique values: build<Entity>(overrides: Partial<Entity> = {}): Entity.
Defaults must be valid, values unique per call (time + random), overrides spread LAST.
Show two usages: default and one override.
```

## 3. New data source for DataReader

```text
Extend utils/DataReader.ts to read <format, e.g. YAML>. Keep readTestData(file, schema)
as the single entry point (dispatch by extension), keep reading synchronous (Playwright needs
rows at collection time), and validate every row with the schema.
```
