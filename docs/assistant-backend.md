# OMM command assistant backend

The assistant is a constrained command selector, not a general chatbot. The
browser sends `{ locale, question, turnCount }`. The server narrows the
question to at most five entries derived from the existing command docs. A
Workers AI model may return only one candidate `commandId` or `clarify`.
Options, examples, risk labels, links, and shell text always come from the
static OMM command catalog.

## Runtime contract

- `question`: 1–480 Unicode code points.
- `turnCount`: integer 0–2 (three browser questions at most).
- Model output: at most 48 completion tokens, non-streaming, temperature 0, five-second
  application timeout, no retry.
- Response: `{ kind, source, reason, commandId, candidateIds }`. It never
  includes the question, a model explanation, HTML, Markdown, a URL, a flag,
  or a generated command.
- Secret-like text and all submitted URLs are rejected before inference.
- `429`, capacity, timeout, model, binding, database, and invalid-JSON failures
  fall back to ordinary static command search without a retry.

`wrangler.jsonc` contains only the Workers AI binding:

```json
"ai": { "binding": "AI" }
```

The route reads the binding through OpenNext's `getCloudflareContext()` and
calls `env.AI.run()`. No browser-visible API key exists.

## Model choice

The default is `@cf/meta/llama-3.3-70b-instruct-fp8-fast`. Cloudflare lists it
explicitly as a JSON Mode model, and a live preview-binding check on 2026-08-26
returned a valid allowlisted command selection in 14 completion tokens. Its
higher unit cost is bounded by the 48-token output limit and the app-level
200-request daily cap.

`WORKERS_AI_MODEL` may select only:

- `@cf/meta/llama-3.3-70b-instruct-fp8-fast` (default; live contract verified)
- `@cf/meta/llama-3.1-8b-instruct-fast` (lower-cost JSON Mode alternative;
  Korean quality not verified)

GLM 4.7 Flash was not retained in the configuration allowlist: live bounded
checks at 48 and 128 completion tokens used the entire budget for reasoning
and returned no content. Cloudflare also says JSON Schema compliance is not
guaranteed for any model. The route therefore independently parses the result,
rejects extra fields, and checks the ID against both the static command
allowlist and the per-request candidates.

## Required atomic budget binding

AI inference stays disabled unless all three are available:

1. the `AI` binding;
2. a dedicated D1 database bound as `ASSISTANT_DB`, initialized with
   `migrations/0001_assistant_limits.sql`;
3. an `ASSISTANT_HASH_SALT` secret of at least 16 characters.

The D1 conditional `INSERT ... ON CONFLICT ... WHERE used < limit RETURNING`
is one atomic SQL statement. It enforces ten calls per salted client hash per
10-minute UTC bucket and 200 model attempts per UTC day. Preview and production
use separate client scopes, so QA cannot consume a production visitor's limit. Missing bindings or
schema errors fail closed. Do not substitute an isolate-local `Map` or a KV
read/modify/write counter and call it global; neither provides this atomic
account-wide contract.

This application counter does not query the Cloudflare account's neuron usage.
Other Workers AI applications on the same account can consume the shared free
allocation first, and a Workers Paid account can bill overage. The 200-attempt
cap limits this application's traffic; it is not a billing guarantee or
production-readiness evidence. Account budgets and monitoring require a
separate, explicitly approved Cloudflare configuration step.

The short cache stores only a salted question hash, `commandId`/`clarify`, and
expiry. It never stores the prompt, question, IP address, model free text, URL,
or a command string. The route does not log request or model content.

The production configuration binds `ASSISTANT_DB` to the dedicated
`omm-assistant-limits` database in the `omm.run` Cloudflare account. The
database was created and migration 0001 was applied on 2026-08-26. The
`ASSISTANT_HASH_SALT` value is stored only as a Worker secret and is not in the
repository.

## Current Cloudflare policy evidence (checked 2026-08-26)

- [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/):
  10,000 free Neurons per account per day, reset at 00:00 UTC; Workers Paid is
  billed above the allocation.
- [Workers AI limits](https://developers.cloudflare.com/workers-ai/platform/limits/):
  local Wrangler inference also consumes platform limits and models may have
  additional limits.
- [Workers AI errors](https://developers.cloudflare.com/workers-ai/platform/errors/):
  daily allocation is error 3036/HTTP 429, out of capacity is 3040/429,
  timeout is 3007/408, and an unknown model is 5007/400.
- [Workers AI bindings](https://developers.cloudflare.com/workers-ai/configuration/bindings/):
  Wrangler `ai.binding = "AI"` exposes `env.AI.run(model, input)`.
- [JSON Mode](https://developers.cloudflare.com/workers-ai/features/json-mode/):
  `response_format.type = "json_schema"`, no streaming, schema adherence is
  not guaranteed, and applications must handle failure. It includes both
  allowlisted Llama models.
- [Workers AI data usage](https://developers.cloudflare.com/workers-ai/platform/data-usage/):
  Cloudflare does not use Customer Content to train models or improve services
  without explicit consent; content can be stored when the application
  deliberately combines Workers AI with a storage service.
- [OpenNext adapter](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/):
  route handlers remain supported for existing OpenNext applications.
