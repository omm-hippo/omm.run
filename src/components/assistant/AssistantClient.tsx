"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import AssistantIcon, { AssistantMark, type AssistantIconName } from "./AssistantIcon";
import CommandCard from "@/components/assistant/CommandCard";
import type {
  AssistantCommandCard,
  AssistantKind,
  AssistantReason,
  AssistantResult,
  AssistantSource,
} from "@/components/assistant/types";
import { localeHref, type Locale } from "@/i18n/config";
import { fill, getDictionary } from "@/i18n/dictionaries";
import type { CommandId } from "@/lib/assistant/catalog";
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
  ) as CommandId[];

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
  compact = false,
  contextCommand,
}: {
  readonly cards: readonly AssistantCommandCard[];
  readonly locale: Locale;
  readonly compact?: boolean;
  readonly contextCommand?: CommandId;
}) {
  const t = getDictionary(locale).assistant;
  const resultSection = useRef<HTMLElement>(null);
  const activeRequest = useRef<AbortController | null>(null);
  useEffect(() => () => activeRequest.current?.abort(), []);
  const questionInput = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (compact && !questionInput.current?.closest("[hidden]")) questionInput.current?.focus(); }, [compact]);
  const [question, setQuestion] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
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
  const privateInput = result?.reason === "sensitive_input" || result?.reason === "unsafe_input";
  const searchHref = privateInput ? localeHref("/commands", locale) : `${localeHref("/commands", locale)}?q=${encodeURIComponent(submittedQuestion || trimmed)}`;

  async function submitQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading" || turnLimitReached) return;

    if (trimmed.length === 0) {
      setError(t.empty);
      return;
    }

    setSubmittedQuestion(trimmed);
    setStatus("loading");
    setError(null);
    setResult(null);
    const controller = new AbortController();
    activeRequest.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locale, question: trimmed, turnCount, ...(contextCommand ? { contextCommand } : {}) }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`assistant_http_${response.status}`);
      const parsed = parseResponse(await response.json(), allowedIds);
      if (!parsed) throw new Error("assistant_invalid_response");

      setResult(parsed);
      setQuestion("");
      setTurnCount((current) => Math.min(current + 1, MAX_TURNS));
    } catch {
      setError(t.unavailable);
    } finally {
      window.clearTimeout(timeout);
      setStatus("done");
    }
  }

  function reset() {
    activeRequest.current?.abort();
    setQuestion("");
    setSubmittedQuestion("");
    setTurnCount(0);
    setStatus("idle");
    setResult(null);
    setError(null);
  }

  useEffect(() => {
    if (compact && (result || error)) resultSection.current?.scrollIntoView({ block: "nearest" });
  }, [compact, result, error]);

  const resultLabel =
    result?.kind === "clarify"
      ? t.clarifyLabel
      : result?.kind === "fallback"
        ? t.fallbackLabel
        : t.resultLabel;

  const copy = locale === "ko" ? {
    welcome: "무엇을 도와드릴까요?", placeholder: "OMM AI에게 질문하기", mode: "명령어 안내", privacy: "개인정보 안내", search: "명령어 검색",
    suggestions: [
      { label: "내 컴퓨터에 맞는 모델 찾기", question: "이 컴퓨터에 맞는 모델을 추천받으려면?", icon: "model" },
      { label: "모델 설치하기", question: "모델을 설치하려면 어떤 명령어를 쓰나요?", icon: "install" },
      { label: "로컬 AI 연결하기", question: "Codex를 로컬 Ollama 모델에 연결하려면?", icon: "connect" },
      { label: "문제 진단하기", question: "설치한 러너를 찾지 못하는 이유를 어떻게 확인하나요?", icon: "check" },
    ],
  } : {
    welcome: "How can I help?", placeholder: "Ask OMM AI anything", mode: "Command guide", privacy: "Privacy information", search: "Search commands",
    suggestions: [
      { label: "Find a model for my computer", question: "Which command recommends a model that fits this computer?", icon: "model" },
      { label: "Install a model", question: "Which command installs a model?", icon: "install" },
      { label: "Connect local AI", question: "How do I connect Codex to local Ollama?", icon: "connect" },
      { label: "Diagnose a problem", question: "Why is an installed runner not detected?", icon: "check" },
    ],
  };

  return (
    <div className="assistant-chat">
      {status === "idle" && !error ? <div className="assistant-welcome">
        <div className="assistant-welcome-mark"><AssistantMark /></div>
        <h3>{copy.welcome}</h3>
        <div className="assistant-suggestions" aria-label={t.quickLabel}>
          {copy.suggestions.map((suggestion) => <button key={suggestion.icon} type="button" onClick={() => {
            setQuestion(suggestion.question); setError(null); questionInput.current?.focus();
          }}><AssistantIcon name={suggestion.icon as AssistantIconName} /><span>{suggestion.label}</span></button>)}
        </div>
      </div> : null}
      {(status !== "idle" || error) ? <section ref={resultSection}
        aria-live="polite"
        aria-busy={status === "loading"}
        className="assistant-response-scroll"
      >
        {compact && submittedQuestion ? <p className="assistant-question-echo">{submittedQuestion}</p> : null}
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

      </section> : null}
      <form onSubmit={submitQuestion} noValidate className="assistant-composer-form">
        {turnLimitReached ? <p className="assistant-turn-limit">{t.turnLimit}</p> : null}
        <div className="assistant-composer">
          <label htmlFor="assistant-question" className="sr-only">{t.formLabel}</label>
          <textarea
            ref={questionInput}
            id="assistant-question"
            value={question}
            onChange={(event) => {
              setQuestion(Array.from(event.target.value).slice(0, MAX_QUESTION_LENGTH).join(""));
              if (error) setError(null);
            }}
            placeholder={copy.placeholder}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.nativeEvent.keyCode !== 229) {
                event.preventDefault(); event.currentTarget.form?.requestSubmit();
              }
            }}
            rows={3}
            aria-describedby="assistant-privacy assistant-counter"
            disabled={turnLimitReached || status === "loading"}
          />
          <div className="assistant-composer-toolbar">
            <Link href={localeHref("/commands", locale)} prefetch={false} aria-label={copy.search} title={copy.search} className="assistant-tool-button"><AssistantIcon name="search" /></Link>
            <details className="assistant-privacy">
              <summary aria-label={copy.privacy} title={copy.privacy} className="assistant-tool-button"><AssistantIcon name="shield" /></summary>
              <p id="assistant-privacy">{t.privacy}</p>
            </details>
            <span id="assistant-counter" className={question ? "assistant-counter" : "sr-only"}>{fill(t.counter, { count: String(Array.from(question).length), max: String(MAX_QUESTION_LENGTH) })}</span>
            <span className="assistant-composer-mode">{copy.mode}</span>
            <button type="submit" className="assistant-send" aria-label={status === "loading" ? t.submitting : t.submit} title={t.submit} disabled={!trimmed || status === "loading" || turnLimitReached}><AssistantIcon name="send" /></button>
          </div>
        </div>
      </form>
    </div>
  );
}
