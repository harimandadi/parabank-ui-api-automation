# Automation Exercise API test prompts

API list: https://automationexercise.com/api_list

## 1. New endpoint

```text
Automate Automation Exercise API <number>: <METHOD> /<path> ("<description from the API list>").

1. Call it first (and with wrong methods / missing params) and note the real behaviour:
   HTTP status, responseCode in the body, exact messages, response shape.
   Remember: this API answers HTTP 200 and puts the real code in responseCode.
2. Service: add a method to the matching class in api/automation-exercise/services/
   (or a new <Name>Api.ts) that calls ApiClient.send(). No assertions in services.
3. Schema: add a zod schema + z.infer type in api/automation-exercise/schemas.ts.
4. Messages: exact texts and codes in api/automation-exercise/messages.ts.
5. Fixture: register a new service in fixtures/apiTest.ts if you created one.
6. Spec: tests/api/automation-exercise/<path>.api.spec.ts with describe blocks
   positive / negative / edge:
   - positive: expectApiCode(...) and expectSchema(Schema, result.body, 'Name')
   - negative: missing / wrong params, unsupported methods (expectMethodNotSupported)
   - edge: empty / special / very long values, idempotency, expectRespondsWithin
   - tag tests that create accounts with @auth @creates-account and use registeredUser
     (created before, ALWAYS deleted after)
7. Run: npx tsc --noEmit -p .  and  npx playwright test --project=api <path>
```

## 2. Contract check

```text
Compare the live response of <endpoint> with its zod schema in schemas.ts. List any field that is
missing, extra or a different type, then update the schema (and say whether it's an API defect).
```
