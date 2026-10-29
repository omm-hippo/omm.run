import type { NextConfig } from "next";
import { execFileSync } from "node:child_process";

import { buildCommitSha } from "./src/lib/site-metadata";

const nextConfig: NextConfig = {
  async redirects() {
    const comparisonRedirects = ["", "/en", "/ko"].map((prefix) => ({
      source: `${prefix}/commands/compare`,
      destination: `${prefix}/commands/info`,
      permanent: true,
    }));
    return [...comparisonRedirects, ...["", "/en", "/ko"].map((prefix) => ({
      source: `${prefix}/assistant`,
      destination: `${prefix || "/"}?assistant=open`,
      permanent: true,
    })), ...["", "/en", "/ko"].flatMap((prefix) => [
      // Arena and leaderboard showed the same votes; one page remains.
      { source: `${prefix}/arena`, destination: `${prefix}/leaderboard`, permanent: true },
      // Per-checkpoint wiki pages were folded into the /models recommender.
      { source: `${prefix}/models/:slug`, destination: `${prefix}/models`, permanent: true },
      // The FAQ now lives at the bottom of the troubleshooting page.
      { source: `${prefix}/docs/faq`, destination: `${prefix}/docs/troubleshooting#faq`, permanent: true },
    ])];
  },
  // Cloudflare bindings are supplied by the Worker. Plain `next dev` uses the
  // assistant route's deterministic fallback without opening remote sessions.
  env: {
    OMM_BUILD_SHA: buildCommitSha(process.env, () =>
      execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }),
    ),
  },
};

export default nextConfig;
