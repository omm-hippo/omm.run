import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";

import {
  DEFAULT_LOCALE,
  LOCALES,
  alternatesFor,
  canonicalPath,
  isLocale,
  localeHref,
} from "../src/i18n/config";
import { config, middleware } from "../src/middleware";
import { GET } from "../src/app/api/models/route";
import { parseAssistantRequest } from "../src/lib/assistant/request";

test("Korean is the only locale and canonical metadata has no language alternatives", () => {
  assert.deepEqual(LOCALES, ["ko"]);
  assert.equal(DEFAULT_LOCALE, "ko");
  assert.equal(isLocale("ko"), true);
  assert.equal(isLocale("en"), false);
  assert.equal(isLocale("fr"), false);
  assert.equal(localeHref("/", "ko"), "/");
  assert.equal(localeHref("/#install", "ko"), "/#install");
  assert.equal(localeHref("/models?q=gemma#results", "ko"), "/models?q=gemma#results");
  assert.deepEqual(alternatesFor("/commands/install"), { canonical: "/commands/install" });
});

test("public pages rewrite to Korean despite English browser preferences and old cookies", () => {
  for (const path of ["/", "/commands", "/install/windows", "/models/qwen3-8-27b", "/assistant"]) {
    const response = middleware(new NextRequest(`https://example.test${path}?q=설치`, {
      headers: { "accept-language": "en-US,en;q=0.9", cookie: "omm_locale=en" },
    }));
    const rewrite = new URL(response.headers.get("x-middleware-rewrite")!);
    assert.equal(rewrite.pathname, path === "/" ? "/ko" : `/ko${path}`);
    assert.equal(rewrite.searchParams.get("q"), "설치");
    assert.equal(response.headers.get("location"), null);
    assert.equal(response.headers.get("x-middleware-request-x-omm-internal-locale-rewrite"), "1");
  }
});

test("legacy English and Korean links permanently redirect to the same public page", () => {
  for (const prefix of ["en", "ko"]) {
    for (const path of ["", "/commands/install", "/models/qwen3-8-27b", "/assistant"]) {
      const response = middleware(new NextRequest(`https://example.test/${prefix}${path}?q=gemma#results`));
      assert.equal(response.status, 308);
      const redirect = new URL(response.headers.get("location")!);
      assert.equal(redirect.pathname, path || "/");
      assert.equal(redirect.search, "?q=gemma");
      assert.equal(redirect.hash, "#results");
      assert.equal(response.headers.get("x-middleware-rewrite"), null);
    }
  }
  assert.equal(canonicalPath("/engine"), "/engine");
  assert.equal(canonicalPath("/korea"), "/korea");
});

test("an internal Korean rewrite reaches its page without a redirect loop", () => {
  for (const path of ["/ko", "/ko/commands/install", "/ko/models/unknown"]) {
    const response = middleware(new NextRequest(`https://example.test${path}`, {
      headers: { "x-omm-internal-locale-rewrite": "1" },
    }));
    assert.equal(response.headers.get("location"), null);
    assert.equal(response.headers.get("x-middleware-rewrite"), null);
    assert.equal(response.headers.get("x-middleware-next"), "1");
    assert.equal(response.headers.get("x-middleware-request-x-omm-internal-locale-rewrite"), null);
  }
});

test("locale routing excludes APIs, Next internals, and public assets", () => {
  for (const url of ["/api/models", "/api/assistant", "/_next/static/app.js", "/icon.svg", "/fonts/file.woff2"]) {
    assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }), false, url);
  }
  for (const url of ["/", "/commands", "/en/models", "/ko/install/windows"]) {
    assert.equal(unstable_doesMiddlewareMatch({ config, nextConfig: {}, url }), true, url);
  }
});

test("model JSON defaults to Korean and rejects removed English locale", async () => {
  const response = GET(new Request("https://example.test/api/models?id=gemma-3-4b-it"));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.locale, "ko");
  assert.match(data.models[0].summary, /[가-힣]/u);
  assert.equal(GET(new Request("https://example.test/api/models?locale=en")).status, 400);
});

test("assistant accepts Korean locale and rejects removed English locale", async () => {
  const request = (locale: string) => new Request("https://example.test/api/assistant", {
    method: "POST",
    body: JSON.stringify({ locale, question: "모델 설치", turnCount: 0 }),
  });
  assert.equal((await parseAssistantRequest(request("ko"))).ok, true);
  assert.equal((await parseAssistantRequest(request("en"))).ok, false);
});
