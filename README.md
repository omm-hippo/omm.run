# omm.run

The bilingual official website and command reference for
[OMM](https://github.com/omm-hippo/omm). It is a Next.js application deployed
to Cloudflare Workers through OpenNext.

## Local development

```sh
npm ci
npm run dev
```

Open <http://localhost:3000>. Korean is served without a language prefix;
English is served under `/en` (for example, `/en/commands`). Legacy `/ko` URLs
redirect to the same unprefixed Korean page, preserving query strings. Language
controls switch between the same Korean and English page while preserving the
query and fragment. Unprefixed GET requests may redirect to English according
to the saved language choice, browser language or region; crawlers use Korean.

`next dev` does not initialize Cloudflare bindings, so local development does not
require Cloudflare authentication or invoke remote Workers AI. The assistant
uses its deterministic fallback without the live inference configuration.

## Site sections and future Notion links

The primary navigation has five destinations: overview (`/`), use cases
(`/use-cases`), models (`/models`), documentation (`/docs`) and news (`/news`).
The same structure is available under `/en`. Existing model, command,
installation and synced-document URLs remain available. Installation commands
now live at `/install#quick-install`; the old home `#install` anchor offers a
direct link to that page. FAQ and troubleshooting have their own documentation
pages. The five use-case guides link back to the existing command reference.

Notion is optional further reading. There is no Notion authentication, API call,
account dependency or automatic content import. Keep core installation and
command instructions on this site. To connect the future `omm.hippo` workspace:

1. Create a public **OMM 안내서** page, keeping private drafts outside its tree.
2. Create the articles below. Each should include its audience, applicable OMM
   version, last checked date, requirements, a concrete example and source links.
3. Publish the intended pages and verify each public URL while logged out.
4. Set `hubUrl` and the relevant article `url` values in
   `src/data/notion-publications.json`, then rebuild and review the site.
   Null or invalid URLs render no link, title, placeholder or empty article list.
   HTTPS links on `notion.site` and `notion.so` are accepted; custom domains need
   an explicit allowlist update. URL shape validation does not prove publication
   or logged-out access. Public links do not require an integration token.

| Article ID | Page to prepare | Main content |
| --- | --- | --- |
| `why-omm` | OMM은 어떤 문제를 해결하나요? | Intended users, one before/after workflow, OMM's role |
| `choosing-models` | 내 컴퓨터에 맞는 모델 고르기 | RAM, task, file size, memory fit and a real quality check |
| `runners-and-omm` | Ollama·LM Studio와 함께 쓰기 | App roles, model connection, local API setup and screenshots |
| `document-search` | 내 문서에서 답변의 근거 찾기 | A non-private sample file, indexing, query and checked source passage |
| `mac-cluster` | 여러 Mac을 연결하기 전에 알아둘 것 | Requirements, device roles, network setup and measured limits |
| `dev-notes` | OMM 개발 노트 | Dated changes, reasons, release links and unverified work |

Configured articles appear on `/news` and matching use-case pages. Publishing
edits in Notion updates the Notion page; it does not replace site copy. No links
are configured until the owner supplies published URLs. Do not infer a public
URL from the account or workspace name.

## Command reference

`/commands` lists every command the CLI exports, and each `/commands/<name>`
page ends with a "CLI reference" section showing that command's usage line,
arguments, options and sub-commands exactly as `omm <name> --help` prints them.
A command the CLI exports but this site has no hand-written page for still gets
a reference-only page from `src/app/[locale]/commands/[name]`.

Nested groups and their descendants share the top-level page. CLI help links
such as `/commands/setting#agent` remain valid; deeper entries also have unique
anchors such as `#agent-local`. The retired `/commands/compare` route redirects
permanently to `/commands/info` in both languages.

All of it renders from `src/data/commands.json`, a copy of `docs/commands.json`
in [omm-hippo/omm](https://github.com/omm-hippo/omm), which is generated there
from `src/omm/cli.py`. Do not edit the copy by hand:

```sh
npm run sync-commands   # fetch the current export and write the copy
npm run check-commands  # fail if the committed copy has drifted

# Or compare against a trusted, pinned local product checkout without fetching:
OMM_SOURCE_DIR=/path/to/omm npm run check-commands
```

`.github/workflows/commands-sync.yml` runs the check on every pull request and
once a day, so the site cannot quietly describe a CLI that has moved on.

## OMM AI assistant

`/assistant` and `/en/assistant` provide a constrained OMM command selector.
Cloudflare Workers AI can choose only an allowlisted command ID; all commands,
options, examples, risks, and links are rendered from the existing static OMM
command docs.

The Workers AI binding is declared in `wrangler.jsonc`. Live inference also
requires an approved D1 `ASSISTANT_DB` binding and a server-side
`ASSISTANT_HASH_SALT`; without both, the route fails closed to deterministic
search. See [the backend contract](docs/assistant-backend.md) before configuring
or deploying it.

## Verification

```sh
npm test
npm run lint
npx next typegen
npx tsc --noEmit
npm run build
```

`npm run build` runs the Next.js build once through OpenNext and produces the
Cloudflare Worker bundle in `.open-next/`.

Pull requests and pushes to `main` run tests, lint, type checking and the Worker
build in GitHub Actions. The workflow uses no Cloudflare credentials and does
not deploy or call Workers AI.

The navigation badge reads the published `omm-model` version from PyPI. It is
hidden if that request fails; the development version on GitHub `main` is not
presented as a release. The footer commit is embedded at build time from
Cloudflare Workers/Pages, GitHub Actions, Vercel, or the local Git checkout.

To compare the website command manifest against a trusted current local OMM
checkout without network access:

```sh
OMM_SOURCE_DIR=/path/to/omm npm run check:omm-sync
```

`npm run deploy` changes the Cloudflare account and production Worker. Do not
run it without explicit deployment approval.

The `undici` override pins the patched 7.30.1 release for Miniflare's HTTP
client. Keep it within major version 7 until Wrangler updates its pinned
transitive dependency, then reassess the override with a fresh audit and local
Worker verification.
The scoped `@node-minify/core` override selects glob 10.5.0 while leaving the
adapter's own glob dependency on its supported major version.
