import { isLocale } from "../../../i18n/config";
import { MODEL_WIKI_REVIEWED_AT, MODEL_WIKI_VERSION, WIKI_MODELS, localizeModel } from "../../../lib/models/catalog";
import { filterModels } from "../../../lib/models/search";
import { isModelTask } from "../../../lib/models/types";

/** Public read-only knowledge. No inference, credentials, storage or remote fetch. */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const locale = params.get("locale") ?? "en";
  const task = params.get("task");
  const query = params.get("q") ?? "";
  const id = params.get("id");
  if (!isLocale(locale) || (task !== null && !isModelTask(task)) || query.length > 160) {
    return Response.json({ error: "Invalid locale, task or query (maximum 160 characters)." }, { status: 400 });
  }
  const candidates = id === null ? WIKI_MODELS : WIKI_MODELS.filter((model) => model.id === id);
  if (id !== null && candidates.length === 0) return Response.json({ error: "Unknown checkpoint." }, { status: 404 });
  const models = filterModels(candidates, { query, task: task === null ? undefined : task });
  return Response.json({
    schemaVersion: 1, contentVersion: MODEL_WIKI_VERSION, reviewedAt: MODEL_WIKI_REVIEWED_AT, locale,
    selectionPolicy: "Editorial use-case filtering, not a performance ranking or hardware-fit recommendation.",
    evidencePolicy: "Publisher reports and editorial notes are labeled. null ommEvaluation means unmeasured; do not infer performance or runner compatibility.",
    total: models.length, models: models.map((model) => localizeModel(model, locale)),
  }, { headers: { "Cache-Control": "public, max-age=600", "Access-Control-Allow-Origin": "*", "X-Content-Type-Options": "nosniff" } });
}
