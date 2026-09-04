# omm docs mirror — design spec

Date: 2026-09-04

## Background

The Footer's "Docs" column links four README anchors straight to GitHub:
`#readme`, `#supported-platforms`, `#storage-location`, `#scripting`. GitHub's
rendered README is off-brand, and the user wants styled on-site pages that
still track the README automatically — when a section changes upstream, the
page reflects it without a redeploy.

This supersedes, for these four pages only, the "no runtime fetch for doc
content" stance in `2026-08-24-command-doc-pages-design.md`. That spec's two
concerns are addressed here:

1. **Structure drift** (a heading rename silently rendering wrong prose) — a
   network-gated test asserts the four target headings still resolve, and a
   missing section renders a fallback panel, never wrong content.
2. **Worker request volume** — a `caches.default` layer holds the README for
   an hour per colo, so steady state is at most one GitHub subrequest per
   colo per hour, not one per page view.

## Scope

Four pages under `/[locale]/docs/`:

| Route | Body |
|---|---|
| `/docs/readme` | full README |
| `/docs/supported-platforms` | `### Supported platforms` section |
| `/docs/storage-location` | `### Storage location` section |
| `/docs/scripting` | `### Scripting` section |

The Footer's four external anchors become internal `next/link`s to these
routes.

**Out of scope:** the Footer's `wiki/Compatible-Programs` link (the wiki is
disabled upstream — dead link, tracked separately), a top-nav entry, a
`/docs` index page.

## Content source and sync

`src/lib/omm-docs/source.ts`

- `README_URL = https://raw.githubusercontent.com/omm-hippo/omm/main/README.md`
- `fetchReadme(): Promise<string>` — reads `caches.default` first (key: a
  `Request(README_URL)`); on miss, `fetch(README_URL, { cache: "no-store" })`,
  then `ctx.waitUntil(cache.put(...))` with `cache-control: s-maxage=3600`.
  Non-2xx or a fetch throw raises `OmmDocsUnavailable`.
- No Cloudflare context (local `next dev`, tests): skip the cache, fetch
  direct.
- Wrapped in React `cache()` so the readme page's own render doesn't double
  fetch.

Pages render dynamically (`export const dynamic = "force-dynamic"`) because
the OpenNext static-assets incremental cache is build-time only — time-based
`revalidate` and `revalidateTag` do nothing at runtime on this deploy, so a
"static with ISR" page would freeze at build content. These are low-traffic
docs routes; the per-request Worker invocation is acceptable.

`src/app/api/omm-docs/refresh/route.ts`

- `POST`, `Authorization: Bearer <OMM_DOCS_REFRESH_TOKEN>`.
- Deletes the `caches.default` entry, returns `{ purged: boolean }`.
- `401` on a bad/absent token; `501` when `OMM_DOCS_REFRESH_TOKEN` is unset in
  the environment (feature not provisioned — the hourly fallback still
  covers sync).
- `caches.default` is per-colo, so a purge clears the colo that served the
  request; other colos refresh within the hour. Near-instant where the
  traffic is, one hour worst case.

**omm repo GitHub Action** (applied separately, in `omm-hippo/omm`): on a
push to `main` that touches `README.md`, `curl -X POST` the refresh route
with the shared token. Documented in this spec; not part of this repo's PR.

**Failure mode:** `OmmDocsUnavailable` or `OmmDocsSectionMissing` thrown
during render → the page shows its chrome (nav, heading, breadcrumb) plus a
fallback panel linking to the GitHub source. Never a 500.

## Markdown rendering

Add `marked` (`^18`) as a dependency. It is imported only from server modules
(`src/lib/omm-docs/*`, RSC pages), so it is tree-shaken out of the client
bundle.

`src/lib/omm-docs/markdown.tsx`

- `renderMarkdown(md: string): ReactNode` — walks `marked.lexer(md)` tokens
  and maps each to a React element styled with the site's design tokens. No
  `dangerouslySetInnerHTML`.
- Token coverage: `heading` (h1→`text-h2`, h2→`text-h2`, h3→`text-h3`,
  h4+→bold `text-small`), `paragraph`, `list` + `list_item` (ordered,
  unordered, nested), `code` (fenced → bordered `bg-bg-1` block, `text-terminal`,
  `overflow-x-auto`), `codespan`, `blockquote` including GitHub admonitions
  (`[!NOTE]` / `[!WARNING]` / …), `table` (hairline-ruled, wrapped in an
  `overflow-x-auto` container), `link`, `strong`, `em`, `del`, `hr`, `br`,
  `text`, `escape`, `space`.
- `image`: shields.io / badge images are dropped; any other image renders at
  intrinsic size with `loading="lazy"`.
- `link`: relative (`LICENSE`, `#usage`, `PRIVACY.md`) → resolved against the
  repo blob URL; `omm.run` / `www.omm.run` absolute links → `next/link` to
  the local path; everything else → `<a target="_blank" rel="noreferrer">`.
- `html` token: pass through only `<details>` / `<summary>` (used in the
  README's `fetchCache` note); drop any other raw HTML.
- Unknown / unhandled token → render `token.raw` as plain text. Never throws
  on an unexpected token.

`extractSection(md: string, heading: string): string`

- Finds the first line matching `^#{1,6}\s+<heading>\s*$` (case-insensitive,
  trimmed), returns everything from that heading up to the next heading of
  equal-or-higher level (or EOF).
- Throws `OmmDocsSectionMissing` if the heading is not found.

## Pages and components

- `src/app/[locale]/docs/layout.tsx` — `Nav` + `Footer` wrapper with the
  `isLocale` guard, mirroring `src/app/[locale]/commands/layout.tsx`.
- `src/components/docs/DocPage.tsx` — shared shell: `.grid-bg` header with a
  breadcrumb (`omm / docs / <slug>`), `<h1>` and lede from the dictionary, a
  `text-label` line "Synced from raw.githubusercontent.com", then the
  rendered body in a reading-width column (`max-w-[72ch]`; the full README
  page gets `max-w-page`). Footer link: "View source on GitHub".
- `src/components/docs/DocFallback.tsx` — the unavailable-state panel.
- `src/components/docs/DocBody.tsx` — server component: `await fetchReadme()`,
  `extractSection` when a `section` prop is given, `renderMarkdown`, wrapped
  by the caller in `<Suspense>`; catches the two doc errors and renders
  `DocFallback`.
- Four `page.tsx` files under `src/app/[locale]/docs/<slug>/` (explicit
  directories, matching the `commands/` pattern — no dynamic segment).
  Each: `generateMetadata` from the dictionary, `dynamic = "force-dynamic"`,
  body in `<Suspense fallback={<DocSkeleton />}>`.

## i18n

- `dictionaries/en.ts` + `ko.ts`: a new `docs` key —
  `breadcrumbAria`, `syncedFrom` (`"Synced from {source}"`), `sourceLink`,
  `unavailable` (`{ title, body }`), and a `pages` record keyed by slug with
  `metaTitle`, `metaDescription`, `heading`, `lede`.
- Footer: `DOCS_HREFS` entries 4–7 flip to `{ href: "/docs/…", internal: true }`;
  the `t.footer.docs.links` labels are unchanged.
- Rendered body text stays English in both locales; only the page chrome is
  translated.

## Tests

`tests/omm-docs.test.ts`

- `extractSection` — fixture markdown: nested subheadings kept, section that
  runs to EOF, sibling `##` stops an `##` section, missing heading throws.
- `renderMarkdown` — a fixture exercising every handled token renders via
  `react-dom/server` `renderToStaticMarkup` without throwing; spot-check that
  a table produces `<table>`, a fenced block produces `<pre>`, an admonition
  is labelled.
- Live guard (network-gated, skipped when `OMM_SKIP_NETWORK_TESTS` is set):
  fetch the real README, assert `extractSection` resolves for the three
  section slugs.
- Route-directory ↔ slug-list consistency, mirroring
  `tests/command-docs-sync.test.ts`.

`package.json` `test` script already globs `tests/*.test.ts`.

## Infra

- No `wrangler.jsonc` change — `caches.default` is ambient in the Workers
  runtime.
- New Worker secret `OMM_DOCS_REFRESH_TOKEN` (`wrangler secret put
  OMM_DOCS_REFRESH_TOKEN`). Absent → the refresh route returns `501` and the
  hourly cache expiry is the only sync path.
