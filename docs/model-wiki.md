# Model wiki

`/models` and `/ko/models` provide task filters, literal search, publisher and
image-input filters, up to three-checkpoint comparison, and static entries at
`/models/<id>`. The global navigation includes **Model wiki / 모델 위키**.

The initial seven entries describe exact checkpoints, rather than applying a
family's claims to every size, quantization or distill. Source review date is
2026-10-01. This is a curated snapshot, not an automatically updated catalog.

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

Edit `src/lib/models/catalog.ts`, with types in `types.ts`. Add a stable,
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
