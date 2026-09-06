import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";

import { OmmDocsUnavailable } from "../src/lib/omm-docs/errors";
import { fetchReadme } from "../src/lib/omm-docs/source";

const originalCaches = Object.getOwnPropertyDescriptor(globalThis, "caches");

afterEach(() => {
  mock.restoreAll();
  mock.timers.reset();
  if (originalCaches) Object.defineProperty(globalThis, "caches", originalCaches);
  else Reflect.deleteProperty(globalThis, "caches");
});

function cacheWith(overrides: Record<string, unknown> = {}) {
  Object.defineProperty(globalThis, "caches", {
    configurable: true,
    value: {
      default: {
        async match() { return undefined; },
        async put() {},
        ...overrides,
      },
    },
  });
}

test("a cache read failure still serves the upstream README", async () => {
  cacheWith({ async match() { throw new Error("cache unavailable"); } });
  const upstream = mock.method(globalThis, "fetch", async () => new Response("# README"));
  assert.equal(await fetchReadme(), "# README");
  assert.equal(upstream.mock.callCount(), 1);
});

test("a cache write failure does not discard a successful upstream response", async () => {
  cacheWith({ async put() { throw new Error("cache full"); } });
  mock.method(globalThis, "fetch", async () => new Response("# README"));
  assert.equal(await fetchReadme(), "# README");
});

test("a valid cache hit makes no upstream request", async () => {
  cacheWith({ async match() { return new Response("# Cached README"); } });
  const upstream = mock.method(globalThis, "fetch", async () => {
    throw new Error("unexpected network request");
  });
  assert.equal(await fetchReadme(), "# Cached README");
  assert.equal(upstream.mock.callCount(), 0);
});

test("an interrupted upstream body uses the document fallback error", async () => {
  Reflect.deleteProperty(globalThis, "caches");
  mock.method(globalThis, "fetch", async () => new Response(new ReadableStream({
    start(controller) { controller.error(new Error("connection lost during body")); },
  })));
  await assert.rejects(fetchReadme(), OmmDocsUnavailable);
});

test("the README request has a deadline that also cancels an incomplete body", async () => {
  Reflect.deleteProperty(globalThis, "caches");
  mock.timers.enable({ apis: ["setTimeout"] });
  let requestSignal: AbortSignal | undefined;
  mock.method(globalThis, "fetch", async (_url: unknown, init?: RequestInit) => {
    requestSignal = init?.signal ?? undefined;
    assert.ok(requestSignal, "the upstream request must be cancellable");
    return new Response(new ReadableStream({
      start(controller) {
        requestSignal!.addEventListener("abort", () => {
          controller.error(requestSignal!.reason);
        }, { once: true });
      },
    }));
  });
  const pending = assert.rejects(fetchReadme(), OmmDocsUnavailable);
  // Let the response headers arrive before the download deadline passes.
  await Promise.resolve();
  mock.timers.tick(5_000);
  await pending;
  assert.equal(requestSignal?.aborted, true);
});

test("an upstream HTTP error retains its status and is not cached", async () => {
  let writes = 0;
  cacheWith({ async put() { writes += 1; } });
  mock.method(globalThis, "fetch", async () => new Response("unavailable", { status: 503 }));
  await assert.rejects(fetchReadme(), (error: unknown) =>
    error instanceof OmmDocsUnavailable && error.status === 503,
  );
  assert.equal(writes, 0);
});

test("an upstream redirect is rejected instead of followed", async () => {
  Reflect.deleteProperty(globalThis, "caches");
  const upstream = mock.method(globalThis, "fetch", async (_url: unknown, init?: RequestInit) => {
    assert.equal(init?.redirect, "manual");
    return new Response(null, { status: 302, headers: { location: "https://example.com/README.md" } });
  });
  await assert.rejects(fetchReadme(), (error: unknown) =>
    error instanceof OmmDocsUnavailable && error.status === 302,
  );
  assert.equal(upstream.mock.callCount(), 1);
});
