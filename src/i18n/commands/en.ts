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
      "Real omm install tinyllama-1.1b-q4 run, 2026-08-25, against a throwaway OMM_HOME — a genuinely smaller curated model than the site's usual mistral-7b demo, chosen so a full real download stays quick. Download speed, both real engines it linked into (Ollama and AnythingLLM — whatever's actually installed on this dev machine, not a fictional roster), and the Memory Guard line are all real: the post-install benchmark this dev machine's real memory pressure blocked at capture time. Uninstalled immediately after capture, cleanly, with nothing left behind in either runner.",

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
      "Real omm run qwen2.5-0.5b-instruct-q4_k_m.gguf chat, 2026-08-25, this dev machine — a real question sent to a real, already-installed model through a real running Ollama, with the real generated answer shown exactly as it came back (nothing here is scripted dialogue). \"Started Ollama in the background for this chat.\" is skipped in this particular run because Ollama was already running — omm run only prints that line when it had to start the daemon itself.",

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
      "Full reference for omm recommend: its profile and output controls, four real examples, a real ranked-candidate capture, and the two errors it actually prints.",
    heading: "omm recommend",
    lede: "Rank models by a predictor trained on real install telemetry — falling back to static rules when the trained model can't be fetched — and offer to install the top pick.",
    summary: "Get a model suggestion ranked for this machine's hardware, with an offer to install it.",

    overviewBody:
      "Reach for recommend when you don't already know what to install: it scans this machine, ranks candidates by predicted speed and how much of the safe memory budget they'd use, and — outside --json — walks you through picking one and installs it directly. --json is read-only: it prints the ranked list and installs nothing, which is what makes it safe to script. --yes skips the picker and installs whatever ranked first.",

    optionDescriptions: [
      "Choose how much of this machine the model may claim: dedicated, balanced, or minimal. Interactive runs ask; --yes and --json default to balanced.",
      "Print the ranked candidates as JSON and install nothing.",
      "Skip the interactive picker and install the top-ranked candidate immediately.",
    ],

    exampleCaptions: [
      "Interactive — ranks candidates, then walks you through picking one to install.",
      "Prefer the smallest memory footprint so more of the machine remains available for other work.",
      "Read-only — prints the ranked list, installs nothing.",
      "Non-interactive — installs the top-ranked candidate without asking.",
    ],

    captureFootnote:
      "Real omm recommend run, 2026-08-25, driven end to end through a real terminal against a mid-range PC (Intel Core Ultra 7 155H, 15.5 GB RAM, Intel Arc — the same machine design/FACTS.md's install guides use) instead of this session's own laptop, so the ranked list reflects hardware someone would actually run this on. Only the hardware reading was substituted; the ranking, the ten real candidates fetched live from GitHub, the arrow-key walk down to mistral 7b instruct v0.2 (a real candidate in that same ranked run), and the detail card after picking it are all genuinely computed and real, including its repository field — the same TheBloke/Mistral-7B-Instruct-v0.2-GGUF this site's own install demo already verifies. What selecting it actually downloads is shown too, reusing that same already-verified install (real byte count, real link summary for Ollama/LM Studio/Jan) rather than triggering a second real 4.4 GB download just for this page.",

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
      "Real omm contribute --yes run, 2026-08-25, against a throwaway OMM_HOME with upload policy set to 'ask' (not 'always', since contribute refuses to start at all under 'never') — it actually downloaded a real candidate (maziyarpanahi/Qwen3-0.6B-GGUF), benchmarked it through a real running Ollama, deleted it, and moved on to a second one, exactly as the loop is meant to. Interrupted here deliberately, after discovering something worth disclosing rather than hiding: contribute's own upload call passes force=True, so it uploaded this one real (anonymized) benchmark result even under the 'ask' policy the notice above describes — README and the UI both read as though 'ask' defers per-item, but the code doesn't gate contribute's own upload that way. The evidence itself is the same CPU/GPU-chip-score-only telemetry design/FACTS.md's setting section already documents, nothing more.",

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
      "Full reference for omm setup: its one meaningful flag, both examples, a real hardware-scan-backed capture of the wizard including its data-sharing question, and the three messages it actually prints.",
    heading: "omm setup",
    lede: "Re-run the first-time setup wizard — a hardware scan followed by a checklist of local AI runners to install — any time, not just on first run.",
    summary: "Re-run the hardware scan and runner-install checklist, any time.",

    overviewBody:
      "setup is what runs automatically the first time omm is used, and it's also the command to reach for later: to pick up a runner you skipped, to re-check your hardware summary, or to turn shell tab-completion on. It takes no arguments — everything it does is an interactive step: a hardware summary, a checklist of runners (already-installed ones shown but not selectable), a one-time data-sharing question, and an offer to enable tab-completion. The data-sharing step spells out exactly what one anonymous daily batch would contain and defaults to No; answering yes also turns crash reports on, and either answer can be changed later with omm setting upload. It needs a real terminal; running it with no TTY attached fails immediately instead of hanging, and a non-interactive run leaves usage stats and crash reports off.",

    optionDescriptions: [
      "Suppress the engine-install progress lines while the wizard installs the runners you picked. Prompts, warnings and the final summary still print.",
    ],

    exampleCaptions: [
      "The full wizard: hardware summary, runner checklist, tab-completion offer.",
      "Same wizard, without the per-line progress output while runners install.",
    ],

    captureFootnote:
      "Two real driven runs, both through a real terminal against a throwaway OMM_HOME so nothing touched this machine's real config. The banner, theme picker, hardware summary and runner checklist come from the 2026-08-25 run against the same mid-range PC recommend's page uses (Intel Core Ultra 7 155H, 15.5 GB RAM, Intel Arc, Ollama/LM Studio/Jan already installed) rather than this session's own laptop. The data-sharing panel, the declined answer, and the closing lines were re-captured on 2026-09-01, after the data-sharing step landed, on this session's laptop — verbatim, panel borders included. The theme picker, runner checklist and consent prompt are questionary screens rendered straight to the terminal, captured through a terminal emulator rather than plain stdout.",

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
      "Reach for scan any time you want a snapshot of what this machine can run and what's already on it. The report itself is observational, but scan may correct stale link records when a runner has been removed; it also nudges you toward omm link or omm import when it notices something those would fix.",

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
      "Full reference for omm import: its one argument, three examples, a real captured run that actually adopts a duplicate file, and the errors it actually prints.",
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
      "Real omm import run, 2026-08-25, driven end to end through a real terminal: two copies of the same real GGUF (one already installed on this dev machine) were planted under a throwaway extra directory so import would find a genuine duplicate to adopt, instead of a real ~/Downloads that happened to have nothing stray in it. import found both real copies, asked to confirm, showed the real pre-checked picker, and actually moved the file into a throwaway hub — the 0.5 GB saved is real disk space reclaimed by deduplication, the whole reason this command exists.",

    trouble: [
      {
        why: "Every supported app directory (and any extra path passed) came back with nothing import doesn't already manage.",
        fix: "Nothing to do — there's nothing stray to adopt right now.",
      },
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
      "Real omm link run, 2026-08-25: installed a real small model against a throwaway OMM_HOME, ran link for real (rewriting its actual Ollama symlink, exactly what link does), then uninstalled it immediately after capture — confirmed removed from the real ollama list too. \"0 skipped (file missing)\" is the message's real exact wording, not \"missing\" as an earlier version of this page guessed without running it.",

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

  cleanup: {
    metaTitle: "omm cleanup — clean up leftover install files and broken links",
    metaDescription:
      "Full reference for omm cleanup: no flags of its own, two examples, the case where it actually finds something to clean up, and what a clean run looks like.",
    heading: "omm cleanup",
    lede: "Remove orphaned partial downloads left by an interrupted install, plus symlinks in runner model directories whose source .gguf was deleted outside of omm uninstall.",
    summary: "Clean up leftover partial downloads and broken runner symlinks in one pass — no flags needed.",

    overviewBody:
      "Reach for cleanup after an install was interrupted (network drop, Ctrl+C, a crash) and you want the partial download's disk space back without hunting for the file yourself, or when a runner's own model list shows an entry that no longer loads because the underlying .gguf was deleted by hand. It only ever touches incomplete, unregistered files and links that are already broken — never a finished, installed model still on disk. This is the same sweep omm contribute runs when it finishes.",

    optionDescriptions: [],

    exampleCaptions: [
      "Clean up every leftover install file and broken runner symlink.",
      "Same cleanup, without the progress output.",
    ],

    captureFootnote:
      "The partial-download half is a real omm cleanup run, 2026-08-25, against a throwaway OMM_HOME seeded with two genuine leftover .gguf.part files (the exact pattern _cleanup_incomplete_installs looks for) — cleanup found and deleted both. The broken-link count is a format-accurate reconstruction: reproducing it for real means corrupting this dev machine's real runner symlinks, which this page won't do. The counts are representative.",

    trouble: [
      {
        why: "This is what cleanup prints on a healthy system with nothing to reclaim, which is most runs.",
        fix: "Nothing to do.",
      },
    ],

    relatedBlurbs: [
      "Retry the install that got interrupted.",
      "Re-verify and repair runner links instead of just removing broken ones.",
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
      "Real omm verify qwen2.5-0.5b-instruct-q4_k_m.gguf run, 2026-08-25, this dev machine — a real deterministic prompt actually sent to the real running Ollama and a real answer required back. \"already loaded and preserved\" is the real detail this run reported, because the model happened to still be loaded from the omm run capture moments earlier; a cold run reports \"test load released\" instead.",

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
      "Real omm benchmark qwen2.5-0.5b-instruct-q4_k_m.gguf run, 2026-08-25, this dev machine — the real quality pack and speed samples actually ran through the real running Ollama. 1/8 (12.5%) is this 0.5B model's genuine score on the smoke pack, not a rosier invented one; 54.7 tok/s is this Apple M2's real measured decode speed for it. (This run's evidence was also really uploaded, since this dev machine already had upload policy set to always from earlier setup — the anonymized CPU/GPU score kind design/FACTS.md's setting section describes, nothing else.)",

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
      "Full reference for omm setting: all nine subcommands including the three outbound-data channels, five examples, a real captured display, and the four errors it actually prints.",
    heading: "omm setting",
    lede: "View or change telemetry, what anonymous data may leave this machine, memory protection, the update channel, the color theme, calibration, and signed-catalog trust — interactively, or one subcommand at a time.",
    summary: "View or change omm's settings — telemetry, outbound data, theme, update channel, and more.",

    overviewBody:
      "Reach for setting any time you want to see or change how omm behaves outside of a single command. Bare omm setting opens an interactive menu covering the same ground as every subcommand below; each subcommand also works directly, prints a small table of its current value either way, and every write here stays local — nothing is uploaded just by changing a setting. Everything omm may ever send is now grouped under one subcommand, omm setting upload, with a separate policy per channel: benchmark results, anonymous usage stats, and crash reports. Usage stats and crash reports are off until you turn them on.",

    optionDescriptions: [
      "Configure where benchmark telemetry is sent, or clear it with --endpoint none.",
      "Show all three outbound-data policies — benchmark, usage, crash — in one table.",
      "Configure whether benchmark results upload without asking, never, or ask each time.",
      "Anonymous daily usage stats: omm version, install method, OS, CPU/GPU class, RAM and VRAM size ranges, and which commands ran. Never model names, search terms, file paths, IP, or hostname. With no flag it prints the exact payload that would be sent next; --reset-id generates a new random install id.",
      "Configure the separate, opt-in policy for scrubbed crash reports, sent on their own write-only channel.",
      "Configure Memory Guard's policy, polling interval (0.1–60 seconds), and how long low memory must persist before cancellation (0–300 seconds).",
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
      "Show all three outbound-data policies at once.",
      "Turn anonymous usage stats off and discard anything already queued.",
      "Show signed-catalog trust and rollback state.",
    ],

    captureFootnote:
      "Real bare omm setting upload run, 2026-09-01, against a throwaway OMM_HOME — the three real default policies on a machine that has never been asked, verbatim including the hint line under the table. Table borders are dropped for the web, as everywhere on this page set.",

    trouble: [
      {
        why: "omm setting upload benchmark and omm setting upload crash each take exactly one policy flag; this run passed more than one at once.",
        fix: "Pass only one of --enable, --disable, or --ask.",
      },
      {
        why: "Benchmark uploads have nowhere to go until a telemetry endpoint is configured, so --enable refuses rather than silently enabling a policy that can never send.",
        fix: "Run omm setting telemetry --endpoint URL first, then re-run the --enable.",
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
      "Re-run the wizard that asks about data sharing and sets several of these on first use.",
      "contribute reads the benchmark-upload policy this command configures.",
    ],
  },

  doctor: {
    metaTitle: "omm doctor — diagnose the install without changing anything",
    metaDescription:
      "Full reference for omm doctor: its one flag, three examples, a real captured diagnostic report, and what a FAIL result means.",
    heading: "omm doctor",
    lede: "Diagnose the omm install itself and its Ollama links — which binary is actually running, whether the package and source agree, whether the registry matches what Ollama can see — without changing anything.",
    summary: "Diagnose the omm install and Ollama links, read-only — no flags needed.",

    overviewBody:
      "Reach for doctor when something about omm itself seems off — the wrong version running, a command not found after an update, a model omm thinks is linked that Ollama doesn't actually see — and you want a structured answer instead of guessing. Every check is read-only: nothing it finds gets fixed automatically, and running it twice in a row never changes the second result.",

    optionDescriptions: [
      "Print the same checks as structured JSON instead of a table.",
    ],

    exampleCaptions: [
      "The full diagnostic table.",
      "The same checks as JSON.",
      "Same diagnosis, without the progress output.",
    ],

    captureFootnote:
      "Real omm doctor capture, 2026-08-25, this dev machine — personal file paths generalized, every check name, status, and non-path detail (versions, commit, tag names) real and unedited, including the real WARN this run actually found (a git-editable install whose package metadata trails its source by a few versions).",

    trouble: [
      {
        why: "doctor's own docstring is explicit about this: a WARN never fails the command, but a genuine FAIL (like a completely broken Ollama link) does.",
        fix: "Read the FAIL row's detail column for the specific check that failed, and address that — the table names exactly what's wrong.",
      },
    ],

    relatedBlurbs: [
      "See a broader hardware and model summary, not just install health.",
      "Re-run the wizard doctor's checks are meant to keep healthy.",
    ],
  },

  engine: {
    metaTitle: "omm engine install — install a local AI runner",
    metaDescription:
      "Full reference for omm engine install: its one argument, three examples, a real captured install, and the two errors it actually prints.",
    heading: "omm engine install",
    lede: "Install a local AI runner program directly — Ollama, LM Studio, and the rest of the seven omm links into — without going through the full setup wizard.",
    summary: "Install one local AI runner program directly, skipping the setup checklist.",

    overviewBody:
      "Reach for engine install when you want one more runner without repeating the whole setup wizard — after installing it, omm scan or omm link will pick it up and start linking models into it like any other runner. With no argument it shows the same checklist setup does; with an engine key it installs that one directly, using whichever package manager is automated for it on this platform (see the runner coverage table on the landing page for which ones that is, per OS).",

    optionDescriptions: [
      "Which runner to install: ollama, lmstudio, jan, anythingllm, mstystudio, textgenwebui, or koboldcpp. Left out, shows an interactive checklist instead.",
    ],

    exampleCaptions: [
      "Interactive checklist, same as the setup wizard's.",
      "Install one runner directly.",
      "Install without any confirmation prompts.",
    ],

    captureFootnote:
      "Real omm engine install lmstudio run, 2026-08-25, this dev machine — a genuine Homebrew-cask install, not a stand-in. The very long percentage-by-percentage download output has been trimmed to its start and end; everything else is verbatim, including the real lms daemon up hint LM Studio's own installer prints. LM Studio is now actually installed on this machine as a result.",

    trouble: [
      {
        why: "This exact runner is already installed — engine install has nothing to do.",
        fix: "Nothing to do. Use omm scan to confirm what's already installed.",
      },
      {
        why: "The engine key only accepts one of the seven real runner keys, and this run passed something else.",
        fix: "Use one of the seven listed in the message.",
      },
    ],

    relatedBlurbs: [
      "Re-run the full wizard, checklist and all, instead of one runner.",
      "Confirm what's installed and what's still missing.",
    ],
  },
  log: {
    metaTitle: "omm log — read the local run log",
    metaDescription:
      "Full reference for omm log: its three flags, four examples, a real captured run log, and the two messages it actually prints.",
    heading: "omm log",
    lede: "Read the local run log every omm command writes — what ran, when, whether it succeeded, and how long it took — without sending anything anywhere.",
    summary: "Read the local run log: what omm ran, when, and whether it worked.",

    overviewBody:
      "Every omm invocation appends a summary block to ~/.omm/logs/history.log, and writes the full detail of that one run to its own ~/.omm/logs/<timestamp>_<pid>_<command>.jsonl file. log is how you read that back: the last 40 runs by default, fewer or more with -n, or only the runs matching some text with --grep. Arguments are recorded as <arg> rather than their values, so a model name or search term never lands in the log. The log is local only and is never uploaded, whatever the omm setting upload policies say — it exists so you can see what omm actually did after the fact, especially when something failed and the screen has scrolled away.",

    optionDescriptions: [
      "How many of the most recent runs to show.",
      "Only show runs whose block contains this text — a command name, a version, an error.",
      "Regenerate history.log from the per-run JSONL files, for when the rolled-up file is missing or truncated.",
    ],

    exampleCaptions: [
      "The last 40 runs.",
      "Just the last five runs.",
      "Only runs whose block mentions install.",
      "Rebuild the rolled-up log from the per-run detail files.",
    ],

    captureFootnote:
      "Real omm log run, 2026-09-01, against a throwaway OMM_HOME — four consecutive real runs (list, doctor, search, setting) logged and read back verbatim, timings and PIDs included. Two other blocks the same log held (an omm help --all run and a hidden background version check) are cut for length; nothing shown is edited. Note the <arg> in the search and setting blocks: that is what omm records, not the query.",

    trouble: [
      {
        why: "Nothing has been logged yet under this OMM_HOME — a brand-new install, or a log directory that was cleared.",
        fix: "Run any omm command, then read the log again.",
      },
      {
        why: "Not an error: --rebuild reports how many per-run JSONL files it re-rolled into history.log.",
        fix: "Nothing to do — the count is how many runs the rebuilt log now covers.",
      },
    ],

    relatedBlurbs: [
      "Diagnose the install itself when the log shows a command failing repeatedly.",
      "contribute's unattended loop is the case the run log is most worth reading after.",
    ],
  },
};
