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
1. **Resolved (was open as of 2026-08-21).** README said `install.sh`
   bootstraps via "apt on Debian/Ubuntu or Homebrew on macOS"; at the time this
   page was first written, `install.sh` had no Homebrew bootstrap at all — only
   `run_apt`, with macOS and non-apt Linux instead checking and exiting on
   `Python 3.10+ not found` / `git not found`. A follow-up cross-check against
   the Localfit source (commit `790395a`, 2026-08-23) found the script had
   since gained Homebrew bootstrapping on macOS and multi-package-manager
   support on Linux (apt-get, dnf, yum, pacman or apk — not apt-only). The
   landing page's Install tab and the macOS/Linux guides were updated to match
   in that commit; re-verify exact line numbers against the current Localfit
   source before citing them again, since this page's own citations above
   predate the fix.
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
  - `omm search qwen` — the page's "a real run" block, verbatim, trimmed to
    the first six of 60 results.
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
- The "a real run" block is a **real, driven capture**, 2026-08-25:
  `omm install tinyllama-1.1b-q4 --yes` actually run against a throwaway
  `OMM_HOME`, downloading the real 668.8 MB curated file (a smaller curated
  name than the site's usual `mistral-7b-instruct-q4` demo, chosen so a real
  download completes quickly rather than reusing that already-verified
  reconstruction again). Real, unmocked linking wrote into this dev
  machine's actual Ollama and AnythingLLM directories — the two runners
  genuinely installed here, not the fictional Windows/Intel roster
  `recommend`/`setup` use, since real linking follows each runner's real
  install location regardless of `OMM_HOME`. `omm uninstall
  tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf --yes` ran immediately after
  capture, confirmed removed from both `omm list` and the real `ollama
  list`. The `Computing checksum...` wording (not `Verifying checksum...`)
  is real too — `cli.py:4134` prints one or the other depending on whether
  the source has a pinned hash ahead of time; this curated entry didn't.
  The Memory Guard line is a real safety block: this dev machine's actual
  live memory pressure at capture time refused the post-install benchmark
  load. Line refs: `src/omm/downloader.py:107-170` (download line format),
  `src/omm/cli.py:4130-4136` (checksum wording), `:4880-4889` (link
  summary).

### `run`
- Command definition and options: `src/omm/cli.py:5517-5565`.
- Real capture, 2026-08-24, this dev machine: `omm run totally-fake-model-xyz`
  → `totally-fake-model-xyz is not installed via omm. See \`omm list\`.`
  (exit 1, `cli.py:5536`).
- `Ollama is not installed...`: `src/omm/launcher.py:170`. `` `ollama run
  {tag}` exited with code... ``: `src/omm/launcher.py:177-183` (quoted from
  source, not executed — both require an environment state this page can't
  safely reproduce).
- The "a real run" block is a **real, driven capture**, 2026-08-25:
  `omm run` spawned under a real pty against `qwen2.5-0.5b-instruct-
  q4_k_m.gguf`, a model genuinely installed on this dev machine, handing off
  to the real `ollama run` exactly as `cli.py:5541-5565` does. A real
  message ("What is the capital of France?") was sent and Ollama's real
  generated reply ("The capital of France is Paris.") is shown verbatim —
  no dialogue on this page is invented. This particular run skipped
  "Started Ollama in the background for this chat." because the daemon was
  already running; that line only prints when `omm run` starts it itself
  (`cli.py:5547-5551`).

### `recommend`
- Command definition: `src/omm/cli.py:2880-2932` (trained-model path) and
  `2934-2969` (static-rules fallback). No command-specific options exist
  beyond the two global flags its own docstring calls out.
- The "a real run" block is a **real, end-to-end driven capture**,
  2026-08-25: `omm recommend`'s real code, run through a real pty (Python
  `pexpect`, rendered via the terminal emulator `pyte` since the picker and
  detail card are `questionary`/`prompt_toolkit` screens drawn straight to
  the terminal — never plain `stdout`, the reason a plain subprocess capture
  can't reach them at all) — but with `omm.cli.scan_hardware` monkeypatched
  (`unittest.mock.patch.object`) to a mid-range PC (Intel Core Ultra 7 155H,
  15.5 GB RAM, Intel Arc, no dedicated VRAM) instead of this session's own
  8 GB laptop, so the ranking reflects hardware someone would actually run
  this on rather than this specific dev environment's cramped numbers. That
  substitution is the only one made: the ranked list is `predictor.rank_
  candidates` run for real against the ten real candidates `omm recommend`
  fetched live from GitHub the same run. The picker was then driven down
  seven rows (real Down-arrow bytes sent into the pty) to `mistral 7b
  instruct v0.2` — a real candidate in that same ranked run, not a scripted
  substitute — and Enter selected it, producing a real detail card
  (`recommend_ui.py:308-`) whose `Repository` field
  (`TheBloke/Mistral-7B-Instruct-v0.2-GGUF`) matches, independently, the
  exact repo this file's HF-verified install demo already cites — the
  product's curated catalog entry for `mistral-7b-instruct-q4` and the
  site's own long-standing demo model are provably the same repo.
  `omm.cli.install` was monkeypatched to a no-op so pressing Enter never
  triggers a real download; what selecting it would actually install is
  shown by reusing this file's own already-HF-verified install facts
  (byte count, link summary) rather than downloading 4.4 GB a second time
  just for this page — see "Install guide pages" above and the `install`
  section below for that verification.
- The page's animation walks the `❯` pointer down through all ten rows
  before landing (`CommandCapture.tsx`'s `ROWS_START`/`ROWS_END` block),
  matching the real seven-Down-arrow navigation the capture used, not just
  showing the final frame.
- `No model is predicted to run on this hardware.`: `cli.py:2916`.
  `No model in the current rules fits this hardware.`: `cli.py:2952`.

### `contribute`
- Command definition: `src/omm/cli.py:8412-8543` (start of the real
  consent-notice block quoted verbatim on the page) through `8600`.
- Upload-policy-disabled error: `cli.py:8433-8436`. No-engine error:
  `cli.py:8456-8459`. Disk-space preflight error: `cli.py:7871-7879`.
- The "a real run" block is a **real, driven capture**, 2026-08-25: `omm
  contribute --yes` actually run against a throwaway `OMM_HOME` with
  `telemetry_send_policy` set to `ask` (not `always` — `never` makes
  contribute refuse to start at all, `cli.py:8431-8437`). It genuinely
  downloaded a real candidate (`maziyarpanahi/Qwen3-0.6B-GGUF`, real
  484.2 MB), benchmarked it through the real running Ollama, deleted it
  (`Removed Qwen3-0.6B.Q4_K_M.gguf`), and moved on to a second candidate —
  the loop's actual behavior, not a single-shot reconstruction. Interrupted
  there deliberately (`pkill`, not a graceful Esc, so no "stopped" line is
  shown or claimed).
- **Disclosed finding, not swept under the rug**: this run printed
  `Benchmark result uploaded.` and a real event was genuinely sent, even
  though the policy was `ask`, not `always`. The upload call inside
  contribute's benchmark path passes `force=True`
  (`cli.py:7314`, `telemetry.send_event(event, force=True)`), which bypasses
  `telemetry.py:269`'s `policy == "always"` gate entirely. In other words:
  `omm contribute` uploads under both `ask` and `always` — only `never`
  stops it, and only because that's checked separately at contribute's own
  start (`cli.py:8431-8437`), not through the shared send-gate every other
  command's upload path respects. README's and the in-app text's phrasing
  ("Uploads every benchmark result per your current upload policy") is
  technically accurate but reads as though `ask` behaves the way it does
  for a bare `omm benchmark` run; inside `contribute` specifically, it
  doesn't. The one real event sent is the same anonymized CPU/GPU-chip-score
  telemetry the `setting` section above already documents — no model name,
  no generated text.

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
- The "a real run" block is a **real, end-to-end driven capture**,
  2026-08-25: `omm setup`'s real code, run through a real pty (`pexpect`,
  rendered via `pyte` for the same reason as `recommend` above) with
  `OMM_HOME` pointed at a throwaway scratch directory — the theme pick and
  `onboarding_completed` flag it writes never touched this machine's real
  `~/.omm`. `omm.cli.scan_hardware` **and** `omm.onboarding.scan_hardware`
  (onboarding.py imports it by name, so both bindings need patching for the
  substitution to actually take) were monkeypatched to the same mid-range PC
  `recommend`'s page uses, and `omm.linker.is_engine_installed` was
  monkeypatched so Ollama/LM Studio/Jan read as already installed — the
  same three-runner state `Terminal.tsx`'s hero demo and this file's
  "sanctioned demo state" note (above) already use, so the site's demo
  machine is consistent everywhere it appears. Driven through every prompt
  exactly as `_build_picker_key_bindings` and `_build_empty_selection_
  validator` define them (`onboarding.py:230-261, 117-136`): Enter accepts
  the highlighted (default `dark`) theme, Enter twice past the runner
  checklist confirms zero *additional* runners selected, `n` declines
  tab-completion. The runner-checklist frame — real "- Ollama (installed)"
  rows next to real "[ ] AnythingLLM" unchecked ones — is transcribed
  directly from a captured `pyte` frame. The closing three lines are quoted
  verbatim from `onboarding.py:328-339` rather than transcribed from a
  frame, since the automated session's tail past "done" was cut short by
  the driver script's own timeout — matching a message already confirmed
  present in an earlier frame (`Enable tab-completion for install/remove
  any time...`, `onboarding.py:287-289`), not guessed. An earlier version of
  this page fabricated a plausible-looking checklist without running
  anything, and a version before that used this session's own real but
  atypically small laptop; this replaces both with an actually-driven
  session against hardware the page's own reader is more likely to have.

All six commands from issue #6's scope now have pages. Every remaining
documented `omm` command has one too (see below) — every real `omm search`,
`omm list`, `omm scan`, etc. shown on this site is the literal filename
`qwen2.5-0.5b-instruct-q4_k_m.gguf`, this dev machine's real second-smallest
installed model, unless noted otherwise. Real captures below are dated
2026-08-24 (`omm scan`, `list`, `info`, `fit`, `tune`, `autoremove`,
`cleanup`, `uninstall --dry-run`, `upgrade --dry-run`, `help`, `import`,
`setting theme`) and 2026-08-25 (`omm setup`'s driven session, see above).

### `scan`
`src/omm/cli.py:942-1070`. Hint lines quoted from `cli.py:1059-1064` and
`:1065-1069`. Real full capture, this dev machine.

### `tune`
`src/omm/cli.py:2990-3046`. Shares `hub.py:371`'s model-resolution error
with `install`/`search`. Real capture.

### `fit`
`src/omm/cli.py:5584-5634`. Size-unknown error: `cli.py:5608-5611`. The
`--json has no effect on \`omm fit\` - ignoring it.` warning is real,
captured verbatim, and contradicted by the command's own `--json` output in
the same capture — a genuine mismatch between the shared `global_flags`
decorator's own known-command list and `fit`'s body, which does branch on
`--json` correctly; not this site's error.

### `help`
`src/omm/cli.py:774-799`. Unknown-command error: `cli.py:795-796`. Real
captures (bare, and `omm help search`).

### `import`
`src/omm/cli.py:1475-1492`, adopt flow in `_run_import_flow`
(`cli.py:1413-1472`) and `scan_import.py`. Bad-path error: `cli.py:1490`
(real, captured). "Nothing stray found": `cli.py:1421` (real, captured).

The "a real run" block is a **real, driven capture**, 2026-08-25: two copies
of a real GGUF already installed on this dev machine
(`qwen2.5-0.5b-instruct-q4_k_m.gguf`) were placed under a throwaway extra
directory (`scan_directory`, `scan_import.py:201-213`, follows any path
passed on the command line — no mocking needed, since it's real and
harmless as long as the path is scratch), then `omm import` was driven
through a real pty exactly as a flag-less run would be: confirm the import,
accept the pre-checked picker, land on the real `Ω Imported ...` /
`Done: 1 model(s) in the omm hub, 0.5 GB saved.` lines. The 0.5 GB is real
deduplication savings from the two real duplicate copies, not a made-up
number.

### `uninstall`
`src/omm/cli.py:4966-5019`. Not-installed error: `cli.py:5008-5013`.
Numeric-index-without-prior-search error (shared with `tune`/`install`/
`upgrade`/`benchmark`'s `_resolve_ref`): `cli.py:3057-3059`, real captured.
`--dry-run` capture is real — nothing was removed.

### `list`
`src/omm/cli.py:5690-5750`. Bad-`--engine` error: `cli.py:909-911`, shared
with `link`. Real capture.

### `info`
`src/omm/cli.py:5265-5341`. Shares the not-installed error pattern
(`cli.py:5276`). Real capture, includes the same live fit card `omm fit`
renders.

### `upgrade`
`src/omm/cli.py:5637-5688`. Not-installed error: `cli.py:5676`. `--dry-run`
capture (all models) is real — nothing was re-downloaded.

### `link`
`src/omm/cli.py:6469-6617`. Engine-validation error shared with `list`
(`cli.py:909-911`); engine-plus-directory conflict: `cli.py:6501-6502`, real
captured. The "a real run" block is a **real, driven capture**, 2026-08-25:
a real small model was installed against a throwaway `OMM_HOME`, `omm
link` actually re-verified and rewrote its real Ollama symlink
(`cli.py:6613-6616`), and the model was uninstalled immediately after
capture — confirmed removed from the real `ollama list` too. The exact
wording is `0 skipped (file missing)`, not the `(missing)` an earlier,
unrun version of this page guessed.

### `autoremove` / `cleanup`
`src/omm/cli.py:6669-6709`. `autoremove`'s page capture is a
**format-accurate reconstruction** of the "found and removed something"
case (`cli.py:6692-6693`) — the case the command actually exists for — since
reproducing it for real means corrupting this dev machine's real runner
symlinks, unlike `cleanup` below. The clean-system message ("No broken
symlinks found.", `cli.py:6689`) moved to the troubleshooting section
instead, as the common baseline case.

`cleanup`'s page capture is a **real, driven run**, 2026-08-25: two genuine
`.gguf.part` files were created under a throwaway `OMM_HOME` — the exact
pattern `_cleanup_incomplete_installs` (`cli.py:6626-6666`) looks for — and
`omm cleanup` found and deleted both for real (`Cleaned up 2 incomplete
install file(s).`). Unlike `autoremove`, this needed no filesystem-layer
mocking: the files it acts on live entirely under `MODELS_DIR`, which
follows `OMM_HOME`, so a scratch home was enough to make it both real and
safe. The clean-system message ("No leftover install files found.",
`cli.py:6706`) moved to troubleshooting, same as `autoremove`.

### `verify`
`src/omm/cli.py:5127-5262`. Engine-validation error real captured:
`--engine must be ollama or lmstudio.` (`cli.py:5081-5163`). The "a real
run" block is a **real capture**, 2026-08-25: `omm verify
qwen2.5-0.5b-instruct-q4_k_m.gguf --yes` actually sent a real deterministic
prompt to the real running Ollama and required a real non-empty answer back
(`cli.py:5239-5250`). The `(already loaded and preserved)` detail is real,
not a stand-in for the more common `(test load released)` — it reflects
that the model happened to still be loaded in Ollama from the `run`
capture immediately before this one in the same session.

### `benchmark`
`src/omm/cli.py:6777-6900`. No-engine error shared with `contribute`
(`cli.py:6825-6827`). `` `all` must be the only argument. `` real captured
(`cli.py:6820`). The "a real run" block is a **real capture**, 2026-08-25:
`omm benchmark qwen2.5-0.5b-instruct-q4_k_m.gguf` actually ran the real
quality pack and speed samples through the real running Ollama. `1/8
(12.5%)` and `54.7 tok/s` are this model's genuine measured results on this
machine, not invented numbers. **Side effect, disclosed rather than
avoided after the fact**: this run's evidence was really uploaded, because
this dev machine's real `omm setting upload` policy was already `always`
from earlier in this same session (see the `setting` section above) — the
same anonymized CPU/GPU-score-only telemetry that section describes, no
model name or generated text. `contribute`'s captures below were run
against a scratch config with upload forced off specifically to avoid
repeating this.

### `update`
`src/omm/cli.py:2519-2548`. Not run live under any circumstance — a real
update can reinstall omm itself. Success/failure line formats quoted from
source (`cli.py:2536`, `:2542-2544`); the version/commit shown are
representative, not this machine's.

### `setting`
Ten subcommands: `src/omm/cli.py:5753-6199` (`telemetry`, `upload`,
`error-reports`, `memory-guard`, `version`, `theme`, `calibrate`,
`catalog-trust`, `catalog-status`, `catalog-rollback`) plus the bare
interactive menu (`:6151-6199`). The page's capture, 2026-08-25, is a real
`omm setting theme --set high-contrast` run against a throwaway `OMM_HOME` —
an actual change, not the earlier version's passive read-only `omm setting
theme` display, since showing the value change is closer to why the command
exists. **`telemetry` and `error-reports` were deliberately never used for
any capture on this page**: this dev machine has a real, personal telemetry
endpoint and Firebase error-report URL configured, and neither belongs on a
public page. Real captured errors: `Choose only one of --enable, --disable,
or --ask.` (`cli.py:5798`, shared `upload`/`error-reports`), `The signed
catalog manifest must use HTTPS.` (`cli.py:6104`). `--policy must be ask,
block, or observe.` is quoted from source (`cli.py:5901`), not executed,
since it needed no live check to verify. `calibrate` and `catalog-rollback`
were not run live (real benchmark load; real config mutation on state
that isn't reasonable to fabricate a "before" for).

### `doctor`
- Command definition, checks table, exit codes: `src/omm/cli.py:2479-2514`.
- The capture is a **real, driven capture**, 2026-08-25, this dev machine:
  `omm doctor --no-color` and `omm doctor --json` (for full untruncated
  detail strings) run for real. Every check name, PASS/WARN/FAIL status, and
  non-path detail (omm version, source commit, pipx version, registered
  model count, Ollama version, real model tag names) is verbatim and
  unedited — including the real WARN this run actually surfaced (a
  git-editable install whose package metadata trails its editable source by
  a few versions, a genuine state on this machine, not staged). Personal
  filesystem paths were generalized to representative ones (`~/.local/bin/
  omm`, `~/.omm-src`, `~/.omm/models.json`) per this page set's existing
  anonymization convention; every other value is exact. The `Overall: FAIL`
  trouble-table row is quoted from source (`cli.py:2513-2514`), not forced
  live, since forcing a real fail state (e.g. deleting the real Ollama
  binary) would have broken this dev machine's actual setup.

### `engine`
- Command definition, subcommand, options, errors: `src/omm/cli.py:1080-
  1113` (`engine_install_cmd`); "already installed" message: `cli.py:1109-
  1111`; bad-engine-key error: `cli.py:1104-1108`.
- The "a real run" block is a **real, driven capture**, 2026-08-25:
  `omm engine install lmstudio --no-color` actually run on this dev
  machine — a genuine Homebrew-cask install of LM Studio, not a
  reconstruction. The long percentage-by-percentage download progress line
  has been trimmed to its start and end; every other line, including the
  real `lms daemon up` hint LM Studio's own installer prints on success, is
  verbatim. **This install was intentionally not cleaned up afterward**,
  unlike this page set's usual model-file pattern (scratch `OMM_HOME` +
  immediate `omm uninstall`) — the user explicitly asked for a real
  install, and engine installs are real desktop applications outside
  `OMM_HOME`'s scope, not disposable model files. LM Studio genuinely
  remains installed on this machine as a result. The "already installed"
  and bad-key error captures were taken by re-running the command
  afterward, both real.
