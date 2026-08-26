import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import path from "node:path";

import {
  COMMAND_BASE,
  COMMAND_ORDER,
  COMMAND_RISK,
} from "../src/i18n/commands/base";
import { COMMANDS_EN } from "../src/i18n/commands/en";
import { COMMANDS_KO } from "../src/i18n/commands/ko";
import { getCommand } from "../src/components/commands/commands";
import { isCommandId } from "../src/lib/assistant/catalog";
import {
  explicitCommand,
  narrowCandidates,
} from "../src/lib/assistant/knowledge";

const REPO_ROOT = fileURLToPath(new URL("../", import.meta.url));
const COMMAND_ROUTES = path.join(
  REPO_ROOT,
  "src/app/[locale]/commands",
);

function sorted(values: Iterable<string>): string[] {
  return [...values].sort();
}

async function routeSlugs(): Promise<string[]> {
  const entries = await readdir(COMMAND_ROUTES, { withFileTypes: true });
  const routes: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    try {
      await readFile(path.join(COMMAND_ROUTES, entry.name, "page.tsx"));
      routes.push(entry.name);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  return routes;
}

test("command docs, locale text, risk, and routes have exact shared coverage", async () => {
  const expected = sorted(COMMAND_ORDER);
  const routes = await routeSlugs();

  assert.equal(new Set(COMMAND_ORDER).size, COMMAND_ORDER.length);
  assert.deepEqual(sorted(Object.keys(COMMAND_BASE)), expected);
  assert.deepEqual(sorted(Object.keys(COMMAND_RISK)), expected);
  assert.deepEqual(sorted(Object.keys(COMMANDS_EN)), expected);
  assert.deepEqual(sorted(Object.keys(COMMANDS_KO)), expected);
  assert.deepEqual(sorted(routes), expected);

  for (const slug of COMMAND_ORDER) {
    const page = await readFile(
      path.join(COMMAND_ROUTES, slug, "page.tsx"),
      "utf8",
    );
    assert.match(page, new RegExp(`const SLUG = ["']${slug}["'] as const;`));
    assert.match(
      page,
      new RegExp(`const PATH = ["']/commands/${slug}["'];`),
    );
  }
});

test("base records and bilingual tuple content stay aligned", () => {
  const validRisks = new Set(["inspect", "caution", "high-impact"]);

  for (const slug of COMMAND_ORDER) {
    const base = COMMAND_BASE[slug];
    assert.equal(base.slug, slug);
    assert.equal(base.href, `/commands/${slug}`);
    assert.ok(validRisks.has(COMMAND_RISK[slug]));

    for (const [locale, text] of [
      ["en", COMMANDS_EN[slug]],
      ["ko", COMMANDS_KO[slug]],
    ] as const) {
      assert.equal(
        text.optionDescriptions.length,
        base.options.length,
        `${locale}/${slug}: option descriptions`,
      );
      assert.equal(
        text.exampleCaptions.length,
        base.examples.length,
        `${locale}/${slug}: example captions`,
      );
      assert.equal(
        text.trouble.length,
        base.trouble.length,
        `${locale}/${slug}: troubleshooting entries`,
      );
      assert.equal(
        text.relatedBlurbs.length,
        base.related.length,
        `${locale}/${slug}: related blurbs`,
      );

      const assembled = getCommand(slug, locale);
      assert.equal(assembled.href, base.href);
      assert.equal(assembled.risk, COMMAND_RISK[slug]);
      assert.equal(assembled.options.length, base.options.length);
      assert.equal(assembled.examples.length, base.examples.length);
      assert.equal(assembled.trouble.length, base.trouble.length);
      assert.equal(assembled.related.length, base.related.length);
    }
  }
});

test("every internal related link resolves to a command doc", () => {
  const commandIds = new Set<string>(COMMAND_ORDER);

  for (const slug of COMMAND_ORDER) {
    for (const related of COMMAND_BASE[slug].related) {
      if (!related.internal) continue;
      assert.match(related.href, /^\/commands\/[a-z]+$/u);
      const target = related.href.slice("/commands/".length);
      assert.ok(
        commandIds.has(target),
        `${slug} links to unknown command doc ${related.href}`,
      );
    }
  }
});

test("assistant allowlist and deterministic candidates stay inside command docs", () => {
  const expected = sorted(COMMAND_ORDER);
  const probeUniverse = [
    ...Object.keys(COMMAND_BASE),
    ...Object.keys(COMMAND_RISK),
    "not-a-command",
    "relink",
    "_bg-version-check",
  ];
  const allowed = sorted(new Set(probeUniverse.filter(isCommandId)));

  assert.deepEqual(allowed, expected);
  assert.equal(isCommandId("not-a-command"), false);

  for (const slug of COMMAND_ORDER) {
    assert.equal(isCommandId(slug), true);
    assert.equal(explicitCommand(`omm ${slug}`), slug);
  }

  const commandIds = new Set<string>(COMMAND_ORDER);
  for (const [question, locale] of [
    ["install, diagnose, link, benchmark, or remove a local model", "en"],
    ["로컬 모델 설치 진단 연결 벤치마크 삭제", "ko"],
  ] as const) {
    for (const candidate of narrowCandidates(question, locale)) {
      assert.ok(commandIds.has(candidate.id));
      assert.ok(isCommandId(candidate.id));
    }
  }
});

test("known upstream-sensitive options remain represented in static docs", () => {
  const recommendOptions = COMMAND_BASE.recommend.options.map(
    (option) => option.name,
  );
  assert.ok(recommendOptions.includes("--profile"));

  const settingOptions = COMMAND_BASE.setting.options
    .map((option) => option.name)
    .join(" ");
  assert.match(settingOptions, /memory-guard/u);
  assert.match(settingOptions, /--policy/u);
  assert.match(settingOptions, /--poll-seconds/u);
  assert.match(settingOptions, /--low-memory-seconds/u);
});
