import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  fetchFromGitHub,
  isCommitSha,
  revisionStore,
  setRevision,
} from "@/lib/omm-docs/source";

/**
 * Points every `/docs/*` page at a new upstream commit.
 *
 * Called by `.github/workflows/omm-site-docs-refresh.yml` in `omm-hippo/omm`
 * on any push to `main` that touches `README.md` or `docs/install.md`, with
 * body `{"sha": "<40-hex commit>"}`. The commit is stored in the `OMM_DOCS`
 * KV namespace, so every colo switches within about a minute; see
 * `src/lib/omm-docs/source.ts`.
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

  let sha: unknown;
  try {
    sha = ((await request.json()) as { sha?: unknown }).sha;
  } catch {
    sha = undefined;
  }
  if (!isCommitSha(sha)) {
    return Response.json({ error: "invalid_sha" }, { status: 400, headers: NO_STORE });
  }

  const store = await revisionStore();
  if (!store) {
    return Response.json({ error: "not_provisioned" }, { status: 501, headers: NO_STORE });
  }

  // Only switch to a commit whose README GitHub actually serves; a typo or a
  // commit from another repo would otherwise break the docs for a day.
  try {
    await fetchFromGitHub("readme", sha);
  } catch {
    return Response.json({ error: "unknown_commit" }, { status: 422, headers: NO_STORE });
  }

  await setRevision(store, sha);
  return Response.json({ revision: sha }, { headers: NO_STORE });
}
