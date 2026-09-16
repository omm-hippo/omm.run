# omm.run

The bilingual official website and command reference for
[OMM](https://github.com/omm-hippo/omm). It is a Next.js application deployed
to Cloudflare Workers through OpenNext.

## Local development

```sh
npm ci
npm run dev
```

Open <http://localhost:3000>. English is served without a prefix and Korean is
served under `/ko`.

`next dev` does not initialize Cloudflare bindings, so local development does not
require Cloudflare authentication or invoke remote Workers AI. The assistant
uses its deterministic fallback without the live inference configuration.

## Command reference

`/commands` lists every command the CLI exports, and each `/commands/<name>`
page ends with a "CLI reference" section showing that command's usage line,
arguments, options and sub-commands exactly as `omm <name> --help` prints them.
A command the CLI exports but this site has no hand-written page for still gets
a reference-only page from `src/app/[locale]/commands/[name]`.

All of it renders from `src/data/commands.json`, a copy of `docs/commands.json`
in [omm-hippo/omm](https://github.com/omm-hippo/omm), which is generated there
from `src/omm/cli.py`. Do not edit the copy by hand:

```sh
npm run sync-commands   # fetch the current export and write the copy
npm run check-commands  # fail if the committed copy has drifted
```

`.github/workflows/commands-sync.yml` runs the check on every pull request and
once a day, so the site cannot quietly describe a CLI that has moved on.

## OMM AI assistant

`/assistant` and `/ko/assistant` provide a constrained OMM command selector.
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
