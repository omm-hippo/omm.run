# OMM AI assistant backend

The assistant is a constrained command selector, not a general chatbot. The
browser sends `{ locale, question, turnCount }`. A token-overlap ranker
orders the commands; a question that overlaps none of them gets no model call.
Otherwise Workers AI sees every command — the ranker's top four with
symptom/example context, the rest with their one-line summary — and may return
only one of those `commandId`s or `clarify`.
Options, examples, risk labels, links, and shell text always come from the
static OMM command catalog.

## Command catalog

The selectable commands are every hand-written command doc
(`COMMAND_ORDER`) plus every top-level command in the CLI reference
(`src/data/commands.json`) that has no hand-written page yet
(`src/lib/assistant/catalog.ts`). A reference-only command is described with
the CLI's own English `--help` summary and usage line, links to its generated
`/commands/<name>` page, and its card says its change impact is not yet
classified instead of guessing a risk level. A command therefore becomes
selectable the day the reference is synced, not the day its page is written.

## Evaluation

`tests/fixtures/assistant-eval.json` holds 51 held-out questions (English
and Korean, written as a user would ask) with the commands that answer each.
`tests/assistant-eval.test.ts` checks the deterministic ranker's recall
against a floor without calling a model. `scripts/assistant-eval.ts` measures
live accuracy against Workers AI and **bills the account** — one call per
question:

```sh
npx tsx scripts/assistant-eval.ts --mode narrowed   # ranker top 8 only
npx tsx scripts/assistant-eval.ts --mode hybrid     # every command, context on top 4
```

Measured 2026-10-17 with `@cf/meta/llama-3.3-70b-instruct-fp8-fast`:

| mode | catalog | prompt | correct | clarify | prompt tokens (51 calls) |
|---|---|---|---|---|---|
| narrowed (previous production) | 29 docs + reference | old | 35/51 | 11 | 41,356 |
| hybrid | 29 docs + reference | old | 40/51 | 9 | 79,243 |
| hybrid (production) | 34 docs | current | 46/51 | 1 | 87,888 |

The ranker alone reaches the right command for 38/51 questions; hybrid
removes that ceiling. The old prompt let the model `clarify` whenever wording
did not match a summary; the current one asks it to match intent and to
clarify only for off-topic or genuinely two-way questions. That prompt was
revised after reading the second row's misses on this same set, so the last
row is optimistic: add fresh questions before trusting a further gain.

Prompts are about 1,700 tokens instead of 800, so the 200-call daily cap now
bounds this application near 350,000 input tokens a day.

## Runtime contract

- `question`: 1–480 Unicode code points.
- Request bodies are bounded while streaming, including uploads without a
  `Content-Length` header. Invalid or interrupted uploads receive HTTP 400.
- `turnCount`: integer 0–2 (three browser questions at most).
- Model output: at most 48 completion tokens, non-streaming, temperature 0, five-second
  application timeout, no retry.
- Response: `{ kind, source, reason, commandId, candidateIds }`. It never
  includes the question, a model explanation, HTML, Markdown, a URL, a flag,
  or a generated command.
- Secret-like text and all submitted URLs are rejected before inference.
- `429`, capacity, timeout, model, binding, database, and invalid-JSON failures
  fall back to ordinary static command search without a retry.

`wrangler.jsonc` declares the Workers AI binding alongside the D1 and OpenNext
bindings:

```json
"ai": { "binding": "AI" }
```

The route reads the binding through OpenNext's `getCloudflareContext()` and
calls `env.AI.run()`. No browser-visible API key exists.
`next dev` does not initialize Cloudflare bindings, so it neither starts a remote preview
session nor invokes paid inference during ordinary local development.

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

The short cache stores only a versioned salted question hash,
`commandId`/`clarify`, and expiry. Incrementing the namespace invalidates old
selections after classifier or policy changes. It never stores the prompt,
question, IP address, model free text, URL, or a command string. The route does
not log request or model content.

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
