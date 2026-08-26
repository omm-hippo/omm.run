import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  D1AssistantStore,
  type D1DatabaseLike,
} from "../../../lib/assistant/budget";
import { parseAssistantRequestText } from "../../../lib/assistant/request";
import { answerAssistantQuestion } from "../../../lib/assistant/service";
import {
  ASSISTANT_LIMITS,
  type AssistantResponse,
} from "../../../lib/assistant/types";
import type { WorkersAiBinding } from "../../../lib/assistant/workers-ai";

type AssistantEnv = CloudflareEnv & {
  readonly AI?: WorkersAiBinding;
  readonly ASSISTANT_DB?: D1DatabaseLike;
  readonly ASSISTANT_HASH_SALT?: string;
  readonly WORKERS_AI_MODEL?: string;
};

function invalidRequest(): AssistantResponse {
  return {
    kind: "fallback",
    source: "deterministic",
    reason: "invalid_request",
    commandId: null,
    candidateIds: [],
  };
}

function json(result: AssistantResponse, status = 200): Response {
  return Response.json(result, {
    status,
    headers: {
      "cache-control": "no-store",
      "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
      "x-content-type-options": "nosniff",
    },
  });
}

export async function POST(request: Request): Promise<Response> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > ASSISTANT_LIMITS.maxBodyCharacters * 4
  ) {
    return json(invalidRequest(), 400);
  }
  const parsed = parseAssistantRequestText(await request.text());
  if (!parsed.ok) return json(invalidRequest(), 400);

  let env: AssistantEnv | undefined;
  try {
    env = getCloudflareContext().env as AssistantEnv;
  } catch {
    // `next dev` without Cloudflare bindings intentionally takes the fallback.
  }

  const result = await answerAssistantQuestion(parsed.value, {
    ai: env?.AI,
    store: env?.ASSISTANT_DB ? new D1AssistantStore(env.ASSISTANT_DB) : undefined,
    model: env?.WORKERS_AI_MODEL,
    hashSalt: env?.ASSISTANT_HASH_SALT,
    clientIdentity: request.headers.get("cf-connecting-ip") ?? "anonymous",
  });

  return json(result);
}
