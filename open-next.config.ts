// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

const cloudflareConfig = {
	...defineCloudflareConfig({
		incrementalCache: staticAssetsIncrementalCache,
		enableCacheInterception: true,
	}),
	// Without this, `opennextjs-cloudflare build` re-runs the project's own
	// "build" npm script (`next build && opennextjs-cloudflare build`),
	// recursing into itself forever.
	buildCommand: "next build",
};

export default cloudflareConfig;
