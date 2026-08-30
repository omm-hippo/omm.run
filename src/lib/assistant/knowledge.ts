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

/** Compact symptom→fix + example context handed to Workers AI alongside the
 *  one-line summary. Content still comes only from the static docs. */
function candidateContext(command: ReturnType<typeof getCommand>): string {
  const trouble = command.trouble
    .slice(0, 2)
    .map((entry) => `${entry.why} Fix: ${entry.fix}`);
  const examples = command.examples
    .slice(0, 2)
    .map((example) => `${example.command} — ${example.caption}`);
  return [...trouble, ...examples].join(" | ").slice(0, 360);
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
 * Search-only intent boosts for phrasings the token-overlap ranker misses:
 * users describe a symptom or use a synonym the static docs never spell out
 * ("talk to a model" vs "chat", "get rid of" vs "remove"). Each rule adds to a
 * slug's score; the command content still comes only from the static docs.
 *
 * ponytail: hand-maintained rule list, not a learned model — add a row when a
 * real miss shows up in scratchpad/assistant-eval.ts.
 */
type BoostRule = {
  readonly when: RegExp;
  readonly boosts: ReadonlyArray<readonly [Slug, number]>;
};

// Patterns run against normalize() output: lowercased, apostrophes and most
// punctuation collapsed to spaces ("isn't" -> "isn t"), Korean kept.
const BOOST_RULES = [
  // Installed runner / app is not being detected — diagnose before reinstalling.
  {
    when: /\brunner\b.*\b(?:detect|detected|detection|recognize|recognized|find|found|diagnos|missing)\w*\b|\b(?:detect|detected|detection|recognize|recognized|find|found|diagnos|missing)\w*\b.*\brunner\b|러너.*(?:감지|인식|찾|진단|안 보|못 찾)|(?:감지|인식|찾|진단|안 보|못 찾).*러너/u,
    boosts: [
      ["doctor", 120],
      ["scan", 120],
      ["link", 105],
      ["setup", 30],
    ],
  },
  // Broader "omm can't see / doesn't find / acts like it isn't there" for an
  // app or model, without the literal word "runner".
  {
    when: /\b(?:not|isn|isnt|doesn|doesnt|cant|can|wont|cannot|no)\b.{0,30}\b(?:detect|detects|see|find|finds|found|show|shows|showing|recognize|recognizes|appear|appears|picked|pick)\w*\b|\bacts? like it\b|못 (?:찾|알아|인식)|인식.{0,3}못|찾지 못|안 (?:보이|잡)/u,
    boosts: [
      ["doctor", 70],
      ["scan", 60],
      ["link", 55],
    ],
  },
  // "chat with / talk to / ask a model" — run is documented as
  // "Chat with an installed model".
  {
    when: /\b(?:talk|talking|chat|chatting|converse|conversation|ask|prompt)\b.{0,20}\bmodel\b|\bmodel\b.{0,20}\b(?:talk|chat|ask|prompt)\b|모델.{0,5}(?:대화|얘기|이야기|채팅|말)|물어보/u,
    boosts: [["run", 60]],
  },
  // "get rid of / delete / remove a model" — uninstall is documented as
  // "Remove a model and clean up its symlinks".
  {
    when: /\b(?:get rid of|rid of|delete|deleting|remove|removing|wipe|uninstall)\b.{0,20}\bmodel\b|\bmodel\b.{0,20}\b(?:get rid|delete|remove|wipe)\b|모델.{0,6}(?:지우|삭제|없애|제거)|(?:지우|삭제|없애|제거).{0,6}모델/u,
    boosts: [["uninstall", 70]],
  },
  // "will it run on / fit / handle / enough memory" — fit answers "does this
  // model fit this machine's free memory right now".
  {
    when: /\b(?:fit|fits|run on|runs on|running on|work on|works on|handle|handles|too big|big enough|enough ram|enough memory)\b|돌아갈|돌릴 수|감당|버틸|맞는지|충분.{0,3}(?:램|메모리|사양)/u,
    boosts: [
      ["fit", 65],
      ["recommend", 20],
    ],
  },
  // "leftover / broken shortcut / dangling links / partial downloads" — cleanup
  // now covers both broken runner symlinks and leftover install files.
  {
    when: /\b(?:broken|dead|dangling|stale|leftover|orphan|orphaned|partial|half)\b.{0,25}\b(?:link|links|shortcut|shortcuts|symlink|symlinks|download|downloads|file|files)\b|끊.{0,2}진.{0,5}(?:링크|바로가기)|깨진.{0,3}(?:링크|심)|받다\s*만|다운로드.{0,4}(?:찌꺼기|잔여|남은)/u,
    boosts: [
      ["cleanup", 70],
      ["link", 30],
    ],
  },
] as const satisfies readonly BoostRule[];

function intentBoosts(question: string): ReadonlyMap<Slug, number> {
  const normalized = normalize(question);
  const merged = new Map<Slug, number>();
  for (const rule of BOOST_RULES) {
    if (!rule.when.test(normalized)) continue;
    for (const [slug, value] of rule.boosts) {
      merged.set(slug, (merged.get(slug) ?? 0) + value);
    }
  }
  return merged;
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
  const boosts = intentBoosts(question);

  const ranked = COMMAND_ORDER.map((slug) => {
    const command = getCommand(slug, locale);
    const summary = summaryBySlug.get(slug) ?? "";
    const sections = searchableSections(slug, locale, summary);
    let score = boosts.get(slug) ?? 0;

    if (queryTokens.includes(slug)) score += 30;
    score += sectionScore(queryTokens, sections[0], 4);
    score += sectionScore(queryTokens, sections[1], 2);
    score += sectionScore(queryTokens, sections[2], 1);

    return {
      id: slug,
      name: command.name,
      summary,
      context: candidateContext(command),
      score,
    };
  })
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));

  const strongest = ranked[0]?.score ?? 0;
  if (strongest < 8) return [];
  // Keep recall wide: Workers AI re-ranks and can return clarify, so a looser
  // floor here mostly costs a few extra candidate lines in the prompt, while a
  // tight floor silently drops the right command before the model ever sees it.
  const confidenceFloor = strongest * 0.5;
  return ranked
    .filter((candidate) => candidate.score >= confidenceFloor)
    .slice(0, ASSISTANT_LIMITS.maxCandidates);
}
