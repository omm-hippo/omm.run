"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import CommandCard from "@/components/assistant/CommandCard";
import type {
  AssistantCommandCard,
  AssistantKind,
  AssistantReason,
  AssistantResult,
  AssistantSource,
} from "@/components/assistant/types";
import type { Slug } from "@/components/commands/commands";
import { localeHref, type Locale } from "@/i18n/config";
import { fill, getDictionary } from "@/i18n/dictionaries";
import { ASSISTANT_LIMITS } from "@/lib/assistant/types";

const MAX_QUESTION_LENGTH = ASSISTANT_LIMITS.maxQuestionCharacters;
const MAX_TURNS = ASSISTANT_LIMITS.maxTurns;
const REQUEST_TIMEOUT_MS = 7_000;
const KINDS = new Set<AssistantKind>(["command", "clarify", "fallback"]);
const SOURCES = new Set<AssistantSource>(["workers-ai", "deterministic"]);
const REASONS = new Set<AssistantReason>([
  "matched",
  "ambiguous",
  "no_match",
  "sensitive_input",
  "unsafe_input",
  "openai_model_ambiguous",
  "rate_limited",
  "daily_cap",
  "not_configured",
  "provider_unavailable",
  "invalid_response",
  "invalid_request",
]);
const RESPONSE_KEYS = new Set([
  "kind",
  "source",
  "reason",
  "commandId",
  "candidateIds",
]);

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Workers AI may select static IDs only. Extra fields or unknown IDs reject
 * the entire response before the UI can render it.
 */
function parseResponse(
  value: unknown,
  allowedIds: ReadonlySet<string>,
): AssistantResult | null {
  if (!isRecord(value)) return null;
  if (Object.keys(value).some((key) => !RESPONSE_KEYS.has(key))) return null;
  if (typeof value.kind !== "string" || !KINDS.has(value.kind as AssistantKind)) {
    return null;
  }
  if (
    typeof value.source !== "string" ||
    !SOURCES.has(value.source as AssistantSource)
  ) {
    return null;
  }
  if (
    typeof value.reason !== "string" ||
    !REASONS.has(value.reason as AssistantReason)
  ) {
    return null;
  }
  if (!(value.commandId === null || typeof value.commandId === "string")) {
    return null;
  }
  if (
    !Array.isArray(value.candidateIds) ||
    value.candidateIds.length > ASSISTANT_LIMITS.maxSuggestions ||
    value.candidateIds.some((id) => typeof id !== "string" || !allowedIds.has(id))
  ) {
    return null;
  }

  const rawIds = [value.commandId, ...value.candidateIds].filter(
    (id): id is string => typeof id === "string",
  );
  if (rawIds.some((id) => !allowedIds.has(id))) return null;
  const commandIds = rawIds.filter(
    (id, index, ids) => ids.indexOf(id) === index,
  ) as Slug[];

  if (value.kind === "command" && value.commandId === null) return null;

  return {
    kind: value.kind as AssistantKind,
    source: value.source as AssistantSource,
    reason: value.reason as AssistantReason,
    commandIds,
  };
}

export default function AssistantClient({
  cards,
  locale,
}: {
  readonly cards: readonly AssistantCommandCard[];
  readonly locale: Locale;
}) {
  const t = getDictionary(locale).assistant;
  const [question, setQuestion] = useState("");
  const [turnCount, setTurnCount] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cardById = useMemo(
    () => new Map(cards.map((card) => [card.id, card])),
    [cards],
  );
  const allowedIds = useMemo(() => new Set(cardById.keys()), [cardById]);
  const selectedCards = result
    ? result.commandIds.flatMap((id) => {
        const card = cardById.get(id);
        return card ? [card] : [];
      })
    : [];
  const trimmed = question.trim();
  const turnLimitReached = turnCount >= MAX_TURNS;
  const searchHref = `${localeHref("/commands", locale)}?q=${encodeURIComponent(trimmed)}`;

  async function submitQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading" || turnLimitReached) return;

    if (trimmed.length === 0) {
      setError(t.empty);
      return;
    }

    setStatus("loading");
    setError(null);
    setResult(null);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale, question: trimmed, turnCount }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`assistant_http_${response.status}`);
      const parsed = parseResponse(await response.json(), allowedIds);
      if (!parsed) throw new Error("assistant_invalid_response");

      setResult(parsed);
      setTurnCount((current) => Math.min(current + 1, MAX_TURNS));
    } catch {
      setError(t.unavailable);
    } finally {
      window.clearTimeout(timeout);
      setStatus("done");
    }
  }

  function reset() {
    setQuestion("");
    setTurnCount(0);
    setStatus("idle");
    setResult(null);
    setError(null);
  }

  const resultLabel =
    result?.kind === "clarify"
      ? t.clarifyLabel
      : result?.kind === "fallback"
        ? t.fallbackLabel
        : t.resultLabel;

  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <form onSubmit={submitQuestion} noValidate>
          <label htmlFor="assistant-question" className="text-h3 block">
            {t.formLabel}
          </label>
          <div className="mt-5 rounded-lg border border-line-1 bg-bg-1 focus-within:border-accent-line">
            <textarea
              id="assistant-question"
              value={question}
              onChange={(event) => {
                setQuestion(Array.from(event.target.value).slice(0, MAX_QUESTION_LENGTH).join(""));
                if (error) setError(null);
              }}
              placeholder={t.placeholder}
              rows={6}
              aria-describedby="assistant-privacy assistant-counter"
              disabled={turnLimitReached}
              className="block w-full resize-y bg-transparent px-4 pt-4 text-[16px] leading-7 text-ink-0 outline-none placeholder:text-ink-3 disabled:cursor-not-allowed disabled:text-ink-3"
            />
            <div className="flex items-center justify-between border-t border-line-0 px-4 py-3">
              <span id="assistant-counter" className="text-label">
                {fill(t.counter, {
                  count: String(Array.from(question).length),
                  max: String(MAX_QUESTION_LENGTH),
                })}
              </span>
              <button
                type="submit"
                disabled={status === "loading" || turnLimitReached}
                className="focus-ring-neutral rounded-md bg-accent px-5 py-2 text-small font-medium text-accent-ink transition-colors duration-[120ms] ease-micro hover:bg-accent-press disabled:cursor-not-allowed disabled:bg-bg-3 disabled:text-ink-3"
              >
                {status === "loading" ? t.submitting : t.submit}
              </button>
            </div>
          </div>

          <p id="assistant-privacy" className="text-small mt-4 max-w-[62ch]">
            {t.privacy}
          </p>
          {turnLimitReached ? (
            <p className="text-small mt-3 border-l border-accent-line pl-3 text-ink-1">
              {t.turnLimit}
            </p>
          ) : null}

          <div className="mt-8 border-t border-line-0 pt-6">
            <p className="text-label">{t.quickLabel}</p>
            <div className="mt-3 flex flex-col items-start gap-2">
              {t.quickQuestions.map((example) => (
                <button
                  key={example}
                  type="button"
                  disabled={turnLimitReached}
                  onClick={() => {
                    setQuestion(example);
                    setError(null);
                  }}
                  className="text-left text-small text-ink-2 transition-colors duration-[120ms] ease-micro hover:text-ink-0 disabled:cursor-not-allowed disabled:text-ink-3"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      <section
        aria-live="polite"
        aria-busy={status === "loading"}
        className="mt-10 min-h-80 border-t border-line-1 pt-8"
      >
        {status === "loading" ? (
          <div className="flex min-h-64 items-center border-y border-line-0">
            <p className="font-mono text-[13px] text-ink-2">{t.submitting}</p>
          </div>
        ) : null}

        {error ? (
          <div className="border-y border-line-0 py-8">
            <p className="text-label">{t.fallbackLabel}</p>
            <p className="mt-4 max-w-[62ch] text-ink-1">{error}</p>
            <Link
              href={searchHref}
              prefetch={false}
              className="mt-6 inline-flex border-b border-line-1 pb-0.5 text-small font-medium text-ink-1 transition-colors duration-[120ms] ease-micro hover:border-accent hover:text-ink-0"
            >
              {t.searchAll}
            </Link>
          </div>
        ) : null}

        {result ? (
          <div>
            <div className="flex flex-col gap-3 border-b border-line-1 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-label">{resultLabel}</p>
                <p className="mt-4 max-w-[62ch] text-ink-1">
                  {t.messages[result.reason]}
                </p>
              </div>
              <span className="text-label shrink-0 text-ink-3">
                {t.source[result.source]}
              </span>
            </div>

            {selectedCards.length > 0 ? (
              <div className="py-6">
                {selectedCards.map((card) => (
                  <CommandCard key={card.id} card={card} locale={locale} />
                ))}
              </div>
            ) : (
              <div className="border-b border-line-0 py-8">
                <Link
                  href={searchHref}
                  prefetch={false}
                  className="inline-flex border-b border-line-1 pb-0.5 text-small font-medium text-ink-1 transition-colors duration-[120ms] ease-micro hover:border-accent hover:text-ink-0"
                >
                  {t.searchAll}
                </Link>
              </div>
            )}

            {result.kind === "fallback" && selectedCards.length > 0 ? (
              <Link
                href={searchHref}
                prefetch={false}
                className="mt-1 inline-flex border-b border-line-1 pb-0.5 text-small font-medium text-ink-1 transition-colors duration-[120ms] ease-micro hover:border-accent hover:text-ink-0"
              >
                {t.searchAll}
              </Link>
            ) : null}

            <button
              type="button"
              onClick={reset}
              className="mt-5 block text-small text-ink-2 transition-colors duration-[120ms] ease-micro hover:text-ink-0"
            >
              {t.askAgain}
            </button>
          </div>
        ) : null}

        {status === "idle" && !error && !result ? (
          <div className="flex min-h-64 items-center border-y border-line-0">
            <div>
              <p className="font-mono text-[13px] text-accent">$ omm help</p>
              <p className="text-small mt-4 max-w-[52ch]">{t.scope}</p>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
