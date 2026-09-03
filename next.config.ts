import type { NextConfig } from "next";
import { execFileSync } from "node:child_process";

import { buildCommitSha } from "./src/lib/site-metadata";

const nextConfig: NextConfig = {
  // Cloudflare bindings are supplied by the Worker. Plain `next dev` uses the
  // assistant route's deterministic fallback without opening remote sessions.
  env: {
    OMM_BUILD_SHA: buildCommitSha(process.env, () =>
      execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }),
    ),
  },
};

export default nextConfig;
