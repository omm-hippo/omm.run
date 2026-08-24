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
};
