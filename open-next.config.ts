// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

const cloudflareConfig = {
	...defineCloudflareConfig({
		incrementalCache: staticAssetsIncrementalCache,
		enableCacheInterception: true,
	}),
	// Keep the framework build explicit: the package's "build" script invokes
	// OpenNext, so falling back to that script would recurse into itself.
	buildCommand: "next build",
};

export default cloudflareConfig;
