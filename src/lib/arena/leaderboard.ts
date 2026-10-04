/** The same signed artifact contract as OMM's arena_leaderboard.py. */
export const PUBLIC_KEY = "p8uo6GFXDcg8Rp7/t8GGl5hwPsXhObY5vI1sll5KpaI=";
export const SOURCE = "https://raw.githubusercontent.com/omm-hippo/omm/main/published/";
export const MAX_BYTES = 4 * 1024 * 1024;

export type ArenaModel = {
  key: string; display_filename: string | null; repo_id: string | null;
  provider: string | null; quant_bits: number | null; battles: number;
  effective_battles: number; provisional: boolean; quality_warning: boolean;
  both_bad_rate: number;
  quality: { tier: number | null; strength: number; ci_low: number; ci_high: number };
  efficiency: { component: number; rating: number; raw_median_tok_s_per_gb: number } | null;
};
export type Leaderboard = {
  schema_version: 1; generated_at: string;
  corpus: { rows_used: number; effective_votes: number; client_count: number; largest_client_share: number };
  models: ArenaModel[];
};
export type ArenaState =
  | { status: "available"; data: Leaderboard; verified: true; testData: boolean }
  | { status: "unavailable" | "invalid" | "error" };

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected object");
  return value as Record<string, unknown>;
}
function number(value: unknown, minimum = 0): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < minimum) throw new Error("Invalid number");
  return value;
}
function text(value: unknown, optional = false): string | null {
  if (optional && value == null) return null;
  if (typeof value !== "string" || !value || value.length > 400 || /[\u0000-\u001f]/u.test(value)) throw new Error("Invalid text");
  return value;
}

export function parseLeaderboard(value: unknown): Leaderboard {
  const document = object(value);
  if (document.schema_version !== 1) throw new Error("Unsupported schema");
  const generated = text(document.generated_at)!;
  if (!Number.isFinite(Date.parse(generated)) || !/(?:Z|[+-]\d{2}:\d{2})$/u.test(generated)) throw new Error("Invalid date");
  const corpus = object(document.corpus);
  const share = number(corpus.largest_client_share);
  if (share > 1) throw new Error("Invalid client share");
  if (!Array.isArray(document.models) || document.models.length > 4096) throw new Error("Invalid models");
  const keys = new Set<string>();
  const models = document.models.map((value): ArenaModel => {
    const model = object(value), quality = object(model.quality);
    const key = text(model.key)!;
    if ((!/^sha256:[a-f0-9]{64}$/u.test(key) && !key.startsWith("filename:")) || keys.has(key)) throw new Error("Invalid model identity");
    keys.add(key);
    if (typeof model.provisional !== "boolean" || typeof model.quality_warning !== "boolean") throw new Error("Invalid status");
    const tier = quality.tier === null ? null : number(quality.tier, 1);
    if (tier !== null && !Number.isInteger(tier)) throw new Error("Invalid tier");
    if (model.provisional !== (tier === null)) throw new Error("Provisional tier mismatch");
    const low = number(quality.ci_low, -Infinity), high = number(quality.ci_high, -Infinity);
    if (low > high) throw new Error("Inverted interval");
    const rate = number(model.both_bad_rate);
    if (rate > 1) throw new Error("Invalid both-bad rate");
    let efficiency: ArenaModel["efficiency"] = null;
    if (model.efficiency !== null) {
      const measured = object(model.efficiency);
      const component = number(measured.component);
      if (!Number.isInteger(component)) throw new Error("Invalid comparison group");
      efficiency = { component, rating: number(measured.rating, -1e6), raw_median_tok_s_per_gb: number(measured.raw_median_tok_s_per_gb) };
    }
    return {
      key, display_filename: text(model.display_filename, true), repo_id: text(model.repo_id, true),
      provider: text(model.provider, true), quant_bits: model.quant_bits == null ? null : number(model.quant_bits),
      battles: number(model.battles), effective_battles: number(model.effective_battles),
      provisional: model.provisional, quality_warning: model.quality_warning, both_bad_rate: rate,
      quality: { tier, strength: number(quality.strength, -Infinity), ci_low: low, ci_high: high }, efficiency,
    };
  });
  return { schema_version: 1, generated_at: generated,
    corpus: { rows_used: number(corpus.rows_used), effective_votes: number(corpus.effective_votes),
      client_count: number(corpus.client_count), largest_client_share: share }, models };
}

export function orderedModels(models: readonly ArenaModel[]): ArenaModel[] {
  return [...models].sort((a, b) => {
    const tierA = a.quality.tier ?? Infinity, tierB = b.quality.tier ?? Infinity;
    if (tierA !== tierB) return tierA < tierB ? -1 : 1;
    const groupA = a.efficiency?.component ?? Infinity, groupB = b.efficiency?.component ?? Infinity;
    if (groupA !== groupB) return groupA < groupB ? -1 : 1;
    const rating = (b.efficiency?.rating ?? 0) - (a.efficiency?.rating ?? 0);
    return rating || (a.key < b.key ? -1 : a.key === b.key ? 0 : 1);
  });
}

function base64(value: unknown): Uint8Array<ArrayBuffer> {
  if (typeof value !== "string" || !/^[A-Za-z0-9+/]+={0,2}$/u.test(value)) throw new Error("Invalid base64");
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}
export async function verifyLeaderboard(content: Uint8Array<ArrayBuffer>, value: unknown, publicKey = PUBLIC_KEY): Promise<Leaderboard> {
  if (content.byteLength > MAX_BYTES) throw new Error("Artifact too large");
  const manifest = object(value);
  if (manifest.schema_version !== 1) throw new Error("Unsupported manifest");
  const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", content))].map((x) => x.toString(16).padStart(2, "0")).join("");
  if (manifest.artifact_sha256 !== hash) throw new Error("Hash mismatch");
  const keyBytes = base64(publicKey), signature = base64(manifest.signature);
  if (keyBytes.byteLength !== 32 || signature.byteLength !== 64) throw new Error("Invalid key or signature length");
  const key = await crypto.subtle.importKey("raw", keyBytes, "Ed25519", false, ["verify"]);
  if (!await crypto.subtle.verify("Ed25519", key, signature, content)) throw new Error("Signature mismatch");
  return parseLeaderboard(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(content)));
}

async function boundedBytes(response: Response, limit: number): Promise<Uint8Array<ArrayBuffer>> {
  if (!response.ok || !response.body) throw new Error("Artifact request failed");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) throw new Error("Artifact too large");
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

export async function loadLeaderboard(fetcher: typeof fetch = fetch, source = SOURCE, publicKey = PUBLIC_KEY, testData = false): Promise<ArenaState> {
  try {
    const response = await fetcher(`${source}arena-leaderboard.json`, { signal: AbortSignal.timeout(10_000), redirect: "error" });
    if (response.status === 404) return { status: "unavailable" };
    const bytes = await boundedBytes(response, MAX_BYTES);
    const manifestResponse = await fetcher(`${source}arena-leaderboard.manifest.json`, { signal: AbortSignal.timeout(10_000), redirect: "error" });
    const manifestBytes = await boundedBytes(manifestResponse, 16 * 1024);
    try {
      const data = await verifyLeaderboard(bytes, JSON.parse(new TextDecoder().decode(manifestBytes)), publicKey);
      return { status: "available", data, verified: true, testData };
    } catch { return { status: "invalid" }; }
  } catch { return { status: "error" }; }
}
