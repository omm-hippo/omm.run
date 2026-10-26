# Model wiki

`/models` (Korean) and `/en/models` start with PC specifications and a use case.
The form screens the current 23 checkpoint records, shows up to three candidates
with reasons and memory allowances, and links to the existing source-backed
entries. The full catalog, search, filters and three-model comparison remain in
an expandable section. Legacy `/ko/models` redirects to `/models`.

The records describe exact checkpoints, rather than applying a family's claims
to every size, quantization or distill. The source review date remains
2026-10-25; this feature does not claim a fresh review of the model facts.
This is a curated snapshot, not an automatically updated catalog.

## PC-based shortlist

`src/lib/models/recommend.ts` is a deterministic, browser-side screening rule.
Input: OS, CPU/shared graphics or GPU vendor, RAM, dedicated VRAM when relevant,
use case, 4/8-bit weights, starting context, and optional free disk space.
Inputs start blank; example buttons fill explicitly labelled example specs and
require submission. Editing or clearing any field removes the old results.
Hardware inputs are neither sent to a service nor persisted.

All quantities below are decimal GB and editorial planning allowances:

- Weights: **total** parameters in billions × bits / 8 × 1.2. Inactive MoE
  experts still count. The 20% margin is an assumption, not actual file metadata.
- Memory: weight allowance + 2 GB runtime + 1 GB per 4,096 context tokens + 2 GB
  for checkpoints with non-text inputs. Fixed allowances are not a model-specific
  KV-cache estimate and can understate real use.
- RAM reserve: max(4 GB, 25%); dedicated VRAM reserve: max(1 GB, 10%). These
  pools are never added together. Apple unified memory is counted once.
- Dedicated GPU candidates need at least 8 GB system RAM. If the full allowance
  exceeds VRAM, a candidate may use the separately checked RAM/CPU path; partial
  GPU offload is not estimated. Integrated graphics use that same RAM/CPU path.
- Optional free disk space must cover at least 110% of the weight allowance.
- Use-case and documented base-context filters intersect with memory and disk.
- Sort by GPU/unified path, comfortable headroom (allowance ≤80% of budget),
  then total parameter size. This is not a quality or speed benchmark.

The UI describes candidates to investigate, not verified runnable downloads.
OS limits Apple Silicon selection to macOS; it does not establish GPU-driver,
runner, format or checkpoint support. Follow the exact checkpoint's details and
check an actual compatible file with `omm fit` before installing. Actual speed,
quality, fit and availability of a quantization remain unverified here.

The memory/cache and backend explanations link to primary references:
[Transformers KV cache](https://huggingface.co/docs/transformers/main/en/kv_cache)
and [llama.cpp backends](https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md).
Neither source validates the numeric allowances above.

## Read-only knowledge API

`GET /api/models` returns JSON without an inference call, credentials, database,
or outbound fetch. Optional parameters:

| Parameter | Accepted value |
| --- | --- |
| `locale` | `en` (default), `ko` |
| `q` | Literal name/publisher/task search, up to 160 characters |
| `task` | `agents`, `coding`, `reasoning`, `vision`, `multilingual`, `compact` |
| `id` | Exact stable checkpoint id |

For example: `/api/models?locale=ko&task=agents` and
`/api/models?id=qwen3-8-27b`. Parameters intersect. An empty search result is 200;
an unknown id is 404; an invalid parameter is 400. CORS allows public reads.

Consumers should retain `schemaVersion`, `contentVersion`, checkpoint identity,
source URLs, review dates and claim `basis`. `publisher` means a developer report;
`editorial` means an OMM selection note. Categories are discovery aids, **not a
performance ranking**. `ommEvaluation: null` means there is no OMM measurement.
`toolCalling: null` means unconfirmed, not unsupported. Context `basis: config`
describes the checkpoint's configuration, not demonstrated usable context.
MoE active parameters do not describe the full memory footprint.

The API makes the data available for a recommendation system. It does **not**
change the CLI's learned recommendation model or the website's command assistant;
neither automatically consumes it in this change.

## Maintaining the entries

Edit `src/data/model-wiki.json`; the catalog projection and version live in
`src/lib/models/catalog.ts`, with types in `types.ts`. Add a stable,
hyphenated id (no dots; the locale middleware excludes file-like URLs), exact
upstream repository, bilingual summary and notes, primary sources, and the date
on which those sources were actually reviewed. Link each publisher claim to a
source id. Keep native context separate from configured extensions, open weights
separate from licensing, and original weights separate from runner compatibility.

The search function is shared between the client and API. New entries appear in
both languages and generate static detail routes on the next build. Bump
`MODEL_WIKI_VERSION` whenever facts or entries change. Do not bump source review
dates without reviewing those sources. A real OMM evaluation needs a future
schema extension with checkpoint, quantization, runner, hardware and linked
reproducible evidence; do not replace `null` with estimated scores.

Run `npm test`, `npm run lint`, and `npm run build`. Exercise navigation, filters,
comparison, language switching and API responses in a local browser. Deployment
and live verification require their own approval and traffic budget.
