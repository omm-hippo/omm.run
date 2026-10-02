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
  switchLocalePath,
} from "../src/i18n/config";
import { config, middleware } from "../src/middleware";
import { GET } from "../src/app/api/models/route";
import { parseAssistantRequest } from "../src/lib/assistant/request";

test("Korean is the default and English has an explicit /en prefix", () => {
  assert.deepEqual(LOCALES, ["ko", "en"]);
  assert.equal(DEFAULT_LOCALE, "ko");
  assert.equal(isLocale("ko"), true);
  assert.equal(isLocale("en"), true);
  assert.equal(isLocale("fr"), false);
  assert.equal(localeHref("/", "ko"), "/");
  assert.equal(localeHref("/", "en"), "/en");
  assert.equal(localeHref("/#install", "ko"), "/#install");
  assert.equal(localeHref("/#install", "en"), "/en#install");
  assert.equal(localeHref("/models?q=gemma#results", "ko"), "/models?q=gemma#results");
  assert.equal(localeHref("/models?q=gemma#results", "en"), "/en/models?q=gemma#results");
  assert.equal(localeHref("/?q=gemma#results", "en"), "/en?q=gemma#results");
});

test("metadata gives each translation its own canonical URL with Korean as x-default", () => {
  const languages = { ko: "/commands/install", en: "/en/commands/install", "x-default": "/commands/install" };
  assert.deepEqual(alternatesFor("/commands/install"), { canonical: "/commands/install", languages });
  assert.deepEqual(alternatesFor("/commands/install", "en"), { canonical: "/en/commands/install", languages });
});

test("switching language preserves the current page, query and fragment", () => {
  assert.equal(switchLocalePath("/commands/install?from=search#options", "en"), "/en/commands/install?from=search#options");
  assert.equal(switchLocalePath("/en/commands/install?from=search#options", "ko"), "/commands/install?from=search#options");
  assert.equal(switchLocalePath("/ko/models?q=gemma#results", "en"), "/en/models?q=gemma#results");
  assert.equal(switchLocalePath("/en?q=gemma#results", "ko"), "/?q=gemma#results");
});

test("unprefixed pages rewrite to Korean despite English browser settings and old cookies", () => {
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

test("legacy /ko links redirect to the public Korean page without losing query or fragment", () => {
  for (const path of ["", "/commands/install", "/models/qwen3-8-27b", "/assistant"]) {
    const response = middleware(new NextRequest(`https://example.test/ko${path}?q=gemma#results`));
    assert.equal(response.status, 308);
    const redirect = new URL(response.headers.get("location")!);
    assert.equal(redirect.pathname, path || "/");
    assert.equal(redirect.search, "?q=gemma");
    assert.equal(redirect.hash, "#results");
    assert.equal(response.headers.get("x-middleware-rewrite"), null);
  }
  assert.equal(canonicalPath("/engine"), "/engine");
  assert.equal(canonicalPath("/korea"), "/korea");
});

test("/en pages are served directly rather than redirected to Korean", () => {
  for (const path of ["/en", "/en/commands/install", "/en/models/qwen3-8-27b", "/en/assistant"]) {
    const response = middleware(new NextRequest(`https://example.test${path}?q=gemma`));
    assert.equal(response.headers.get("location"), null);
    assert.equal(response.headers.get("x-middleware-rewrite"), null);
    assert.equal(response.headers.get("x-middleware-next"), "1");
  }
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

test("model JSON defaults to Korean and supports explicit English", async () => {
  const response = GET(new Request("https://example.test/api/models?id=gemma-3-4b-it"));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.locale, "ko");
  assert.match(data.models[0].summary, /[가-힣]/u);
  const english = GET(new Request("https://example.test/api/models?id=gemma-3-4b-it&locale=en"));
  assert.equal(english.status, 200);
  const englishData = await english.json();
  assert.equal(englishData.locale, "en");
  assert.doesNotMatch(englishData.models[0].summary, /[가-힣]/u);
});

test("assistant accepts both displayed languages and rejects unsupported locales", async () => {
  const request = (locale: string) => new Request("https://example.test/api/assistant", {
    method: "POST",
    body: JSON.stringify({ locale, question: "omm install", turnCount: 0 }),
  });
  assert.equal((await parseAssistantRequest(request("ko"))).ok, true);
  assert.equal((await parseAssistantRequest(request("en"))).ok, true);
  assert.equal((await parseAssistantRequest(request("fr"))).ok, false);
});
