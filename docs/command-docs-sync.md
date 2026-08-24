# Keeping command docs in sync with `omm`

The six command pages are static at runtime. The browser and Cloudflare Worker
do not fetch GitHub, so documentation traffic cannot consume product API or
Worker quota. Drift is detected before publication instead.

## Local check

Use a current local checkout of `omm-hippo/omm` and point `OMM_SOURCE_DIR` at
its repository root:

```bash
npm ci
OMM_SOURCE_DIR=/absolute/path/to/omm npm run check:issue6
```

The check does not import or execute `omm`; it parses `src/omm/cli.py` with
Python's standard-library AST. This keeps the result independent of installed
runners, credentials, network access, and optional Python packages.

`npm run check:issue6` runs four layers:

1. Localized command-search tests, including multi-field AND matching.
2. Demo asset verification for all six MP4/poster/transcript sets, including
   checked-in byte counts, SHA-256 hashes, and container signatures.
3. Focused verifier tests, including simulated added flags, removed aliases,
   capability changes, and stale citation anchors.
4. The real source comparison for `search`, `install`, `run`, `recommend`,
   `contribute`, and `setup`.

The comparison covers command arguments, command-specific options, defaults,
all four post-command global flags and aliases, automatic `--help`, whether
`--json`/`--yes` has an effect or is accepted with a warning, and every
troubleshooting entry's `file:line` plus stable `sourceAnchor`.

If the command surface changes, the command exits 1 and names the command,
parameter or option row that drifted. Update these together:

- `src/i18n/commands/base.ts` for flags, defaults, examples, messages, line
  citations, and source anchors.
- `src/i18n/commands/en.ts` and `src/i18n/commands/ko.ts` for the aligned option
  descriptions or troubleshooting guidance.
- `design/FACTS.md` when provenance or capture notes changed.

`OMM_SOURCE_DIR` is required on purpose. The verifier never guesses a checkout
and never downloads source. CI explicitly checks out `omm-hippo/omm` at
`refs/heads/main`; each job therefore verifies one resolved commit and prints
its short SHA. A daily scheduled run catches upstream drift even when this site
has no new pull request.
