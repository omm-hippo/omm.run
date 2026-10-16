import type { Locale } from "@/i18n/config";

import { bucketSize, groupFamily, groupLabel, groupOrder, type GroupFamily } from "./groups";
import type { ArenaArtifact, ArenaModel, Scope } from "./types";

export type ScopeView = {
  /** The scope actually shown: the requested group if ranked, else overall. */
  key: string;
  /** What the URL asked for. */
  requested: string;
  scope: Scope;
  /** The request named a real group that is not ranked yet. */
  fellBack: boolean;
};

export function scopeOf(artifact: ArenaArtifact, requested = "overall"): ScopeView {
  const group = artifact.groups.find((entry) => entry.key === requested);
  if (group?.ranked) return { key: requested, requested, scope: group, fellBack: false };
  return { key: "overall", requested, scope: artifact, fellBack: group !== undefined };
}

export type NavItem = {
  key: string;
  family: GroupFamily | "overall";
  /** Bucket size alone ("16GB"), shown under its family heading. */
  label: string;
  /** Full label ("Mac · 통합 메모리 16GB"), for titles. */
  fullLabel: string;
  votes: number;
  ranked: boolean;
};

export function navItems(artifact: ArenaArtifact, locale: Locale): NavItem[] {
  const groups = [...artifact.groups].sort((a, b) => {
    const [fa, ba, ka] = groupOrder(a.key);
    const [fb, bb, kb] = groupOrder(b.key);
    return fa - fb || ba - bb || (ka < kb ? -1 : ka > kb ? 1 : 0);
  });
  return [
    {
      key: "overall",
      family: "overall",
      label: groupLabel("overall", locale),
      fullLabel: groupLabel("overall", locale),
      votes: artifact.corpus.rows_used,
      ranked: artifact.ranked,
    },
    ...groups.map((group) => {
      const family = groupFamily(group.key);
      return {
        key: group.key,
        family,
        label: family === "unknown" ? group.key : bucketSize(group.memory_bucket),
        fullLabel: groupLabel(group.key, locale),
        votes: group.corpus.rows_used,
        ranked: group.ranked,
      };
    }),
  ];
}

const QUANT_SUFFIX =
  /[-_.](IQ[1-4]_(?:XXS|XS|S|M|NL)|Q[2-8](?:_[01])?(?:_K(?:_[SML])?)?|BF16|FP16|FP32|F16|F32)$/iu;

export function modelName(model: Pick<ArenaModel, "display_filename" | "repo_id" | "key">): {
  name: string;
  org: string | null;
  quant: string | null;
} {
  const file = model.display_filename ?? model.key.replace(/^(filename|sha256):/u, "");
  const stem = file.replace(/\.gguf$/iu, "");
  const match = stem.match(QUANT_SUFFIX);
  const name = match ? stem.slice(0, match.index) : stem;
  const org = model.repo_id?.includes("/") ? model.repo_id.split("/")[0] : null;
  return { name: name || stem, org, quant: match ? match[1].toUpperCase() : null };
}

const PROVIDER_PREFIX: Record<string, string> = { modelscope: "ms" };

/** Same shape as omm's `search.exact_install_ref`; null without a repo. */
export function installRef(
  model: Pick<ArenaModel, "display_filename" | "repo_id" | "provider">,
): string | null {
  if (!model.repo_id || !model.display_filename) return null;
  const provider = model.provider ?? "huggingface";
  if (provider === "huggingface") return `${model.repo_id}:${model.display_filename}`;
  const prefix = PROVIDER_PREFIX[provider];
  return prefix ? `${prefix}:${model.repo_id}:${model.display_filename}` : null;
}

/** Minimum battles before a head-to-head percentage is worth quoting. */
export const MIN_PAIR_BATTLES = 5;

export function mostBeaten(
  scope: Scope,
  key: string,
): { key: string; rate: number; battles: number } | null {
  let best: { key: string; rate: number; battles: number } | null = null;
  for (const pair of scope.pairs) {
    if (pair.battles < MIN_PAIR_BATTLES) continue;
    let own: number;
    let other: number;
    let opponent: string;
    if (pair.a === key) [own, other, opponent] = [pair.wins_a, pair.wins_b, pair.b];
    else if (pair.b === key) [own, other, opponent] = [pair.wins_b, pair.wins_a, pair.a];
    else continue;
    if (own + other <= 0) continue;
    const rate = own / (own + other);
    if (
      !best ||
      rate > best.rate ||
      (rate === best.rate && (pair.battles > best.battles || (pair.battles === best.battles && opponent < best.key)))
    ) {
      best = { key: opponent, rate, battles: pair.battles };
    }
  }
  return best;
}

export function qualityText(model: ArenaModel): { score: string; half: string } {
  return {
    score: model.quality.strength.toFixed(2),
    half: ((model.quality.ci_high - model.quality.ci_low) / 2).toFixed(2),
  };
}

/** Relative efficiency (exp of the rating) - only for a comparable rating. */
export function efficiencyText(model: ArenaModel): string | null {
  if (!model.efficiency_comparable || !model.efficiency) return null;
  return `${Math.exp(model.efficiency.rating).toFixed(1)}×`;
}

export function rankedModels(scope: Scope): ArenaModel[] {
  return scope.models.filter((model) => !model.provisional);
}

export function provisionalModels(scope: Scope): ArenaModel[] {
  return scope.models.filter((model) => model.provisional);
}

export function formatUpdated(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

export function scopeHref(scope: string, model?: string): string {
  const params = new URLSearchParams();
  if (scope !== "overall") params.set("scope", scope);
  if (model) params.set("model", model);
  const query = params.toString();
  return query ? `?${query}` : "?";
}
