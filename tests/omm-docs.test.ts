import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderToStaticMarkup } from "react-dom/server";

import { OmmDocsSectionMissing } from "../src/lib/omm-docs/errors";
import { extractSection } from "../src/lib/omm-docs/section";
import { renderMarkdown } from "../src/lib/omm-docs/markdown";

const REPO_ROOT = fileURLToPath(new URL("../", import.meta.url));
const DOCS_ROUTES = path.join(REPO_ROOT, "src/app/[locale]/docs");
const README_URL =
  "https://raw.githubusercontent.com/omm-hippo/omm/main/README.md";

/** slug → README heading. `readme` renders the whole file, so no heading. */
const PAGES: Record<string, string | null> = {
  readme: null,
  "supported-platforms": "Supported platforms",
  "storage-location": "Storage location",
  scripting: "Scripting",
};

const SAMPLE = `# Title

Intro paragraph with \`code\` and **bold** and a [repo link](CONTRIBUTING.md).

## First

- one
- two
  - nested

## Second

\`\`\`sh
# this hash is not a heading
echo hi
\`\`\`

> [!NOTE]
> An admonition.

| A | B |
|---|---|
| 1 | 2 |

### Second child

Text.

## Third
`;

test("extractSection keeps nested subheadings and stops at the next sibling", () => {
  const second = extractSection(SAMPLE, "Second");
  assert.match(second, /^## Second/);
  assert.ok(second.includes("### Second child"));
  assert.ok(second.includes("echo hi"));
  assert.ok(!second.includes("## Third"));
  assert.ok(!second.includes("## First"));
});

test("extractSection ignores hashes inside fenced code", () => {
  const second = extractSection(SAMPLE, "Second");
  // The `# this hash is not a heading` line must not have cut the section short.
  assert.ok(second.includes("echo hi"));
});

test("extractSection runs a section to end of document", () => {
  const third = extractSection(SAMPLE, "Third");
  assert.equal(third, "## Third");
});

test("extractSection is case-insensitive and trims", () => {
  assert.ok(extractSection(SAMPLE, "  first  ").startsWith("## First"));
});

test("extractSection throws OmmDocsSectionMissing when absent", () => {
  assert.throws(
    () => extractSection(SAMPLE, "Nope"),
    (error: unknown) => error instanceof OmmDocsSectionMissing,
  );
});

test("renderMarkdown renders every handled token without throwing", () => {
  const html = renderToStaticMarkup(renderMarkdown(SAMPLE));
  assert.ok(html.includes("<h2"));
  assert.ok(html.includes("<h3"));
  assert.ok(html.includes("<ul"));
  assert.ok(!html.includes("<ol")); // sample has no ordered list
  assert.ok(html.includes("<pre"));
  assert.ok(html.includes("<table"));
  assert.ok(html.includes("<blockquote"));
  assert.ok(html.includes("NOTE")); // admonition label
  assert.ok(html.includes("github.com/omm-hippo/omm/blob/main/CONTRIBUTING.md"));
});

test("renderMarkdown skipLeadingHeading drops only the first heading", () => {
  const html = renderToStaticMarkup(
    renderMarkdown(SAMPLE, { skipLeadingHeading: true }),
  );
  assert.ok(!html.includes(">Title<"));
  assert.ok(html.includes(">First<"));
});

test("renderMarkdown drops shields.io badge paragraphs", () => {
  const md = "![build](https://img.shields.io/badge/x-y-blue.svg)\n\nReal text.";
  const html = renderToStaticMarkup(renderMarkdown(md));
  assert.ok(!html.includes("img.shields.io"));
  assert.ok(html.includes("Real text."));
});

test("every /docs route directory has a page and a dictionary entry", async () => {
  const entries = await readdir(DOCS_ROUTES, { withFileTypes: true });
  const slugs = new Set<string>();
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    await readFile(path.join(DOCS_ROUTES, entry.name, "page.tsx"));
    slugs.add(entry.name);
  }

  assert.deepEqual([...slugs].sort(), Object.keys(PAGES).sort());

  const en = await readFile(
    path.join(REPO_ROOT, "src/i18n/dictionaries/en.ts"),
    "utf8",
  );
  const ko = await readFile(
    path.join(REPO_ROOT, "src/i18n/dictionaries/ko.ts"),
    "utf8",
  );
  for (const slug of slugs) {
    const key = slug.includes("-") ? `"${slug}"` : slug;
    assert.ok(en.includes(`${key}: {`), `en.ts missing docs.pages.${slug}`);
    assert.ok(ko.includes(`${key}: {`), `ko.ts missing docs.pages.${slug}`);
  }
});

test(
  "the live omm README still has the sections the pages slice",
  { skip: process.env.OMM_SKIP_NETWORK_TESTS ? "network disabled" : false },
  async () => {
    const response = await fetch(README_URL);
    assert.ok(response.ok, `README fetch: HTTP ${response.status}`);
    const readme = await response.text();

    for (const [slug, heading] of Object.entries(PAGES)) {
      if (!heading) continue;
      assert.doesNotThrow(
        () => extractSection(readme, heading),
        `README "${heading}" section gone — /docs/${slug} would show the fallback`,
      );
    }
  },
);
