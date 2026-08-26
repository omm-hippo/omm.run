import {
  getCommand,
  getCommandLinks,
} from "../../components/commands/commands";
import { COMMAND_ORDER, type Slug } from "../../i18n/commands/base";
import type { Locale } from "../../i18n/config";
import { ASSISTANT_LIMITS, type Candidate } from "./types";

const LATIN_STOP_WORDS = new Set([
  "about",
  "after",
  "and",
  "are",
  "for",
  "from",
  "how",
  "installed",
  "model",
  "omm",
  "runner",
  "that",
  "the",
  "this",
  "what",
  "when",
  "where",
  "which",
  "with",
]);

function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[^\p{L}\p{N}_.-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string): readonly string[] {
  const result = new Set<string>();
  for (const word of normalize(value).split(" ")) {
    if (!word) continue;
    if (/^[a-z]+$/u.test(word)) {
      if (word.length >= 3 && !LATIN_STOP_WORDS.has(word)) result.add(word);
      if (word.endsWith("ing") && word.length > 6) result.add(word.slice(0, -3));
      if (word.endsWith("ed") && word.length > 5) result.add(word.slice(0, -2));
      continue;
    }
    if (/^[가-힣]+$/u.test(word)) {
      result.add(word);
      for (let size = 2; size <= Math.min(4, word.length); size += 1) {
        for (let index = 0; index <= word.length - size; index += 1) {
          result.add(word.slice(index, index + size));
        }
      }
      continue;
    }
    if (word.length >= 2) result.add(word);
  }
  return [...result];
}

function searchableSections(
  slug: Slug,
  locale: Locale,
  summary: string,
): readonly string[] {
  const command = getCommand(slug, locale);
  return [
    [command.name, summary, command.lede, command.overviewBody].join(" "),
    [
      ...command.options.flatMap((option) => [option.name, option.description]),
      ...command.examples.flatMap((example) => [example.command, example.caption]),
    ].join(" "),
    [
      ...command.trouble.flatMap((entry) => [entry.why, entry.fix]),
      ...command.related.flatMap((entry) => [entry.label, entry.blurb]),
    ].join(" "),
  ];
}

function sectionScore(queryTokens: readonly string[], value: string, weight: number): number {
  const normalized = normalize(value);
  const sectionTokens = new Set(tokens(normalized));
  let score = 0;
  for (const token of queryTokens) {
    if (sectionTokens.has(token)) score += Math.min(token.length, 8) * weight;
    else if (token.length >= 4 && normalized.includes(token)) score += weight;
  }
  return score;
}

/**
 * Small search-only boosts for the common “installed runner is not detected”
 * phrasing. The command content still comes exclusively from the static docs.
 */
function runnerDiagnosisBoosts(question: string): ReadonlyMap<Slug, number> {
  const normalized = normalize(question);
  const englishRunnerProblem =
    /\brunner\b.*\b(?:detect|detected|detection|recognize|recognized|find|found|diagnos|missing)\w*\b/u.test(
      normalized,
    ) ||
    /\b(?:detect|detected|detection|recognize|recognized|find|found|diagnos|missing)\w*\b.*\brunner\b/u.test(
      normalized,
    );
  const koreanRunnerProblem =
    /러너.*(?:감지|인식|찾|진단|안 보|못 찾)|(?:감지|인식|찾|진단|안 보|못 찾).*러너/u.test(
      normalized,
    );
  if (!englishRunnerProblem && !koreanRunnerProblem) return new Map();
  return new Map<Slug, number>([
    ["doctor", 120],
    ["scan", 120],
    ["link", 105],
    ["setup", 30],
  ]);
}

export function explicitCommand(question: string): Slug | null {
  const normalized = normalize(question);
  for (const slug of COMMAND_ORDER) {
    const pattern = new RegExp(`(?:^|\\s)omm\\s+${slug}(?:\\s|$)`, "u");
    if (pattern.test(normalized)) return slug;
  }
  return null;
}

/** OMM manages local GGUF files, not hosted OpenAI API models. Any bare
 * “OpenAI model” request needs the model family clarified; explicit
 * gpt-oss/GGUF wording is allowed through to normal command selection. */
export function needsOpenAiModelClarification(question: string): boolean {
  const normalized = normalize(question);
  const mentionsOpenAi =
    /\bopen\s*ai\b|\bopenai\b|오픈\s*(?:ai|에이아이)/u.test(normalized);
  const namesOpenWeightModel =
    /\bgpt[ ._-]?oss\b|\bgguf\b|\bopen[ -]?weight\b|오픈소스|공개\s*가중치/u.test(
      normalized,
    );
  return mentionsOpenAi && !namesOpenWeightModel;
}

export function narrowCandidates(question: string, locale: Locale): readonly Candidate[] {
  const queryTokens = tokens(question);
  if (queryTokens.length === 0) return [];

  const summaryBySlug = new Map(
    getCommandLinks(locale).map((link) => [link.slug, link.summary]),
  );
  const diagnosisBoosts = runnerDiagnosisBoosts(question);

  const ranked = COMMAND_ORDER.map((slug) => {
    const command = getCommand(slug, locale);
    const summary = summaryBySlug.get(slug) ?? "";
    const sections = searchableSections(slug, locale, summary);
    let score = diagnosisBoosts.get(slug) ?? 0;

    if (queryTokens.includes(slug)) score += 30;
    score += sectionScore(queryTokens, sections[0], 4);
    score += sectionScore(queryTokens, sections[1], 2);
    score += sectionScore(queryTokens, sections[2], 1);

    return { id: slug, name: command.name, summary, score };
  })
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));

  const strongest = ranked[0]?.score ?? 0;
  if (strongest < 8) return [];
  const confidenceFloor = strongest * 0.6;
  return ranked
    .filter((candidate) => candidate.score >= confidenceFloor)
    .slice(0, ASSISTANT_LIMITS.maxCandidates);
}
