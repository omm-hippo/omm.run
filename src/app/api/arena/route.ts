import { loadLeaderboard, PUBLIC_KEY, SOURCE, type ArenaState } from "@/lib/arena/leaderboard";

export const dynamic = "force-dynamic";
let cached: { until: number; value: ArenaState } | undefined;
let inFlight: Promise<ArenaState> | undefined;

/** Only a development server can use a local verification corpus. */
function source() {
  const candidate = process.env.OMM_ARENA_SOURCE_ORIGIN;
  if (process.env.NODE_ENV === "development" && candidate) {
    const url = new URL(candidate);
    if (url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(url.hostname) && !url.username && !url.password) {
      return { url: url.href, key: process.env.OMM_ARENA_PUBLIC_KEY ?? PUBLIC_KEY, test: true };
    }
  }
  return { url: SOURCE, key: PUBLIC_KEY, test: false };
}

export async function GET() {
  if (!cached || cached.until < Date.now()) {
    if (!inFlight) {
      const selected = source();
      inFlight = loadLeaderboard(fetch, selected.url, selected.key, selected.test);
    }
    try {
      cached = { until: Date.now() + 15 * 60 * 1000, value: await inFlight };
    } finally { inFlight = undefined; }
  }
  return Response.json(cached.value, { headers: { "Cache-Control": "public, max-age=60" } });
}
