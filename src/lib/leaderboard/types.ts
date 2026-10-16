/** omm's arena leaderboard artifact, schema 2 (scripts/arena_score.py +
 *  scripts/arena_quality_gate.py:publish). Field names are omm's. */

export type Efficiency = {
  rating: number;
  component: number;
  raw_median_tok_s_per_gb: number;
  sample: number;
};

export type ArenaModel = {
  key: string;
  display_filename: string | null;
  repo_id: string | null;
  provider: string | null;
  quant_bits: number | null;
  battles: number;
  effective_battles: number;
  provisional: boolean;
  quality: { strength: number; ci_low: number; ci_high: number; tier: number | null };
  both_bad_rate: number;
  quality_warning: boolean;
  efficiency: Efficiency | null;
  efficiency_comparable: boolean;
};

export type Pair = {
  a: string;
  b: string;
  wins_a: number;
  wins_b: number;
  both_bad: number;
  battles: number;
};

export type Corpus = {
  rows_used: number;
  effective_votes: number;
  client_count: number;
  largest_client_share?: number;
};

export type Scope = {
  corpus: Corpus;
  models: ArenaModel[];
  tiers: { tier: number; model_keys: string[] }[];
  provisional_models: string[];
  pairs: Pair[];
  ranked: boolean;
  reasons: string[];
  updated_at: string | null;
};

export type Group = Scope & { key: string; memory_kind: string; memory_bucket: string };

export type ArenaArtifact = Scope & {
  schema_version: 2;
  generated_at: string;
  status: "ranked" | "collecting";
  groups: Group[];
};

export type BoardState =
  | { kind: "ranked" | "collecting"; artifact: ArenaArtifact; example?: boolean }
  | { kind: "unpublished" }
  | { kind: "error"; reason: "verification" | "unavailable" | "too_new" };
