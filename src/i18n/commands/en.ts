/**
 * English copy for the command doc pages. Commands, flags, file paths and
 * verbatim printed messages live in `./base.ts`, never here — see that
 * file's header.
 */

import type { CommandTextSet } from "@/i18n/commands/shape";

export const COMMANDS_EN: CommandTextSet = {
  search: {
    metaTitle: "omm search — find a model",
    metaDescription:
      "Full reference for omm search: every flag, five real examples from basic to scripted, a real captured run, and the three errors it actually prints.",
    heading: "omm search",
    lede: "Search omm's curated catalog, your cached candidates, and HuggingFace and ModelScope, all in one query.",
    summary: "Find a model across the curated catalog, HuggingFace and ModelScope.",

    overviewBody:
      "Reach for search before install: it is how you find the exact repo reference or numeric index that install accepts. Results are grouped by model family, numbered in the terminal, and models this hardware is predicted not to run print in red instead of being hidden — unless --skip-unfit says otherwise. The numbers search prints are only valid in the terminal that ran it: the next search or list run renumbers everything.",

    optionDescriptions: [
      "The text to search for. Matched against the curated/cached catalog first, then HuggingFace and ModelScope.",
      "If this hardware is predicted not to run a model, omit it from the results instead of listing it in red.",
      "Show at most this many results.",
      "Only show results from this source: curated (omm's built-in/cached catalog, not a real host), huggingface, or modelscope.",
      "Don't query ModelScope. Its results need one extra network request per candidate repo, which can noticeably slow down search.",
      "Print structured JSON to stdout instead of a formatted list — the only thing written to stdout, so it's safe to pipe.",
    ],

    exampleCaptions: [
      "Plain search — results grouped by family, numbered for the install command that follows.",
      "Cap the result count.",
      "Drop anything predicted not to run on this machine instead of showing it in red.",
      "Only HuggingFace results, skipping the curated catalog and ModelScope.",
      "JSON output piped to jq — safe because --json is the only thing search writes to stdout.",
    ],

    captureFootnote:
      "Real omm search qwen capture, 2026-08-24, this dev machine, trimmed to the first six of 60 results for length. HuggingFace and ModelScope rankings change constantly, so a fresh run will list different repos.",

    trouble: [
      {
        why: "--provider only accepts three values, and this run passed something else.",
        fix: "Use one of curated, huggingface, or modelscope.",
      },
      {
        why: "--skip-ms says don't query ModelScope; --provider modelscope says show only ModelScope results. Those cancel each other out.",
        fix: "Drop --skip-ms, or point --provider at curated or huggingface instead.",
      },
      {
        why: "None of the curated catalog, your cached candidates, HuggingFace, or ModelScope had anything matching this query.",
        fix: "Try a shorter or differently spelled query — search matches by name, not by exact repo ID.",
      },
    ],

    relatedBlurbs: [
      "Install by the number or repo reference search just printed.",
      "Don't know what to search for? recommend picks a model that fits this machine for you.",
    ],
  },

  install: {
    metaTitle: "omm install — download and link a model",
    metaDescription:
      "Full reference for omm install: every flag, five real examples from basic to scripted, a real download sequence, and the two errors it actually prints.",
    heading: "omm install",
    lede: "Download a model into the central hub, link it into every installed runner, and check it fits this machine's memory before spending your bandwidth.",
    summary: "Download a model into the hub and link it into every installed runner.",

    overviewBody:
      "Reach for install once search or list has given you a name, a repo reference, or a numeric index. install checks the model against this machine's predicted memory budget before downloading anything, links the finished file into every runner installed on this system, and prints the exact commands to run or uninstall it. A name that resolves to more than one quantization or more than one provider drops into an interactive picker instead of guessing.",

    optionDescriptions: [
      "A curated name, a numeric index from the last search or list run, an 'org/repo:file.gguf' reference (optionally prefixed hf: or ms:), or a direct URL.",
      "If this hardware is predicted not to run the model, skip it instead of asking. Exits 0 with skipped_unfit set — for scripting.",
      "Send (or skip sending) this machine's benchmark result to the telemetry server without asking. Left unset, the current omm setting upload policy decides.",
      "Re-download even if this model is already installed.",
      "Run (or skip) a short local load/generation check after linking. Left unset, install asks before loading a model that isn't already running.",
    ],

    exampleCaptions: [
      "Plain install — checks hardware fit, downloads, verifies, links.",
      "Skip this model instead of asking, if it's predicted not to run here.",
      "Install by the number the last search or list run printed.",
      "Install without sending a benchmark result, regardless of the saved upload policy.",
      "Re-download even though this model is already installed.",
    ],

    captureFootnote:
      "Format-accurate reproduction of the real download, checksum and link-summary lines (src/omm/downloader.py:107-170, src/omm/cli.py:4880-4889) — not a literal capture, since actually downloading a 4.4 GB file isn't something this page does. Filename, byte count and the three linked runners match the site's own verified install demo (design/FACTS.md).",

    trouble: [
      {
        why: "This name doesn't match anything in the curated catalog, and it isn't a repo reference or URL install recognizes either.",
        fix: "Try omm search first to find the exact name or reference, or pass an 'org/repo:file.gguf' reference directly.",
      },
      {
        why: "install checks free space before downloading — the central model file, plus whatever a runner needs to copy or link it, plus a safety margin.",
        fix: "Free up space on the reported volume, or point OMM_HOME at a roomier drive before installing.",
      },
    ],

    relatedBlurbs: [
      "Find the exact name, reference, or index to install.",
      "Just installed something? run starts chatting with it.",
    ],
  },

  run: {
    metaTitle: "omm run — chat with an installed model",
    metaDescription:
      "Full reference for omm run: every flag, three real examples, what each runner does when you start a chat, and the three errors it actually prints.",
    heading: "omm run",
    lede: "Start a chat with a model already installed via omm — Ollama chats right here in the terminal, KoboldCpp and text-generation-webui start with the model loaded, GUI apps just open.",
    summary: "Chat with an installed model — in the terminal for Ollama, or by opening the app for GUI runners.",

    overviewBody:
      "Reach for run once install has finished. With no name, run offers an interactive pick from what's installed; with a name, it resolves which runners that model is linked into and either drops you straight into a terminal chat (Ollama), launches the model already loaded (KoboldCpp, text-generation-webui), or opens the GUI app so you can pick it from its own local-models list. --engine overrides the automatic choice when a model is linked into more than one runner.",

    optionDescriptions: [
      "An installed model's filename (see omm list). Left out, run offers an interactive pick from what's installed.",
      "Which linked runner to use: ollama, lmstudio, jan, koboldcpp, textgenwebui, anythingllm, or mstystudio. Left out, run picks one automatically.",
    ],

    exampleCaptions: [
      "No name — pick interactively from what's installed.",
      "Run a specific installed model, letting run pick the runner.",
      "Run the same model through a specific runner instead of the automatic pick.",
    ],

    captureFootnote:
      "Format-accurate reproduction of the real startup banner (src/omm/cli.py:5541-5551) for a model genuinely installed on this dev machine — not a literal capture, since the chat itself is a live conversation this page can't script or reproduce.",

    trouble: [
      {
        why: "The name doesn't match anything omm has installed on this machine — it may be misspelled, or installed under a runner directly rather than through omm.",
        fix: "Run omm list to see the exact filename omm knows about, then pass that.",
      },
      {
        why: "run picked (or was told to use) Ollama, but no Ollama installation was found on this machine.",
        fix: "Install Ollama from the link in the message, then retry.",
      },
      {
        why: "The model is linked into Ollama, but the ollama run itself failed or the link is stale.",
        fix: "Run omm link --engine ollama to re-verify and repair the link, then retry.",
      },
    ],

    relatedBlurbs: [
      "Nothing to run yet? install downloads and links a model first.",
      "See every model omm has installed on this machine and which runners it's linked into.",
    ],
  },

  recommend: {
    metaTitle: "omm recommend — a model that fits this machine",
    metaDescription:
      "Full reference for omm recommend: both flags, three real examples, a real ranked-candidate capture, and the two errors it actually prints.",
    heading: "omm recommend",
    lede: "Rank models by a predictor trained on real install telemetry — falling back to static rules when the trained model can't be fetched — and offer to install the top pick.",
    summary: "Get a model suggestion ranked for this machine's hardware, with an offer to install it.",

    overviewBody:
      "Reach for recommend when you don't already know what to install: it scans this machine, ranks candidates by predicted speed and how much of the safe memory budget they'd use, and — outside --json — walks you through picking one and installs it directly. --json is read-only: it prints the ranked list and installs nothing, which is what makes it safe to script. --yes skips the picker and installs whatever ranked first.",

    optionDescriptions: [
      "Print the ranked candidates as JSON and install nothing.",
      "Skip the interactive picker and install the top-ranked candidate immediately.",
    ],

    exampleCaptions: [
      "Interactive — ranks candidates, then walks you through picking one to install.",
      "Read-only — prints the ranked list, installs nothing.",
      "Non-interactive — installs the top-ranked candidate without asking.",
    ],

    captureFootnote:
      "The hardware panel and table header are a real omm recommend capture, 2026-08-24, this dev machine. The two model rows are a format-accurate reconstruction from a real omm recommend --json run the same day — the arrow-key picker draws its rows directly to the terminal, so they never appear in plain captured output. A fresh run reflects this machine's live memory budget and the current candidate catalog.",

    trouble: [
      {
        why: "Every candidate the trained predictor ranked came back under the minimum usable speed for this hardware.",
        fix: "This machine likely needs a smaller model than anything currently in the trained catalog — try omm search for something specifically small, e.g. a 1-3B model.",
      },
      {
        why: "The trained model wasn't available, so recommend fell back to the static rules — and even those found nothing that fits the memory this machine has free.",
        fix: "Close other applications to free memory and try again, or search for a smaller model directly.",
      },
    ],

    relatedBlurbs: [
      "Already know what you want? Install it by name or reference directly.",
      "Look at everything matching a specific name instead of a hardware-fit ranking.",
    ],
  },

  contribute: {
    metaTitle: "omm contribute — grow the recommendation dataset",
    metaDescription:
      "Full reference for omm contribute: both meaningful flags, four real examples, the real consent notice it prints before starting, and the three errors it actually prints.",
    heading: "omm contribute",
    lede: "Repeatedly install, benchmark, and upload telemetry for hardware-fit models — deleting each one afterward — to grow the training data behind omm recommend.",
    summary: "Benchmark models in a loop, uploading telemetry to improve recommend for hardware like yours.",

    overviewBody:
      "contribute is the one command in omm that is meant to run unattended for a while: it downloads a candidate, benchmarks it, uploads the result under your current upload policy, deletes the model to keep disk usage bounded, and repeats until you press Esc or it runs out of candidates this hardware hasn't already covered. It refuses to start unless every model volume has real free space, and prints the exact consent notice below before it downloads anything.",

    optionDescriptions: [
      "Send scrubbed error reports from this run only. Doesn't change the saved policy, and is ignored if error reports are explicitly turned off.",
      "Skip the 'Start contributing compute now?' confirmation and every per-model prompt — required for an unattended run.",
    ],

    exampleCaptions: [
      "Interactive — prints the consent notice, then asks before starting.",
      "Unattended — no confirmation prompt, runs until Esc or the candidates run out.",
      "Also send scrubbed error reports from this run.",
      "Store models under a roomier volume than the default ~/.omm, straight from the README.",
    ],

    captureFootnote:
      "Verbatim reproduction of the real consent notice omm contribute prints before it downloads anything (src/omm/cli.py:8518-8543), for the Ollama engine and its upload policy shown as 'ask' — not a literal full-run capture, since a real run downloads, benchmarks, uploads and deletes real models in a loop, which this page won't trigger.",

    trouble: [
      {
        why: "contribute always uploads its benchmark results — that's the point of the command — so it refuses to start while uploads are turned off entirely.",
        fix: "Run omm setting upload --enable or --ask, then retry.",
      },
      {
        why: "Benchmarking needs a running engine to load the model into, and contribute only knows how to drive Ollama or LM Studio for this.",
        fix: "Install and start Ollama or LM Studio at least once, then retry.",
      },
      {
        why: "Every candidate needs headroom for the central download plus a worst-case engine copy — contribute checks this before starting an unattended run, not partway through one.",
        fix: "Free up space on the reported volume (the message names exactly how much), or point OMM_HOME at a roomier drive.",
      },
    ],

    relatedBlurbs: [
      "See the local benchmark data contribute is built on top of.",
      "Check or change the upload policy contribute reads before it starts.",
    ],
  },

  setup: {
    metaTitle: "omm setup — the first-run wizard, any time",
    metaDescription:
      "Full reference for omm setup: its one meaningful flag, both examples, a real hardware-scan-backed capture of the wizard, and the three messages it actually prints.",
    heading: "omm setup",
    lede: "Re-run the first-time setup wizard — a hardware scan followed by a checklist of local AI runners to install — any time, not just on first run.",
    summary: "Re-run the hardware scan and runner-install checklist, any time.",

    overviewBody:
      "setup is what runs automatically the first time omm is used, and it's also the command to reach for later: to pick up a runner you skipped, to re-check your hardware summary, or to turn shell tab-completion on. It takes no arguments — everything it does is an interactive step: a hardware summary, a checklist of runners (already-installed ones shown but not selectable), and an offer to enable tab-completion. It needs a real terminal; running it with no TTY attached fails immediately instead of hanging.",

    optionDescriptions: [
      "Suppress the engine-install progress lines while the wizard installs the runners you picked. Prompts, warnings and the final summary still print.",
    ],

    exampleCaptions: [
      "The full wizard: hardware summary, runner checklist, tab-completion offer.",
      "Same wizard, without the per-line progress output while runners install.",
    ],

    captureFootnote:
      "Real omm setup run, 2026-08-24, this dev machine, driven end to end through a real terminal (accepting the default theme, selecting no runners, declining tab-completion) against a throwaway OMM_HOME so nothing here touched this machine's real config. The theme picker and runner checklist are questionary screens rendered straight to the terminal, captured through a terminal emulator rather than plain stdout — the same reason recommend's picker rows can't be captured any other way. The closing three lines are quoted verbatim from onboarding.py's own completion message.",

    trouble: [
      {
        why: "The runner checklist is an interactive prompt, and this run's stdin wasn't a real terminal (e.g. piped, or run from a script).",
        fix: "Run omm setup from an actual terminal.",
      },
      {
        why: "Some runners don't have an automated installer on every platform yet — this one has to be installed by hand on this system.",
        fix: "Install it yourself from the compatible-programs list, then re-run omm setup or omm link so omm picks it up.",
      },
      {
        why: "Enabling tab-completion writes to your shell's config, which can fail for reasons specific to that shell or its config file's permissions.",
        fix: "Run omm --install-completion yourself to see the underlying error, or set it up manually.",
      },
    ],

    relatedBlurbs: [
      "Once a runner or two is installed, recommend picks a model that fits this machine.",
      "Install one specific runner directly, skipping the checklist.",
    ],
  },

  scan: {
    metaTitle: "omm scan — hardware and runner summary",
    metaDescription:
      "Full reference for omm scan: its one flag, three examples, a real captured hardware/runner/model report, and what its two hint lines mean.",
    heading: "omm scan",
    lede: "Print a summary of this machine's hardware, which local AI runners it detects, and every model omm knows about.",
    summary: "Print this machine's hardware, detected runners, and models — no flags needed.",

    overviewBody:
      "Reach for scan any time you want a snapshot of what this machine can run and what's already on it, without changing anything. It's read-only: nothing it prints is a suggestion to act on immediately, though it does nudge you toward omm link or omm import when it notices something those would fix.",

    optionDescriptions: [
      "Print the same report as structured JSON instead of tables.",
    ],

    exampleCaptions: [
      "The full hardware, runner, and model report.",
      "Machine-readable — the same fields, as JSON.",
      "Skip the two hint lines at the end, if any would otherwise print.",
    ],

    captureFootnote:
      "Real omm scan capture, 2026-08-24, this dev machine.",

    trouble: [
      {
        why: "A model in the omm hub exists but isn't symlinked into a runner that's now installed on this machine — usually because the runner was installed after the model was.",
        fix: "Run omm link to repair every model's links in one pass.",
      },
      {
        why: "scan found .gguf files sitting in a runner's own model directory that were never installed through omm, so it doesn't manage or dedupe them yet.",
        fix: "Run omm import to adopt them into the hub, or ignore the note if you'd rather manage them yourself.",
      },
    ],

    relatedBlurbs: [
      "Re-run the hardware scan as part of the full setup wizard.",
      "See every model omm manages, without the hardware detail.",
    ],
  },

  tune: {
    metaTitle: "omm tune — recommended runtime settings",
    metaDescription:
      "Full reference for omm tune: its one argument, three examples, a real captured runtime profile, and the error it actually prints.",
    heading: "omm tune",
    lede: "Recommend a starting context length, GPU offload, thread count, and batch size for a model on this machine.",
    summary: "Get recommended context length, GPU offload, threads, and batch size for a model.",

    overviewBody:
      "Reach for tune once you've picked a model, installed or not, and want conservative starting values before you configure a runner by hand. It never benchmarks anything itself — it's a prediction based on this machine's hardware and the model's size, meant as a first guess you'd then verify with omm benchmark.",

    optionDescriptions: [
      "An installed model's filename, a curated name, or a repo reference. Not-yet-installed models work too, as long as their size can be resolved.",
    ],

    exampleCaptions: [
      "Recommended settings for an installed model.",
      "The same profile as JSON.",
      "Works on a model that isn't installed yet, if its size can be resolved.",
    ],

    captureFootnote:
      "Real omm tune qwen2.5-0.5b-instruct-q4_k_m.gguf capture, 2026-08-24, this dev machine. The negative headroom reflects this machine's real memory pressure at capture time — a busier or freer machine will show a different number.",

    trouble: [
      {
        why: "This name doesn't match anything in the curated catalog, and it isn't a repo reference or URL tune recognizes either.",
        fix: "Try omm search first to find the exact name or reference.",
      },
    ],

    relatedBlurbs: [
      "Download and link the model these settings are for.",
      "Check whether the model fits this machine's memory right now.",
    ],
  },

  fit: {
    metaTitle: "omm fit — does this model fit right now",
    metaDescription:
      "Full reference for omm fit: its one argument, three examples, a real captured memory-fit card, and two things worth knowing about its output.",
    heading: "omm fit",
    lede: "Show whether a model — installed or not — fits this machine's memory right now, as a bar over what other apps are using.",
    summary: "See whether a model fits this machine's free memory right now, installed or not.",

    overviewBody:
      "Reach for fit when you want a live answer, not a cached one: unlike the fit check inside install, this reads memory availability at the moment you run it, so the same model can read differently five minutes later if other apps opened or closed. It works on models that aren't installed yet too, as long as their size can be resolved from the provider.",

    optionDescriptions: [
      "An installed model's filename, a curated name, or a repo reference whose size the provider reports.",
    ],

    exampleCaptions: [
      "The fit card for an installed model.",
      "The same numbers as JSON — useful in a script's fit check before installing.",
      "Works on a model that isn't installed yet, as long as its size is known.",
    ],

    captureFootnote:
      "Real omm fit qwen2.5-0.5b-instruct-q4_k_m.gguf capture, 2026-08-24, this dev machine.",

    trouble: [
      {
        why: "The model isn't installed, and its provider didn't report a file size fit could use to estimate memory — this happens for some direct-URL or unusual repo references.",
        fix: "Install it (fit's own check runs first, so nothing downloads if it clearly won't fit) or search for it by name to find a reference with size metadata.",
      },
      {
        why: "This is a real, verbatim warning omm itself prints — fit's own code does branch on --json and prints structured output correctly (see the captured JSON example above); the warning is a known mismatch in the flag-handling decorator's own bookkeeping, not a sign the flag actually failed.",
        fix: "Nothing to do — the JSON output is correct regardless of this warning.",
      },
    ],

    relatedBlurbs: [
      "Get recommended runtime settings for the same model.",
      "Download and link a model once you know it fits.",
    ],
  },

  help: {
    metaTitle: "omm help — command reference from the CLI itself",
    metaDescription:
      "Full reference for omm help: all three flags, four examples, a real captured summary screen, and the error it prints for an unknown command.",
    heading: "omm help",
    lede: "Show omm's own help — a short command summary by default, or the full reference with --all.",
    summary: "Show omm's own command summary, or the full reference with --all.",

    overviewBody:
      "Reach for help the same way you'd reach for --help — it's the same content, just as its own subcommand so it composes with a command name (omm help search shows exactly what omm search --help would). Bare omm help shows the short, curated list you see below; --all expands it to every command omm has, and --all --flags adds each one's full option list.",

    optionDescriptions: [
      "Show full --help output for this one subcommand instead of the summary.",
      "List every command omm has, not just the commonly used ones.",
      "With --all, also print each command's complete flag list.",
    ],

    exampleCaptions: [
      "The short, curated command summary.",
      "Full --help output for one command.",
      "Every command omm has, one line each.",
      "Every command, with its complete option list.",
    ],

    captureFootnote:
      "Real omm help capture, 2026-08-24, this dev machine.",

    trouble: [
      {
        why: "There's no subcommand by this name — usually a typo, or a command that exists under an alias (rm, ls, up) instead of the name given.",
        fix: "Run omm help --all to see every real command name.",
      },
    ],

    relatedBlurbs: [
      "The command help defaults to demonstrating.",
      "Re-run the wizard help points newcomers toward first.",
    ],
  },

  import: {
    metaTitle: "omm import — adopt models from other apps",
    metaDescription:
      "Full reference for omm import: its one argument, three examples, a real captured run, and the error it actually prints.",
    heading: "omm import",
    lede: "Scan every supported local AI app for .gguf files omm doesn't manage yet, and offer to adopt each one into the hub.",
    summary: "Adopt .gguf files sitting in other apps' model directories into the omm hub.",

    overviewBody:
      "Reach for import when omm scan's \"Found model file(s) outside the omm hub\" note shows up, or any time you know a runner has models you downloaded outside of omm. It scans every supported app's model directory (and an optional extra path you pass) for files not yet registered, then offers to adopt each one — moving it into the central hub and linking it back in, so a byte-identical copy stops sitting in two places.",

    optionDescriptions: [
      "An extra directory to also scan, beyond the usual app directories.",
    ],

    exampleCaptions: [
      "Scan the usual app directories.",
      "Also scan an extra directory.",
      "Adopt everything found without asking about each one.",
    ],

    captureFootnote:
      "Real omm import capture, 2026-08-24, this dev machine — nothing stray was found to adopt, which is itself a real, common outcome. The interactive adopt-each-file flow isn't reproduced here since it can move real files into the hub, which this page won't trigger.",

    trouble: [
      {
        why: "The extra path passed doesn't exist or isn't a directory.",
        fix: "Double check the path, or omit it to just scan the usual app directories.",
      },
    ],

    relatedBlurbs: [
      "scan is what points you toward import in the first place.",
      "See what's in the hub after adopting something.",
    ],
  },

  uninstall: {
    metaTitle: "omm uninstall — remove a model and its links",
    metaDescription:
      "Full reference for omm uninstall: both flags, four examples, a real captured dry run, and the two errors it actually prints.",
    heading: "omm uninstall",
    lede: "Remove a model and clean up every symlink and manifest entry it left behind — or preview exactly that with --dry-run first.",
    summary: "Remove a model and clean up its symlinks and manifests. Alias: rm.",

    overviewBody:
      "Reach for uninstall once you're done with a model. Pass all to remove every model omm has installed in one pass. --dry-run answers \"what would this actually do\" without deleting anything — worth reaching for first if you're not sure exactly what all currently covers.",

    optionDescriptions: [
      "An installed model's filename, a numeric index from the last search or list run, or the literal word all.",
      "Show what would be uninstalled without removing anything.",
    ],

    exampleCaptions: [
      "Uninstall one model.",
      "Preview it first — nothing is removed.",
      "Preview uninstalling everything omm has installed.",
      "Uninstall by the number the last search or list run printed.",
    ],

    captureFootnote:
      "Real omm uninstall qwen2.5-0.5b-instruct-q4_k_m.gguf --dry-run capture, 2026-08-24, this dev machine.",

    trouble: [
      {
        why: "This name doesn't match anything omm has installed — misspelled, or never installed through omm in the first place.",
        fix: "Run omm list to see the exact filename omm knows about.",
      },
      {
        why: "A numeric index only means something after a search or list run in the same terminal printed one — there's nothing to resolve it against yet.",
        fix: "Run omm search or omm list first, then use the number it printed.",
      },
    ],

    relatedBlurbs: [
      "See exactly what's installed before removing it.",
      "Install something new once this one's gone.",
    ],
  },

  list: {
    metaTitle: "omm list — every model omm has installed",
    metaDescription:
      "Full reference for omm list: its one flag, three examples, a real captured table, and the error it actually prints.",
    heading: "omm list",
    lede: "Show every model installed via omm, its size, and which runners it's linked into.",
    summary: "Show every model omm has installed and which runners each is linked into. Alias: ls.",

    overviewBody:
      "Reach for list to see the current state of the hub — what's on disk, how big it is, and where it's linked. The numbers it prints, like search's, are only valid in the terminal that ran it: install, uninstall, info, and upgrade all accept that number in place of a name.",

    optionDescriptions: [
      "Only show models linked into this engine.",
    ],

    exampleCaptions: [
      "Every model omm has installed.",
      "Only the ones linked into Ollama.",
      "The same table as JSON.",
    ],

    captureFootnote:
      "Real omm list capture, 2026-08-24, this dev machine.",

    trouble: [
      {
        why: "--engine only accepts a real engine key, and this run passed something else.",
        fix: "Use one of the seven listed in the message — anythingllm, jan, koboldcpp, lmstudio, mstystudio, ollama, or textgenwebui.",
      },
    ],

    relatedBlurbs: [
      "See full detail — repo, version, verification status — for one model.",
      "Install something new to add to this list.",
    ],
  },

  info: {
    metaTitle: "omm info — full detail on one installed model",
    metaDescription:
      "Full reference for omm info: its one argument, three examples, a real captured detail view, and the error it actually prints.",
    heading: "omm info",
    lede: "Show one installed model's repo, version, size, verification status, and the exact command to run it in each linked program.",
    summary: "Show full detail — repo, version, size, links, run commands — for one installed model.",

    overviewBody:
      "Reach for info once list has told you a model exists and you want everything about it: which repo and version it came from, whether a compatibility check has passed, and the literal command to run it in whichever runner it's linked into. It also prints the same live memory-fit card omm fit shows, so you don't need a second command just to check that.",

    optionDescriptions: [
      "An installed model's filename or a numeric index from the last search or list run.",
    ],

    exampleCaptions: [
      "Full detail for one installed model.",
      "The same fields as JSON.",
      "By the number the last search or list run printed.",
    ],

    captureFootnote:
      "Real omm info qwen2.5-0.5b-instruct-q4_k_m.gguf capture, 2026-08-24, this dev machine.",

    trouble: [
      {
        why: "This name doesn't match anything omm has installed.",
        fix: "Run omm list to see the exact filename omm knows about.",
      },
    ],

    relatedBlurbs: [
      "See every installed model at a glance, without the full detail.",
      "Check this same model's live memory fit on its own.",
    ],
  },

  upgrade: {
    metaTitle: "omm upgrade — refresh a model against its source",
    metaDescription:
      "Full reference for omm upgrade: both flags, three examples, a real captured dry run, and the error it actually prints.",
    heading: "omm upgrade",
    lede: "Refresh an installed model against its source, re-downloading only if it's actually changed since install.",
    summary: "Refresh installed models against their source — only re-downloads what's actually changed. Alias: up.",

    overviewBody:
      "Reach for upgrade to check whether an installed model has been updated upstream since you installed it. With no argument (or all) it checks everything omm has installed; a single name checks just that one. It never re-downloads a model whose source hash hasn't changed, so running it against everything is cheap when nothing's actually different — --dry-run shows exactly what it would check without even that.",

    optionDescriptions: [
      "An installed model's filename, or all (also the default with no argument).",
      "Show what would be checked for updates without downloading anything.",
    ],

    exampleCaptions: [
      "Check every installed model for updates.",
      "Preview checking one model — nothing downloads.",
      "Preview checking everything — nothing downloads.",
    ],

    captureFootnote:
      "Real omm upgrade --dry-run capture, 2026-08-24, this dev machine — both installed models listed.",

    trouble: [
      {
        why: "This name doesn't match anything omm has installed.",
        fix: "Run omm list to see the exact filename omm knows about.",
      },
    ],

    relatedBlurbs: [
      "See what's installed before checking it for updates.",
      "Install something new instead of upgrading what's there.",
    ],
  },

  link: {
    metaTitle: "omm link — repair or extend model links",
    metaDescription:
      "Full reference for omm link: all three options, three examples, its real success-line format, and the two errors it actually prints.",
    heading: "omm link",
    lede: "Re-verify and repair every installed model's links into every installed runner — or link the whole hub into a directory for an app omm doesn't support directly.",
    summary: "Re-verify and repair every installed model's runner links, or link into a custom directory.",

    overviewBody:
      "Reach for link after installing a new runner (so models installed before it get linked in too), or when scan's \"aren't linked into an installed engine yet\" note shows up. With no directory it always re-links every model into every installed runner — covering both never-linked and quietly-broken links, since it never trusts a cached linked flag. With a directory, it reuses the central file directly when possible instead of copying it, for an app that isn't one of the seven omm knows natively.",

    optionDescriptions: [
      "An extra directory to link every installed model's file into, for an app omm doesn't support directly.",
      "Only re-verify/repair links for this one engine.",
      "Reclaim a destination omm doesn't recognize as its own by deleting and relinking it, instead of skipping it as a conflict.",
    ],

    exampleCaptions: [
      "Re-verify and repair every model's links into every installed runner.",
      "Only repair links into Ollama.",
      "Link every installed model into a directory for an unsupported app.",
    ],

    captureFootnote:
      "Format-accurate reproduction of the real success-line format (src/omm/cli.py:6613-6616), using this dev machine's real installed-model count (2) — not a literal capture, since running link for real rewrites this machine's actual runner symlinks, which this page won't trigger even though both models are already correctly linked and the operation is normally idempotent.",

    trouble: [
      {
        why: "--engine only accepts a real engine key, and this run passed something else.",
        fix: "Use one of the seven listed in the message.",
      },
      {
        why: "--engine narrows which runner gets repaired; a directory argument means something different — linking into a location that isn't one of the seven known runners. The two can't be combined.",
        fix: "Use --engine alone to repair one runner's links, or a directory alone to link into a custom location.",
      },
    ],

    relatedBlurbs: [
      "scan is what tells you when models need relinking.",
      "Install a new model, which links itself automatically.",
    ],
  },

  autoremove: {
    metaTitle: "omm autoremove — clean up broken runner symlinks",
    metaDescription:
      "Full reference for omm autoremove: no flags of its own, two examples, the case where it actually finds something to clean up, and what a clean run looks like.",
    heading: "omm autoremove",
    lede: "Remove symlinks left behind in runner model directories after a model's source file was deleted outside of omm uninstall.",
    summary: "Clean up broken symlinks left in runner model directories — no flags needed.",

    overviewBody:
      "Reach for autoremove if a runner's own model list shows an entry that no longer loads — usually because the underlying .gguf was deleted by hand, or by something other than omm uninstall, leaving a dangling symlink behind in the runner's directory. It only ever removes links that are already broken; a model still on disk is never touched.",

    optionDescriptions: [],

    exampleCaptions: [
      "Clean up broken symlinks across every installed runner.",
      "Same cleanup, without the per-runner progress output.",
    ],

    captureFootnote:
      "Format-accurate reproduction of the real success-line format (src/omm/cli.py:6692-6693) for the case autoremove actually exists to handle — a model's .gguf deleted by hand (or by something other than omm uninstall) leaving broken symlinks in two runners' directories. Not a literal capture: reproducing it for real means corrupting this dev machine's real Ollama/AnythingLLM links, which this page won't do. The counts are representative.",

    trouble: [
      {
        why: "This is what autoremove prints on a healthy system, which is most runs — nothing was broken, so there was nothing to clean up.",
        fix: "Nothing to do.",
      },
    ],

    relatedBlurbs: [
      "Clean up leftover partial downloads the same way.",
      "See if scan still flags anything after cleaning up.",
    ],
  },

  cleanup: {
    metaTitle: "omm cleanup — clean up leftover install files",
    metaDescription:
      "Full reference for omm cleanup: no flags of its own, two examples, a real captured run, and what its success message means.",
    heading: "omm cleanup",
    lede: "Remove orphaned partial or unregistered .gguf downloads left behind in the models directory by an interrupted install.",
    summary: "Clean up leftover partial downloads and install cache files — no flags needed.",

    overviewBody:
      "Reach for cleanup after an install was interrupted (network drop, Ctrl+C, a crash) and you want to reclaim the partial download's disk space without hunting for the file yourself. It only ever touches incomplete, unregistered files — nothing that's actually a finished, installed model.",

    optionDescriptions: [],

    exampleCaptions: [
      "Clean up every leftover install file.",
      "Same cleanup, without the progress output.",
    ],

    captureFootnote:
      "Real omm cleanup capture, 2026-08-24, this dev machine — no leftover files existed to remove.",

    trouble: [
      {
        why: "This is what cleanup prints when it does find and remove leftover files — not an error, just a count of what was cleaned up.",
        fix: "Nothing to do — disk space from the interrupted install(s) has been reclaimed.",
      },
    ],

    relatedBlurbs: [
      "Clean up broken runner symlinks the same way.",
      "Retry the install that got interrupted.",
    ],
  },

  verify: {
    metaTitle: "omm verify — prove a model actually runs",
    metaDescription:
      "Full reference for omm verify: all four options, three examples, its real success-line format, and the two errors it actually prints.",
    heading: "omm verify",
    lede: "Load an installed model into Ollama or LM Studio, send one short deterministic prompt, and confirm it returns real local text.",
    summary: "Prove that an installed model actually loads and generates text on this machine.",

    overviewBody:
      "Reach for verify when info's compatibility field says failed or unknown, or you just want first-hand proof a model works before relying on it. Unlike a casual test chat, it asks before loading an unloaded model, releases what it loaded when it's done (unless --keep-loaded says otherwise), and never stores the text it generated — only whether generation succeeded.",

    optionDescriptions: [
      "An installed model's filename.",
      "Which runtime to test: ollama or lmstudio. Left out, verify picks automatically.",
      "Keep the model loaded afterward, only if this command is the one that loaded it.",
      "Load the model without asking first. For scripting.",
    ],

    exampleCaptions: [
      "Verify an installed model, asking before loading it if needed.",
      "Verify against a specific runtime, without the load confirmation.",
      "Verify and leave the model loaded afterward.",
    ],

    captureFootnote:
      "Format-accurate reproduction of the real status and success lines (src/omm/cli.py:5239-5250) for a model genuinely installed on this dev machine — not a literal capture, since actually loading it into a running engine is out of scope for this page.",

    trouble: [
      {
        why: "This name doesn't match anything omm has installed.",
        fix: "Run omm list to see the exact filename omm knows about.",
      },
      {
        why: "--engine only accepts ollama or lmstudio for verification — no other runtime has a compatibility check implemented yet.",
        fix: "Use ollama or lmstudio, or omit --engine to let verify pick automatically from what the model is linked into.",
      },
    ],

    relatedBlurbs: [
      "Chat with the model directly, once you know it works.",
      "Install a model in the first place.",
    ],
  },

  benchmark: {
    metaTitle: "omm benchmark — quality and speed evidence",
    metaDescription:
      "Full reference for omm benchmark: all five options, three examples, its real progress-line format, and the two errors it actually prints.",
    heading: "omm benchmark",
    lede: "Measure a small reproducible quality pack and decode speed for one or more installed models.",
    summary: "Local quality and speed smoke evidence for one or more installed models.",

    overviewBody:
      "Reach for benchmark when you want real, comparable numbers instead of tune's prediction — it actually loads each model through Ollama (or LM Studio when Ollama isn't available) and runs the same fixed quality pack and repeated speed samples every time. Pass all to expand to everything installed for the active engine. Results are written as JSON evidence, and this is also what omm contribute runs in its loop.",

    optionDescriptions: [
      "One or more installed models to benchmark, by Ollama tag or LM Studio modelKey — or the single word all to expand to everything installed.",
      "Use a different versioned quality pack instead of the built-in one.",
      "Write the evidence JSON to this path instead of an auto-generated one.",
      "How many repeated speed samples to take before reporting a median.",
      "If a model's first generation attempt times out, retry once instead of deciding immediately — see the flag's own help text for the exact tradeoff.",
    ],

    exampleCaptions: [
      "Benchmark one installed model.",
      "Benchmark every model installed for the active engine.",
      "Take more speed samples for a steadier median.",
    ],

    captureFootnote:
      "Format-accurate reproduction of the real progress-line format (src/omm/cli.py:6879-6884) — not a literal capture, since a real run loads the model and generates real text through a running engine, which this page won't trigger.",

    trouble: [
      {
        why: "Benchmarking needs a running engine to load the model into, and benchmark only knows how to drive Ollama or LM Studio for this.",
        fix: "Install and start Ollama or LM Studio at least once, then retry.",
      },
      {
        why: "all expands to every installed model for the active engine — it can't be combined with other model names in the same run.",
        fix: "Pass all by itself, or list specific model names without it.",
      },
    ],

    relatedBlurbs: [
      "Run the same benchmark repeatedly, in a loop, to grow the shared dataset.",
      "Chat with a model directly instead of just measuring it.",
    ],
  },

  update: {
    metaTitle: "omm update — reinstall omm from the latest source",
    metaDescription:
      "Full reference for omm update: no flags of its own, two examples, its real up-to-date message, and the error it prints on failure.",
    heading: "omm update",
    lede: "Reinstall omm from the latest source on the current update channel, and refresh its recommendation and rules data.",
    summary: "Reinstall omm from the latest source and refresh its recommendation data.",

    overviewBody:
      "Reach for update to get the newest omm — it pulls from whichever channel omm setting version has selected (stable by default, or beta), and does nothing destructive if you're already current, just refreshing the recommendation and rules data instead. A package-managed install (Homebrew, pipx from PyPI) prints its own manager's upgrade command instead of touching anything, since update only knows how to manage a Git-source install.",

    optionDescriptions: [],

    exampleCaptions: [
      "Update to the latest commit on the current channel.",
      "Same update, without the progress output.",
    ],

    captureFootnote:
      "Format-accurate reproduction of the real up-to-date message (src/omm/cli.py:2536) — not a literal run, since update reinstalls omm itself when a newer commit exists, and this page won't trigger that on a real machine. The version and commit shown are representative, not this specific dev machine's.",

    trouble: [
      {
        why: "The underlying git pull or pipx reinstall step failed — the message includes that command's own stderr for the actual reason.",
        fix: "Read the included error for the specific cause (network, permissions, a dirty local checkout), fix that, and retry.",
      },
    ],

    relatedBlurbs: [
      "Switch which channel update pulls from.",
      "Re-run the setup wizard after updating.",
    ],
  },

  setting: {
    metaTitle: "omm setting — view or change omm's settings",
    metaDescription:
      "Full reference for omm setting: all nine subcommands, five examples, a real captured display, and the three errors it actually prints.",
    heading: "omm setting",
    lede: "View or change telemetry, upload policy, error reports, memory protection, the update channel, the color theme, calibration, and signed-catalog trust — interactively, or one subcommand at a time.",
    summary: "View or change omm's settings — telemetry, upload policy, theme, update channel, and more.",

    overviewBody:
      "Reach for setting any time you want to see or change how omm behaves outside of a single command. Bare omm setting opens an interactive menu covering the same ground as every subcommand below; each subcommand also works directly, prints a small table of its current value either way, and every write here stays local — nothing is uploaded just by changing a setting.",

    optionDescriptions: [
      "Configure where benchmark telemetry is sent, or clear it with --endpoint none.",
      "Configure whether benchmark results upload without asking, never, or ask each time.",
      "Configure the separate, opt-in policy for scrubbed crash/error reports.",
      "Configure the policy that protects a runner's memory during a long operation.",
      "Show or switch which branch omm update pulls from.",
      "Show or change omm's output color theme.",
      "Correct this machine's local speed prediction using a real Ollama-linked model — never uploaded.",
      "Require future recommendation downloads to pass Ed25519 signature verification.",
      "Show the current signed-catalog trust and rollback state.",
      "Restore the most recent different recommendation snapshot.",
    ],

    exampleCaptions: [
      "Open the interactive menu covering every setting below.",
      "Show the current color theme.",
      "Show the current benchmark-upload policy.",
      "Change the color theme directly, without the menu.",
      "Show signed-catalog trust and rollback state.",
    ],

    captureFootnote:
      "Real omm setting theme capture, 2026-08-24, this dev machine.",

    trouble: [
      {
        why: "upload and error-reports each take exactly one policy flag; this run passed more than one at once.",
        fix: "Pass only one of --enable, --disable, or --ask.",
      },
      {
        why: "Signed-catalog verification has to happen over a connection that can't be tampered with in transit — an HTTP manifest URL defeats the point of requiring a signature at all.",
        fix: "Use an HTTPS manifest URL.",
      },
      {
        why: "Memory Guard's policy only has three real values, and this run passed something else.",
        fix: "Use ask, block, or observe.",
      },
    ],

    relatedBlurbs: [
      "Re-run the wizard that sets several of these on first use.",
      "contribute reads the upload policy this command configures.",
    ],
  },
};
