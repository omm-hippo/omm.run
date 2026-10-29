import type { WorkersAiBinding } from "./workers-ai";

/**
 * A self-hosted Ollama (the school PC) reached through a Cloudflare Tunnel
 * guarded by a Cloudflare Access service token. It is wrapped as a
 * `WorkersAiBinding` so the same prompt, timeout, schema and output
 * validation apply to both providers; only the wire format differs.
 *
 * Off unless every value is set: a half-configured gateway must never send a
 * question to an unauthenticated endpoint.
 */
export type GatewayConfig = {
  readonly url: string;
  readonly model: string;
  readonly accessClientId: string;
  readonly accessClientSecret: string;
};

export function resolveGatewayConfig(env: {
  readonly ASSISTANT_GATEWAY_URL?: string;
  readonly ASSISTANT_GATEWAY_MODEL?: string;
  readonly ASSISTANT_GATEWAY_ACCESS_ID?: string;
  readonly ASSISTANT_GATEWAY_ACCESS_SECRET?: string;
}): GatewayConfig | null {
  const url = env.ASSISTANT_GATEWAY_URL?.trim() ?? "";
  const model = env.ASSISTANT_GATEWAY_MODEL?.trim() ?? "";
  const accessClientId = env.ASSISTANT_GATEWAY_ACCESS_ID?.trim() ?? "";
  const accessClientSecret = env.ASSISTANT_GATEWAY_ACCESS_SECRET?.trim() ?? "";
  if (!url || !model || !accessClientId || !accessClientSecret) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  // Questions leave Cloudflare here, so plain http is never acceptable.
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) return null;
  return { url: parsed.origin, model, accessClientId, accessClientSecret };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Translate the Workers AI chat input into Ollama's `/api/chat`. */
export function ollamaChatBody(
  model: string,
  input: Record<string, unknown>,
): Record<string, unknown> {
  const format = isRecord(input.response_format)
    ? input.response_format.json_schema
    : undefined;
  return {
    model,
    messages: input.messages,
    format,
    stream: false,
    // Reasoning models (qwen3, gpt-oss) would spend the whole token budget
    // thinking and return no JSON; the selector needs none.
    think: false,
    keep_alive: "30m",
    options: {
      temperature: input.temperature,
      seed: input.seed,
      num_predict: input.max_completion_tokens,
    },
  };
}

export function gatewayBinding(
  config: GatewayConfig,
  timeoutMs: number,
  fetchImpl: typeof fetch = fetch,
): WorkersAiBinding {
  return {
    async run(model, input) {
      const reply = await fetchImpl(`${config.url}/api/chat`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "cf-access-client-id": config.accessClientId,
          "cf-access-client-secret": config.accessClientSecret,
        },
        body: JSON.stringify(ollamaChatBody(model, input)),
        redirect: "error",
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!reply.ok) throw new Error(`gateway_http_${reply.status}`);
      const body: unknown = await reply.json();
      const content =
        isRecord(body) && isRecord(body.message) ? body.message.content : undefined;
      // Same shape Workers AI returns, so parseWorkersAiSelection applies as-is.
      return { response: content };
    },
  };
}
