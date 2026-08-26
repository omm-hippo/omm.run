const SECRET_PATTERNS = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/iu,
  /\b(?:sk|pk)[-_](?:live|test|or)[-_][A-Za-z0-9_-]{16,}\b/u,
  /\bgh(?:p|o|u|s|r)_[A-Za-z0-9]{20,}\b/u,
  /\bAKIA[0-9A-Z]{16}\b/u,
  /\b(?:api[_ -]?key|access[_ -]?token|auth[_ -]?token|password|passwd)\s*[:=]\s*\S{6,}/iu,
] as const;

const URL_PATTERN = /(?:https?:\/\/|www\.)\S+/iu;

export type InputSafety = "safe" | "sensitive" | "url";

export function inspectInput(question: string): InputSafety {
  if (SECRET_PATTERNS.some((pattern) => pattern.test(question))) {
    return "sensitive";
  }
  if (URL_PATTERN.test(question)) return "url";
  return "safe";
}

export function rateLimitIdentity(requestUrl: string, clientAddress: string): string {
  let scope = "development";
  try {
    const hostname = new URL(requestUrl).hostname.toLowerCase();
    if (hostname === "omm.run" || hostname === "www.omm.run") {
      scope = "production";
    } else if (hostname.endsWith(".workers.dev")) {
      scope = "preview";
    }
  } catch {
    // Invalid URLs keep the fail-closed development scope.
  }
  return `${scope}\u0000${clientAddress}`;
}

export async function privateHash(secret: string, value: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${secret}\u0000${value}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
