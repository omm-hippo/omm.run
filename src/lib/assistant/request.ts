import {
  ASSISTANT_LIMITS,
  isLocale,
  type AssistantRequest,
} from "./types";

type ParseResult =
  | { readonly ok: true; readonly value: AssistantRequest }
  | { readonly ok: false };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseAssistantRequestText(text: string): ParseResult {
  if (text.length > ASSISTANT_LIMITS.maxBodyCharacters) return { ok: false };

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return { ok: false };
  }

  if (!isRecord(body) || !isLocale(body.locale)) return { ok: false };
  if (typeof body.question !== "string") return { ok: false };

  const question = body.question.trim().normalize("NFC");
  const length = Array.from(question).length;
  if (
    length < ASSISTANT_LIMITS.minQuestionCharacters ||
    length > ASSISTANT_LIMITS.maxQuestionCharacters ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(question)
  ) {
    return { ok: false };
  }

  const turnCount = body.turnCount === undefined ? 0 : body.turnCount;
  if (
    !Number.isInteger(turnCount) ||
    (turnCount as number) < 0 ||
    (turnCount as number) >= ASSISTANT_LIMITS.maxTurns
  ) {
    return { ok: false };
  }

  return {
    ok: true,
    value: { locale: body.locale, question, turnCount: turnCount as number },
  };
}
