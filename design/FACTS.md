# Verified product facts — the only allowed source of numbers/claims

Source of truth: `D:\Desktop\오픈소스 개발자 프로젝트\omm-hippo\README.md` (read it for anything not listed here) and real command captures below. DIRECTION.md §4.2's terminal sequence used INVENTED numbers — do NOT use those. Use the real capture + real output formats from omm source code instead.

## One-liner
apt/brew-style package manager for local LLMs (GGUF). Installs models into a central hub, links them into seven local AI runners automatically, recommends models that fit your hardware.

## The 7 runners + automation coverage
| Runner | Automated on | Manual elsewhere |
|---|---|---|
| Ollama | macOS, Linux, Windows | — |
| LM Studio | macOS, Linux, Windows (headless `lms` CLI) | — |
| Jan | macOS (Homebrew), Windows (winget), Linux (Flatpak) | wherever that package manager isn't installed |
| AnythingLLM | macOS (Homebrew) | Windows, Linux |
| Msty | macOS (Homebrew) | Windows, Linux |
| KoboldCpp | macOS (Apple Silicon), Linux (x86_64), Windows (x86_64) | Intel Mac, other architectures |
| text-generation-webui | macOS (any arch), Linux/Windows (x86_64) | ARM Linux/Windows |

Source: `linker.has_automated_installer()` (`src/omm/linker.py:1893-1932`) plus the
per-engine gates it reads — not the README table, which was stale for AnythingLLM
(see "Known README/script divergences" below). Rendered by `Runners.tsx` and by the
per-OS install guides, which now agree row for row. Two rows are narrower than the
README's wording: AnythingLLM is `platform.system() == "Darwin"` only, and KoboldCpp
on Windows is `("Windows", "AMD64")`, so ARM Windows is manual. The section's label
reads `7 runners · 3 platforms`; neither number is a cell count, so it is unaffected.

## Real `omm scan --no-color` capture (2026-08-19, this dev machine)
```
                      omm hardware scan
┌───────────────────────┬───────────────────────────────────┐
│ Field                 │ Value                             │
├───────────────────────┼───────────────────────────────────┤
│ OS                    │ Windows 11                        │
│ CPU                   │ Intel(R) Core(TM) Ultra 7 155H    │
│ RAM (total)           │ 15.5 GB                           │
│ RAM (available)       │ 0.7 GB                            │
│ Safe model budget now │ 0.0 GB                            │
│ Reserved for apps/OS  │ 1.6 GB+                           │
│ GPU                   │ Intel(R) Arc(TM) Graphics         │
│ VRAM                  │ Shared or unavailable from the OS │
└───────────────────────┴───────────────────────────────────┘

  Local AI runners
 Program  Status
 Ollama   installed
+ 6 program(s) not installed — see the compatibility list:
https://github.com/omm-hippo/omm/wiki/Compatible-Programs
```
Note: "RAM available 0.7 GB" was captured under heavy load — if the demo needs a scan where a model fits, re-derive numbers from the real format above but keep CPU/GPU/OS/total-RAM identical, and available/budget plausible for this machine (e.g. available 9.8 GB, safe budget 8.2 GB). Format authenticity > this particular snapshot.

Sanctioned demo state (runner detection): the capture machine had only Ollama installed, but the hero terminal shows **Ollama + LM Studio + Jan detected** and `+ 4 program(s) not installed`. This is a sanctioned demo state, not a captured one: the site needs a machine where the link story is visible, and the three-runner state is internally consistent everywhere it propagates — `omm scan`, the `omm install` link summary, the `Links` column of `omm list`, and the accent connectors + legend of the link diagram all report the same three runners. CPU/GPU/OS/total-RAM stay the real captured values; only detection state is re-derived, exactly as available/budget are above. Provenance: orchestrator ruling, 2026-08-19.

## Model file size (build-time API, not a capture)
`mistral-7b-instruct-v0.2.Q4_K_M.gguf = 4,368,439,584 bytes` (HF API, `TheBloke/Mistral-7B-Instruct-v0.2-GGUF` tree, retrieved 2026-08-19) `= 4.37 GB decimal = 4.07 GiB`.
`hub.py` `CURATED_INDEX` stores only `(repo_id, filename)`, so this line is the sole source for every size on the page. The terminal's `omm list` row prints `4.07` under a `GB` label because `cli.py:4369-4375` divides by `1024**3` and labels the unit `GB` — a real upstream defect, reproduced deliberately and captioned under the terminal window.

For `omm install` / `omm list` output formats: read the actual omm source (`omm-hippo/src/`) — grep for the progress/link/done strings and reproduce that real format. Do not invent a format.

## Verified claims (README line refs)
- Localfit safe budget: live scan subtracts memory used by other apps, keeps at least 1 GB (code: `hardware.py` `RAM_SAFETY_RESERVE_MIN_GB=1.0`, used as `max(1.0, total*0.10)`; README says 2 GB — stale, upstream fix filed) or 10% of RAM for the OS, applies total-memory caps; rerunning adapts. (README ~145-149)
- Benchmark: versioned eight-item bilingual arithmetic smoke pack, Ollama only, stores no generated text, median of repeated samples, "intentionally small and is not a leaderboard". (README ~151-158)
- Signed catalogs: `omm setting catalog-trust` enables Ed25519 verification for recommendation downloads; artifacts snapshotted before replacement; `omm setting catalog-rollback` restores. (README ~238-239)
- Installers: versioned staging clone, verify signed commit against bootstrap trust anchor, then switch pipx. (README ~30)
- Install commands (verbatim from README):
  - macOS/Linux: `curl -fsSL https://omm.run/install.sh | sh`
  - Windows: `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; irm https://omm.run/install.ps1 | iex`
  - Windows caveat verbatim: "This must run before irm: script-internal TLS settings are too late for its first download."
  - Both: open a new shell afterward so PATH picks up `omm`. Requires Python 3.10+.
- License: MIT. Repo: github.com/omm-hippo/omm. CLI aliases: rm/ls/up. Exit codes 0/1/2. `--json` safe to pipe.
- Windows link strategy: hard link first, then symlink (Dev Mode/Admin), then owned copy with free-space check.
- Uninstall preserves models/settings; `--purge` removes hub too.

## Korean locale (`/ko`)

The Korean pages are a **translation of the English pages at `975faf4`**, nothing
more. No claim, number, command, coverage row or error message exists in Korean
that does not exist in English at that commit; this whole document therefore
governs `/ko` exactly as it governs `/`. Adding a fact to Korean without adding
it to English (and to this file) is the same violation as inventing one.

What is deliberately **not** translated, because the reader will see it in
English on their own screen: every command and flag, environment variables and
file paths, the verbatim installer/uninstaller/shell messages (the `see` field),
the `source` citations, `omm scan` field names, product and runner names, the
captured terminal output, and the mono coverage chips
(`macOS` / `Linux` / `Windows`, `winget`, `Homebrew`, `x86_64`, …).

One exception: a `see` entry that describes an absence rather than quoting a
printed message ("Nothing at all. The command returns immediately…") is
translated, because there is no English string on screen for it to match.

## Banned
Any number not traceable to the README, a real capture, or build-time API. Any claim about user counts, stars ("10,000+ developers"), speed multipliers, or rankings.

## Install guide pages (`/install`, `/install/windows|macos|linux`)

Source of truth for these three pages is the omm product repo at
`D:\Desktop\오픈소스 개발자 프로젝트\omm-hippo`. Content lives in
`src/i18n/guides/` — `base.ts` for everything language-independent (commands,
prompt samples, captured output, the verbatim messages and their file:line),
`en.ts` / `ko.ts` for prose — and is assembled by
`src/components/install/guides.ts`; every string below is quoted, not
paraphrased.
Line numbers are as of 2026-08-21 (`pyproject.toml` version `0.2.124`).

### README revision this content tracks
The README's install section was rewritten per-OS in omm-hippo PR #157
(`origin/main` at `316f37e`), and now links back to these three pages. Line
numbers below are against that revision.

### Alternative install routes
- **Homebrew Tap (macOS only)** — `brew install omm-hippo/omm/omm`,
  `brew upgrade omm-hippo/omm/omm`, `brew uninstall omm-hippo/omm/omm`, all
  verbatim from README "### macOS" step 5 "Homebrew Tap (alternative)"
  (README ~81-98). The three notes on the macOS guide are that section's own
  wording: removing the formula "preserves downloaded models and settings under
  `OMM_HOME`"; "The Homebrew formula and PyPI package can move on separate
  release schedules; use `brew info omm-hippo/omm/omm` to see the version
  currently provided by the Tap"; "`omm update` does not modify a Homebrew
  installation and instead prints the matching `brew upgrade` command". Shown
  on the macOS guide and on the landing page's macOS/Linux tab only — the Tap
  is a macOS route, and README lists it under "### macOS".
- **PyPI / pipx (any OS)** — `python -m pip install omm-model`,
  `pipx install omm-model`, plus the upgrade/uninstall pairs, from README
  "### Any OS via PyPI or pipx" (~165-195), including "This does not go through
  the signed-commit verification described below; it relies on PyPI's own
  account security and TLS, the same trust model as installing any other PyPI
  package", "The distribution name is `omm-model`; the installed command and
  Python import remain `omm`", and "Both commands preserve downloaded models
  and settings under `OMM_HOME`". Shown on both landing-page tabs and on all
  three guides.
- **winget is deliberately absent.** There is no `winget install` command for
  omm itself anywhere in the README — the only `winget` mentions are the
  installer's own Python/git bootstrap (README ~19), the troubleshooting row
  for older Windows (~216), and Jan's runner entry (~253). Packaging omm for
  winget is omm-hippo issue #88 and still open, so no winget install block may
  appear on the site until a command exists to quote.

### Dependency links (per-OS guides, and one line under the landing-page tabs)
Both URLs are the ones the README itself links: `https://www.python.org/downloads/`
and `https://git-scm.com/downloads` (README ~19 for Windows, ~66 for macOS,
~126 for Linux). The Windows `winget` requirement row links README ~19's
`https://learn.microsoft.com/en-us/windows/package-manager/winget/`, and the
macOS Python row adds `https://brew.sh`, since README ~66 offers Homebrew as
the alternative Python source. The macOS guide has no "NVIDIA extra"
requirement row: the optional detector is gated on `nvidia-smi`, which no
current Mac reports, so the row was dropped there and kept on Windows and Linux.

### README sections used
- **Install** — the two Git-source commands, the Windows TLS caveat verbatim,
  the PyPI/pipx commands, "The distribution name is `omm-model`; the installed
  command and Python import remain `omm`", the upgrade/remove commands, the
  winget note ("built into Windows 10 2004+ and Windows 11 — on older Windows,
  install Python 3.10+ and git manually first"), the Windows link strategy
  (hard link → symlink under Developer Mode/Administrator → owned copy with a
  free-space check; junctions do not apply because targets are files), and
  "Requirements: Python 3.10+".
- **Supported platforms** — Windows 10 22H2/11 baseline "because that matches
  Ollama's native Windows requirements"; the three installer steps; the
  `omm update` / beta-channel restriction for package-managed installs.
- **Local AI runners** — the first-bare-`omm` setup wizard (hardware summary +
  runner checklist, unautomated runners print a link), and "Every
  currently-installed runner is also listed … marked as already installed".
- **Storage location** — `OMM_HOME` defaults to `~/.omm`; the PowerShell and
  `export` snippets verbatim; `OLLAMA_MODELS`; `OMM_LMSTUDIO_MODELS_DIR`.
- **Completion and uninstall** — `omm --install-completion powershell|bash`
  (zsh/fish), the two uninstall one-liners, `-Purge`/`--purge`, "Purge removes
  only known omm-owned paths…", "shell profiles are never rewritten during
  uninstall", and the pip/pipx uninstall commands.
- **Scripting / benchmark** — Ollama-first HTTP detection on Windows.

### Troubleshooting entries → the line that prints them
Windows page:
| Message | Source |
|---|---|
| `sh : The term 'sh' is not recognized…` | PowerShell built-in; the fix cites README Install (two distinct commands) |
| `Windows detected. Run the native PowerShell installer instead:` | `install.sh:29-30` (guard at `install.sh:27-32`) |
| `'irm' is not recognized as an internal or external command…` | cmd.exe built-in; fix cites README (command is PowerShell-only) |
| `Could not create SSL/TLS secure channel` | `install.ps1:1-5` header comment; README Windows caveat |
| `Python not found. Install Python 3.10+ first: …` | `install.ps1:217` |
| `git not found. Install git first …` | `install.ps1:229`, `install.ps1:234` |
| `git 2.34+ is required to verify SSH commit signatures (found …)` | `install.ps1:105` |
| `Signature verification failed - refusing to install untrusted code.` | `install.ps1:553` |
| `git clone failed.` | `install.ps1:529` |
| `Refusing to replace unrelated pipx environment 'omm'…` | `install.ps1:506` |
| `Refusing to replace an unverified omm-model pipx environment.` | `install.ps1:514` |
| `Refusing unsafe OMM_HOME:` / `Refusing OMM_HOME that contains the current directory:` | `install.ps1:13`, `install.ps1:18` |
| `omm : The term 'omm' is not recognized…` (PATH) | fix quoted from `install.ps1:671` |
| `Refusing unrecognized custom OMM_HOME (missing .omm-managed):` | `uninstall.ps1:21` |

macOS / Linux pages:
| Message | Source |
|---|---|
| silent `curl -fsSL` failure | the `-f`/`-s` flags in the README command itself |
| `Python 3.10+ not found: https://www.python.org/downloads/` | `install.sh:135` (apt bootstrap at `install.sh:122-125`) |
| `git not found. Install git first (needed to fetch omm from GitHub).` | `install.sh:148` (apt bootstrap at `install.sh:141-145`) |
| `python3-venv not found (needed by pipx), installing it via apt...` | `install.sh:152-155` |
| `git 2.34+ is required to verify SSH commit signatures (found …)` | `install.sh:81` |
| `Signature verification failed - refusing to install untrusted code.` | `install.sh:396` |
| `Could not inspect existing pipx environments; refusing an unsafe migration.` | `install.sh:343` |
| `Refusing to replace unrelated pipx environment 'omm'…` | `install.sh:351` |
| `Refusing to replace an unverified omm-model pipx environment.` | `install.sh:361` |
| `command not found: omm` (PATH) | fix quoted from `install.sh:508` |
| `Refusing non-absolute OMM_HOME:` / `Refusing unsafe OMM_HOME:` | `install.sh:11`, `install.sh:14` |
| `error: externally-managed-environment` (PEP 668) | `install.sh:327-336` — the script already retries with `--break-system-packages` |
| `Homebrew not found - install manually from …` | `src/omm/linker.py:2104-2108` |
| `flatpak not found - install manually from https://jan.ai/download` | `src/omm/linker.py:2116-2121` |
| `Refusing unrecognized custom OMM_HOME (missing .omm-managed):` | `uninstall.sh:42` |

### Per-OS runner coverage: the code, not the README table
The guide pages list what `linker.has_automated_installer()` actually returns on
each platform (`src/omm/linker.py:1893-1932`), because that function is the
single source of truth for whether the setup wizard offers to install a runner:
- `ollama`, `lmstudio`, `jan` — every platform (`linker.py:1910-1915`); Jan via
  brew cask / winget `Jan.Jan` / flatpak `ai.jan.Jan` (`linker.py:2142-2152`),
  and the wizard reports "<manager> not found" when that manager is absent
  (`linker.py:2102-2125`).
- `anythingllm` — `platform.system() == "Darwin"` only (`linker.py:1916-1923`).
- `mstystudio` — `Darwin` only (`linker.py:1924-1927`, `2187-2191`).
- `koboldcpp` — `_KOBOLDCPP_ASSET_BY_PLATFORM` = `(Darwin, arm64)`,
  `(Linux, x86_64)`, `(Windows, AMD64)` (`linker.py:2202-2206`).
- `textgenwebui` — Darwin any arch; Windows/Linux x86_64 only
  (`linker.py:2285-2296`).

### Known README/script divergences (script wins on the guide pages)
1. **README says `install.sh` bootstraps via "apt on Debian/Ubuntu or Homebrew
   on macOS".** `install.sh` has no Homebrew bootstrap at all — only `run_apt`
   (`install.sh:105-155`); the sole `brew` mention is the PEP-668 comment at
   `install.sh:332`. On macOS and on non-apt Linux the script checks and exits
   with `Python 3.10+ not found` / `git not found`. `pipx` is bootstrapped with
   `"$PY" -m pip install --user --quiet pipx`, falling back to
   `--break-system-packages`, then `pipx ensurepath` (`install.sh:327-338`).
   The landing page's Install tab footnote was corrected to match. README PR
   #157 carries the same correction upstream.
2. **README's runner table listed AnythingLLM as automated on "Windows
   (winget)".** `linker.py:1916-1923` returns Darwin-only and documents why:
   the `MintplexLabs.AnythingLLM` manifest was withdrawn from winget-pkgs on
   2025-02-18 (microsoft/winget-pkgs#230632) and re-verified absent 2026-08-19.
   Msty is likewise brew-cask-only (`linker.py:2187-2191`). Resolved: the
   README is being corrected upstream, and the landing page's `Runners.tsx`
   now renders the code-derived coverage above instead of the README table, so
   the section and the three install guides agree. KoboldCpp's Windows chip
   gained an `x86_64` note in the same pass, from
   `_KOBOLDCPP_ASSET_BY_PLATFORM` (`linker.py:2202-2206`).

### Numbers on these pages
The only capture reproduced is the existing real `omm scan --no-color`
Windows 11 run recorded above, shown on the Windows page with a caption saying
it was taken under heavy load. The macOS and Linux pages have no capture, so
they list the field names `omm scan` prints instead of inventing a table.

## Command doc pages (`/commands`, `/commands/search`)

Source of truth for these pages is the omm product repo at
`~/Project/Localfit` (remote `origin` = `github.com/omm-hippo/omm`). Content
lives in `src/i18n/commands/` — `base.ts` for everything language-independent
(options, example commands, captured output, verbatim errors and their
file:line), `en.ts`/`ko.ts` for prose — assembled by
`src/components/commands/commands.ts`.

### `search`
- Command definition, options, and validation errors:
  `src/omm/cli.py:6293-6467`.
- README one-liner: `README.md:331`; shared scripting notes (global `--json`
  flag, safe-to-pipe guarantee): `README.md:401-403`; numeric-index reuse
  between `search`/`list`/`install`: `README.md:354`.
- Real captures, 2026-08-24, this dev machine, via `~/Project/Localfit`'s own
  `.venv` (`omm search ... --no-color`):
  - `omm search qwen --limit 5` — the page's "a real run" block, verbatim.
  - `omm search qwen --provider bogus` →
    `--provider must be one of: curated, huggingface, modelscope (got 'bogus').`
    (exit 2, `cli.py:6320-6323`)
  - `omm search qwen --skip-ms --provider modelscope` →
    `--skip-ms conflicts with --provider modelscope.`
    (exit 2, `cli.py:6326`)
  - `omm search zzzznonexistentmodelxyz` →
    `No models found matching 'zzzznonexistentmodelxyz'.`
    (exit 1, `cli.py:6362`)
### `install`
- Command definition, options, and errors: `src/omm/cli.py:4768-4889`;
  `Unknown model` message: `src/omm/hub.py:371`; disk-space check:
  `src/omm/cli.py:3477-3488`.
- The "a real run" block is a **format-accurate reconstruction, not a
  literal capture** — actually downloading a model is out of scope for this
  page. It reuses the site's own already-verified install demo: filename
  `mistral-7b-instruct-v0.2.Q4_K_M.gguf`, `4,368,439,584` bytes, and the
  Ollama/LM Studio/Jan link summary, all from the sanctioned demo state
  `Terminal.tsx` and this file's "Real `omm scan --no-color` capture" section
  already document. Download/checksum/summary line formats:
  `src/omm/downloader.py:107-170`, `src/omm/cli.py:4880-4889`.

### `run`
- Command definition and options: `src/omm/cli.py:5517-5565`.
- Real capture, 2026-08-24, this dev machine: `omm run totally-fake-model-xyz`
  → `totally-fake-model-xyz is not installed via omm. See \`omm list\`.`
  (exit 1, `cli.py:5536`).
- `Ollama is not installed...`: `src/omm/launcher.py:170`. `` `ollama run
  {tag}` exited with code... ``: `src/omm/launcher.py:177-183` (quoted from
  source, not executed — both require an environment state this page can't
  safely reproduce).
- The "a real run" block's startup banner is a **format-accurate
  reconstruction** of `src/omm/cli.py:5541-5551`, naming a model genuinely
  installed on this dev machine (`omm info qwen2.5-0.5b-instruct-q4_k_m.gguf
  --json`, 2026-08-24) — the chat itself is a live conversation, not
  reproduced.

### `recommend`
- Command definition: `src/omm/cli.py:2880-2932` (trained-model path) and
  `2934-2969` (static-rules fallback). No command-specific options exist
  beyond the two global flags its own docstring calls out.
- Real capture, 2026-08-24, this dev machine: `omm recommend --json`
  (read-only per its own docstring — installs nothing), trimmed to the top
  2 of 10 ranked candidates for length.
- `No model is predicted to run on this hardware.`: `cli.py:2916`.
  `No model in the current rules fits this hardware.`: `cli.py:2952`.

### `contribute`
- Command definition: `src/omm/cli.py:8412-8543` (start of the real
  consent-notice block quoted verbatim on the page) through `8600`.
- Upload-policy-disabled error: `cli.py:8433-8436`. No-engine error:
  `cli.py:8456-8459`. Disk-space preflight error: `cli.py:7871-7879`.
- The "a real run" block is a **verbatim quote of the real consent notice**
  `omm contribute` prints before it downloads anything (`cli.py:8518-8543`,
  Ollama-engine branch, upload policy shown as its default `ask`) — not a
  capture of a full run, since a real run repeatedly downloads, benchmarks,
  uploads and deletes real models, which this page does not trigger.

### `setup`
- Command definition: `src/omm/cli.py:1072-1077`, delegating to
  `src/omm/onboarding.py`'s `run_wizard` (`:315-339`). Takes no
  command-specific options.
- Banner/hardware-table format: `onboarding.py:42-91`. Engine checklist
  format and its `[*]`/`[ ]` indicators: `onboarding.py:139-162, 207-250`.
  Completion step: `onboarding.py:275-313`.
- `Engine selection requires an interactive terminal...`: `onboarding.py:
  221-224`. `{label} isn't auto-installable yet...`: `onboarding.py:258-261`.
  `Couldn't enable tab-completion automatically...`: `onboarding.py:303-305`.
- The "a real run" block is a **format-accurate reconstruction**, not a
  literal capture — running the wizard for real writes to this machine's
  actual config (`config_mod.update_config`), which this page does not do.
  Its hardware table uses a real `omm scan --json` run on this dev machine,
  2026-08-24 (macOS 27.0, Apple M2, 8.0 GB RAM), and a real, read-only free
  disk space check on this machine's `~/.omm`.

All six commands from issue #6's scope now have pages. Next candidates for
this same treatment, if the command list grows: `list`, `info`, `upgrade`,
`uninstall`, `benchmark`, `setting`.
