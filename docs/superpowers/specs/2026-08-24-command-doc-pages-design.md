# Command doc pages — design spec

GitHub issue: [omm-hippo/omm.run#6](https://github.com/omm-hippo/omm.run/issues/6)
Date: 2026-08-24

## Completion update

The original text below described the first `search`-only slice. Issue #6 is
now implemented for all six commands. The completion pass keeps the same page
template and adds:

- self-hosted, silent H.264 MP4 demos with poster images and always-visible
  text transcripts for `search`, `install`, `run`, `recommend`, `contribute`,
  and `setup`;
- a bilingual `/commands` search UI over names, summaries, use cases, examples,
  options, and troubleshooting text;
- full command-specific and global flag tables, 3–5 examples per page, localized
  related links, and source-anchored troubleshooting entries;
- a deterministic AST verifier and scheduled CI check against the current
  `omm-hippo/omm` `main`, without any runtime product-repository fetch.

The media decision therefore supersedes the earlier “no video/GIF in v1”
decision. Exact media provenance and hashes live in
`public/demos/commands/manifest.json`; synchronization behavior is documented
in `docs/command-docs-sync.md`, and current source citations live in
`design/FACTS.md`.

## Background

Each `omm` command currently gets one line in the product README. The issue
asks for a "namuwiki-style" doc page per command: what it's for, full
options, 3–5 examples, related-command links, and common errors. Full scope
is six commands (`search`, `install`, `run`, `recommend`, `contribute`,
`setup`). This spec covers the first slice only: the page template plus one
fully real command (`search`), so the pattern is proven before repeating it
five more times.

Two things the issue itself left open, resolved in this pass:
- **Demo media** — no video/GIF in v1. Reuse the site's existing pattern
  (see `guide.after.capture` on `/install/*`): a real captured terminal block
  rendered as text, not a recording.
- **Content sync with the product repo** — static, quoted content, same as
  the install guides: source strings live in `base.ts` with `file:line`
  citations back to the product repo, not a build-time or client-time fetch.
  (Client-time fetch is what `Nav.tsx`'s version badge already does for a
  single version string; per-page doc content is a different risk profile —
  stale citations are safer than a fetch that silently renders wrong prose
  if the README's structure changes. Also: recent commits on this repo have
  been actively cutting Worker request volume, so adding more runtime fetches
  cuts against that direction.)

## Source of truth for `search` content

Product repo checkout: `~/Project/Localfit` (remote `origin` =
`github.com/omm-hippo/omm`).

- Command definition, options, validation errors: `src/omm/cli.py:6293-6467`
- README one-liner: `README.md:331`, shared scripting notes: `README.md:354`,
  `README.md:401-403`
- Real captures taken 2026-08-24 on this dev machine (via the repo's own
  `.venv`, `omm search ... --no-color`):
  - `omm search qwen --limit 5` (success, mixed fit/unfit results)
  - `omm search zzzznonexistentmodelxyz` → `No models found matching '...'.`
    (exit 1)
  - `omm search qwen --provider bogus` → `--provider must be one of: curated,
    huggingface, modelscope (got 'bogus').` (exit 2)
  - `omm search qwen --skip-ms --provider modelscope` → `--skip-ms conflicts
    with --provider modelscope.` (exit 2)
  - `omm search qwen --limit 2 --json` (JSON shape)

`design/FACTS.md` gets a new section, "Command doc pages", documenting these
citations the same way the existing "Install guide pages" section does.

## Non-goals for this slice

- The other five command pages (`install`, `run`, `recommend`, `contribute`,
  `setup`) — separate follow-up passes, same pattern.
- A real search/filter UI. `/commands` is a static link list, same shape as
  `/install`'s chooser.
- A global "Docs" nav-bar entry — `DIRECTION.md` §4.1 lists one as a future
  slot, but wiring it in is out of scope while only one command page exists.
- Video/GIF hosting — deferred by design (see above).

## Routes

- `/commands` — index page. Lists all six commands. `search` links to its
  page; the other five render as inactive rows labeled "coming soon"
  (no `href`), so the page is honest about what exists without 404ing.
- `/commands/search` — the real page.

Both under `src/app/[locale]/commands/...`, following the exact structure of
`src/app/[locale]/install/...` (a shared `layout.tsx` rendering `Nav` +
`Footer`, `page.tsx` for the chooser, `search/page.tsx` for the guide).

## Content model

Mirrors `src/i18n/guides/{base,shape,en,ko}.ts` and
`src/components/install/guides.ts` exactly, in a parallel `commands/` tree
so install-guide code is untouched:

- `src/i18n/commands/base.ts` — language-independent facts per slug:
  command name, options (flag/argType/default), example command list,
  the captured terminal block (title/text/footnote), troubleshooting entries
  (verbatim `see` string + `source` file:line), related-command links
  (label + href + `internal` flag, same shape as `Footer.tsx`'s
  `DOCS_HREFS`).
- `src/i18n/commands/shape.ts` — the `CommandText<S>` type prose must satisfy,
  index-aligned to `base.ts` arrays via the same `Aligned<TBase, TText>`
  tuple trick as the install guides, so a Korean entry missing an English
  counterpart is a compile error, not a silent mismatch.
- `src/i18n/commands/en.ts`, `ko.ts` — prose: heading, lede, "what/when"
  body, one description per option, one caption per example, why/fix per
  troubleshooting entry, one blurb per related-command link.
- `src/components/commands/commands.ts` — `getCommand(slug, locale)` and
  `getCommandLinks(locale)`, assembling base + text by index, same shape as
  `getGuide`/`getGuideLinks`.

## Page sections (`/commands/search`)

Same visual scaffold as `GuidePage.tsx` — sticky breadcrumb header with
`.grid-bg`, section-number eyebrow (`01 / 06 · search`), sticky left-rail
"on this page" nav on `lg:`, `Reveal`-wrapped sections, hairline `Rows`/`Row`
lists, no cards, no shadows, 120ms `--ease-micro` transitions throughout —
reusing `SectionHead`/`Rows`/`Row`/`NoteList` conventions rather than
inventing new primitives.

01. **개요** — lede + "what it's for, when you'd reach for it" body.
02. **옵션** — table (flag, argument, default, description) as a `Rows` list,
    one row per option from `base.ts`, described in prose from `en/ko.ts`.
03. **예제** (5, basic → advanced) — `CommandBlock` (reused verbatim from
    `src/components/install/CommandBlock.tsx`, not re-implemented) for each:
    plain search → `--limit` → `--skip-unfit` → `--provider huggingface` →
    `--json | jq`.
04. **실행 예시** — the real captured `omm search qwen --limit 5` output,
    rendered with the same `<figure>`/mono-block treatment as
    `guide.after.capture` on the install pages.
05. **관련 명령어** — links to `omm install` and `omm recommend`. Neither
    page exists yet, so both point at the relevant GitHub README anchor
    (`internal: false`), exactly like `Footer.tsx`'s `DOCS_HREFS` entries do
    for not-yet-built pages. Swaps to an internal `Link` the moment those
    pages ship — same one-line change the install guides already demonstrate.
06. **자주 나는 에러** — the 3 real captured errors above, in the same
    `<dl>` (`why` / `what to do` / `source`) layout as the install guide's
    trouble section.

## Dictionary additions

New top-level keys in `en.ts`/`ko.ts` (Korean checked against English shape
via the existing `Widen<typeof en>` mechanism — no new plumbing needed):

- `commandsChooser` — mirrors `installChooser` (metaTitle, metaDescription,
  label, heading, lede).
- `commands` — mirrors `guide`: section labels, breadcrumb/aria strings,
  table column headers, `troubleWhy`/`troubleFix`/`troubleSource`,
  `elsewhere`-equivalent closing links.

## Footer change

`Footer.tsx`'s `COMMANDS` array gains one entry: `{ label: "omm search",
href: "/commands/search" }`, rendered as an internal `Link` via `localeHref`
instead of the current external-only `<a>`. The other four existing rows
(`scan`, `install`, `list`, `benchmark`, `setting`) keep pointing at GitHub
until their own pages exist. This is the smallest change that makes the new
page discoverable from every page on the site.

## Testing / verification

- `npm run build` (or the project's existing typecheck/lint scripts) must
  pass — the `Aligned<>` tuple types are the main correctness net, same as
  the install guides.
- Manual check in the dev server: `/commands`, `/commands/search`, and the
  `/ko` equivalents; footer link from the homepage; copy-button behavior on
  each example block; verify no visual regression against `/install/linux`
  as a side-by-side reference (same tokens, same spacing scale, same
  `Reveal` timing).
- Re-run the five captured `omm search ...` commands against `~/Project/Localfit`
  right before merging, to catch any drift between the captures taken during
  design and the code at merge time.
