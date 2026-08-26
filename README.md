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

## Command assistant

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

To compare the website command manifest against a trusted current local OMM
checkout without network access:

```sh
OMM_SOURCE_DIR=/path/to/omm npm run check:omm-sync
```

`npm run deploy` changes the Cloudflare account and production Worker. Do not
run it without explicit deployment approval.
