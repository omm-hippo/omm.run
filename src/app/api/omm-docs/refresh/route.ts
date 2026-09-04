import { getCloudflareContext } from "@opennextjs/cloudflare";

import { edgeCache, readmeCacheKey } from "@/lib/omm-docs/source";

/**
 * Drops the cached README so the next `/docs/*` render pulls it fresh.
 *
 * Called by a GitHub Action in `omm-hippo/omm` on any push to `main` that
 * touches `README.md`. `caches.default` is per-colo, so this refreshes the
 * colo that serves the request; the rest expire on the one-hour `s-maxage`.
 */

export const dynamic = "force-dynamic";

const NO_STORE = {
  "cache-control": "no-store",
  "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
} as const;

function expectedToken(): string | undefined {
  try {
    const env = getCloudflareContext().env as {
      OMM_DOCS_REFRESH_TOKEN?: string;
    };
    return env.OMM_DOCS_REFRESH_TOKEN ?? process.env.OMM_DOCS_REFRESH_TOKEN;
  } catch {
    return process.env.OMM_DOCS_REFRESH_TOKEN;
  }
}

/** Length-checked constant-time compare so the token isn't leaked by timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function POST(request: Request): Promise<Response> {
  const token = expectedToken();
  if (!token) {
    return Response.json(
      { error: "not_provisioned" },
      { status: 501, headers: NO_STORE },
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!bearer || !safeEqual(bearer, token)) {
    return Response.json(
      { error: "unauthorized" },
      { status: 401, headers: NO_STORE },
    );
  }

  const cache = edgeCache();
  const purged = cache ? await cache.delete(readmeCacheKey()) : false;
  return Response.json({ purged }, { headers: NO_STORE });
}
