/**
 * The command-doc-page facts that are identical in every locale: options,
 * example commands, the captured terminal output, and the verbatim errors
 * with their file:line source. Prose lives in `./en.ts` and `./ko.ts` and is
 * merged onto this by index in `src/components/commands/commands.ts`.
 *
 * See design/FACTS.md, section "Command doc pages", for the product-repo
 * source behind every option, message and captured line below.
 */

/**
 * Embedded in a `capture.text` right after an interactive picker's rendered
 * screen (omm setup's runner checklist, omm recommend's model list) to mark
 * where `CommandCapture.tsx`'s typing animation holds for ~2s — as if a
 * reader were still looking at the options — before revealing the rest.
 * Absent from every other command's capture, which reveals in one step.
 */
export const PICKER_PAUSE = "@@PICKER_PAUSE@@";

export type Slug =
  | "search"
  | "install"
  | "run"
  | "recommend"
  | "contribute"
  | "setup"
  | "scan"
  | "tune"
  | "fit"
  | "help"
  | "import"
  | "uninstall"
  | "list"
  | "info"
  | "upgrade"
  | "link"
  | "autoremove"
  | "cleanup"
  | "verify"
  | "benchmark"
  | "update"
  | "setting"
  | "doctor"
  | "engine";

export const COMMAND_ORDER: readonly Slug[] = [
  "search",
  "install",
  "run",
  "recommend",
  "contribute",
  "setup",
  "scan",
  "tune",
  "fit",
  "help",
  "import",
  "uninstall",
  "list",
  "info",
  "upgrade",
  "link",
  "autoremove",
  "cleanup",
  "verify",
  "benchmark",
  "update",
  "setting",
  "doctor",
  "engine",
];

/**
 * Conservative command-level risk shown by the assistant before a reader
 * copies anything. This describes the command's normal path, not a promise
 * that every flag has the same effect. The command page remains the detailed
 * source for options and mitigations.
 */
export type CommandRisk = "inspect" | "caution" | "high-impact";

export const COMMAND_RISK = {
  search: "caution",
  install: "high-impact",
  run: "caution",
  recommend: "high-impact",
  contribute: "high-impact",
  setup: "high-impact",
  scan: "caution",
  tune: "inspect",
  fit: "inspect",
  help: "inspect",
  import: "high-impact",
  uninstall: "high-impact",
  list: "caution",
  info: "inspect",
  upgrade: "high-impact",
  link: "high-impact",
  autoremove: "high-impact",
  cleanup: "high-impact",
  verify: "caution",
  benchmark: "high-impact",
  update: "high-impact",
  setting: "high-impact",
  doctor: "inspect",
  engine: "high-impact",
} as const satisfies Record<Slug, CommandRisk>;

export type Option = {
  readonly name: string;
  readonly argument: string | null;
  readonly default: string;
};

export type Example = {
  readonly prompt: string;
  readonly command: string;
};

export type Trouble = {
  /** Verbatim message (or a real captured instance of one with a variable
   *  segment). Rendered in mono. */
  readonly see: string;
  /** Where the string comes from, shown to the reader. */
  readonly source: string;
};

export type Related = {
  readonly label: string;
  readonly href: string;
  readonly internal: boolean;
};

export const COMMAND_BASE = {
  search: {
    slug: "search",
    name: "omm search",
    href: "/commands/search",

    options: [
      { name: "<query>", argument: null, default: "required" },
      { name: "--skip-unfit", argument: null, default: "off" },
      { name: "--limit", argument: "N", default: "no limit" },
      {
        name: "--provider",
        argument: "curated | huggingface | modelscope",
        default: "all three",
      },
      { name: "--skip-ms", argument: null, default: "off" },
      { name: "--json", argument: null, default: "off" },
    ],

    examples: [
      { prompt: "$", command: "omm search qwen" },
      { prompt: "$", command: "omm search qwen --limit 3" },
      { prompt: "$", command: "omm search qwen --skip-unfit" },
      { prompt: "$", command: "omm search qwen --provider huggingface" },
      { prompt: "$", command: "omm search qwen --json | jq '.[0]'" },
    ],

    capture: {
      title: "omm search qwen",
      text: `==> DeepSeek
  [1] ms:Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-GGUF  2,438 downloads on ModelScope

==> Other
  [2] unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF  (predicted not to run on this hardware)
  [3] JonathanColetti/Qwen3.8-27B-Uncensored-GGUF  (predicted not to run on this hardware)
  [4] MaziyarPanahi/Qwen3-4B-GGUF  346,358 downloads on HuggingFace
  [5] bartowski/Qwen2.5-7B-Instruct-GGUF  309,173 downloads on HuggingFace
  [6] MaziyarPanahi/Qwen3-0.6B-GGUF  305,573 downloads on HuggingFace
  … 54 more results, across Other and Qwen

Install with: omm install <number>  (e.g. omm install 1)`,
    },

    trouble: [
      {
        see: "--provider must be one of: curated, huggingface, modelscope (got 'bogus').",
        source: "src/omm/cli.py:6320-6323",
      },
      {
        see: "--skip-ms conflicts with --provider modelscope.",
        source: "src/omm/cli.py:6326",
      },
      {
        see: "No models found matching 'zzzznonexistentmodelxyz'.",
        source: "src/omm/cli.py:6362",
      },
    ],

    related: [
      { label: "omm install", href: "/commands/install", internal: true },
      { label: "omm recommend", href: "/commands/recommend", internal: true },
    ],
  },

  install: {
    slug: "install",
    name: "omm install",
    href: "/commands/install",

    options: [
      { name: "<name>", argument: null, default: "required" },
      { name: "--skip-unfit", argument: null, default: "off" },
      { name: "--upload / --no-upload", argument: null, default: "current upload policy" },
      { name: "--force", argument: null, default: "off" },
      { name: "--verify-runtime / --no-verify-runtime", argument: null, default: "asks first" },
    ],

    examples: [
      { prompt: "$", command: "omm install mistral-7b-instruct-q4" },
      { prompt: "$", command: "omm install mistral-7b-instruct-q4 --skip-unfit" },
      { prompt: "$", command: "omm install 1" },
      { prompt: "$", command: "omm install mistral-7b-instruct-q4 --no-upload" },
      { prompt: "$", command: "omm install mistral-7b-instruct-q4 --force" },
    ],

    capture: {
      title: "omm install tinyllama-1.1b-q4",
      text: `  tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf ############ 668.8/668.8 MB 20.4 MB/s
Computing checksum...
Benchmarking...
Memory Guard blocked the load: 0.7 GB requested, 0.5 GB safely available (insufficient_live_memory, no_owned_release_available).
Ω Installed tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf
  Ollama: ollama run tinyllama-1.1b-chat-v1.0.q4_k_m
  AnythingLLM: visible in your local models list
  Uninstall with: omm uninstall tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf
  Run it now: omm run tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf`,
    },

    trouble: [
      {
        see: "Unknown model 'zzzz-totally-fake-model-name-xyz'. Use a curated name (tinyllama-1.1b-q4, llama3.1-8b-instruct-q4, mistral-7b-instruct-q4), an 'org/repo:file.gguf' ref (optionally prefixed 'hf:' or 'ms:'), or a direct URL.",
        source: "src/omm/hub.py:371",
      },
      {
        see: "Not enough disk space: /Users/you/.omm/models needs up to 5.2 GiB (central model download) but only 3.1 GiB is free.",
        source: "src/omm/cli.py:3477-3488",
      },
    ],

    related: [
      { label: "omm search", href: "/commands/search", internal: true },
      { label: "omm run", href: "/commands/run", internal: true },
    ],
  },

  run: {
    slug: "run",
    name: "omm run",
    href: "/commands/run",

    options: [
      { name: "[name]", argument: null, default: "picks interactively" },
      { name: "--engine", argument: "NAME", default: "auto-picks a linked engine" },
    ],

    examples: [
      { prompt: "$", command: "omm run" },
      { prompt: "$", command: "omm run qwen2.5-0.5b-instruct-q4_k_m.gguf" },
      { prompt: "$", command: "omm run qwen2.5-0.5b-instruct-q4_k_m.gguf --engine lmstudio" },
    ],

    capture: {
      title: "omm run qwen2.5-0.5b-instruct-q4_k_m.gguf",
      text: `qwen2.5-0.5b-instruct-q4_k_m.gguf via Ollama (interactive chat in this terminal)
Type /bye to leave the chat.
>>> What is the capital of France?
The capital of France is Paris.

>>> /bye
Chat ended.`,
    },

    trouble: [
      {
        see: "totally-fake-model-xyz is not installed via omm. See `omm list`.",
        source: "src/omm/cli.py:5536",
      },
      {
        see: "Ollama is not installed. Install it from https://ollama.com/download.",
        source: "src/omm/launcher.py:170",
      },
      {
        see: "`ollama run mistral-7b-instruct-v0.2.q4_k_m` exited with code 1. Try `omm link --engine ollama` to repair the model's Ollama link.",
        source: "src/omm/launcher.py:177-183",
      },
    ],

    related: [
      { label: "omm install", href: "/commands/install", internal: true },
      { label: "omm list", href: "https://github.com/omm-hippo/omm#usage", internal: false },
    ],
  },

  recommend: {
    slug: "recommend",
    name: "omm recommend",
    href: "/commands/recommend",

    options: [
      {
        name: "--profile",
        argument: "dedicated | balanced | minimal",
        default: "prompted; balanced with --yes/--json",
      },
      { name: "--json", argument: null, default: "off" },
      { name: "--yes", argument: null, default: "off" },
    ],

    examples: [
      { prompt: "$", command: "omm recommend" },
      { prompt: "$", command: "omm recommend --profile minimal" },
      { prompt: "$", command: "omm recommend --json" },
      { prompt: "$", command: "omm recommend --yes" },
    ],

    capture: {
      title: "omm recommend",
      text: `No externally-managed .gguf files found.
Fetched updated recommendation data from GitHub.
10 compatible models found
╭─ This PC ────────────────────────────────────────────────────────────────────╮
│ CPU  Intel(R) Core(TM) Ultra 7 155H          RAM  15.5 GB                    │
│ GPU  Intel(R) Arc(TM) Graphics               MODEL MEMORY  12.4 GB           │
╰──────────────────────────────────────────────────────────────────────────────╯
Recommended models
   MODEL                          STATUS     SPEED       MEMORY     BEST FOR
◆ Choose a model (↑↓ move · Enter select · Esc cancel)
ROWS_START(7)
ornith 1.0 9b                     BEST FIT   ~6 tok/s    ~5.9 GB    General purpose
Qwen3.5 9B                        POPULAR    ~6 tok/s    ~5.9 GB    General purpose
DeepSeek V4 Pro Qwen3.5 9B MTP    POPULAR    ~6 tok/s    ~5.9 GB    General purpose
Meta Llama 3.1 8B Instruct        OMM PICK   ~5 tok/s    ~5.3 GB    General chat
Qwen3 8B                          POPULAR    ~5 tok/s    ~5.3 GB    General purpose
Qwen3 8B                          POPULAR    ~5 tok/s    ~5.3 GB    General purpose
Qwen3VL 8B Instruct                POPULAR    ~5 tok/s    ~5.3 GB    General chat
mistral 7b instruct v0.2          OMM PICK   ~21 tok/s   ~4.6 GB    General chat
Qwen2.5 7B Instruct               POPULAR    ~21 tok/s   ~4.6 GB    General chat
Qwen2.5 VL 7B Instruct            POPULAR    ~21 tok/s   ~4.6 GB    General chat
ROWS_END
${PICKER_PAUSE}
╭─ mistral 7b instruct v0.2 ──────────────────────────────────────────────────╮
│ Curated model from OMM's default catalog.                                  │
│                                                                            │
│ ✓  Predicted to run comfortably on this PC                                │
│                                                                            │
│ PREDICTED SPEED  ~21 tok/s              MEMORY REQUIRED  ~4.6 GB          │
│                                                                            │
│ Repository  TheBloke/Mistral-7B-Instruct-v0.2-GGUF                        │
╰────────────────────────────────────────────────────────────────────────────╯
Predicted speed is an estimate; actual performance can vary by runtime settings.

  mistral-7b-instruct-v0.2.Q4_K_M.gguf ############ 4.4/4.4 GB
Verifying checksum...
Ω Installed mistral-7b-instruct-v0.2.Q4_K_M.gguf
  Ollama: ollama run mistral-7b-instruct-v0.2.q4_k_m
  LM Studio: visible in your local models list
  Jan: visible in your local models list
  Uninstall with: omm uninstall mistral-7b-instruct-v0.2.Q4_K_M.gguf
  Run it now: omm run mistral-7b-instruct-v0.2.Q4_K_M.gguf`,
    },

    trouble: [
      {
        see: "No model is predicted to run on this hardware.",
        source: "src/omm/cli.py:2916",
      },
      {
        see: "No model in the current rules fits this hardware.",
        source: "src/omm/cli.py:2952",
      },
    ],

    related: [
      { label: "omm install", href: "/commands/install", internal: true },
      { label: "omm search", href: "/commands/search", internal: true },
    ],
  },

  contribute: {
    slug: "contribute",
    name: "omm contribute",
    href: "/commands/contribute",

    options: [
      { name: "--report-errors", argument: null, default: "off" },
      { name: "--yes", argument: null, default: "off" },
    ],

    examples: [
      { prompt: "$", command: "omm contribute" },
      { prompt: "$", command: "omm contribute --yes" },
      { prompt: "$", command: "omm contribute --report-errors" },
      { prompt: "$", command: "OMM_HOME=/mnt/data/omm omm contribute --yes" },
    ],

    capture: {
      title: "omm contribute --yes",
      text: `Disk preflight passed: 129.6 GiB free on the tightest model volume. Each candidate is checked again before download.
omm contribute - before you start:
  - Downloads, benchmarks, and deletes GGUF models repeatedly until you press Esc
  - Uses real bandwidth, disk space, and compute; runs unattended (no per-model confirmation)
  - Uploads every benchmark result per your current upload policy (ask)
  - Reserves space per candidate (central GGUF + worst-case engine copy + headroom); skips anything that won't fit
  - Uses a fixed 1024-token context and 128-token batch for comparable results
  - Gates committed runtime memory before download; monitors paging and measurement stability while running
  - Defers transient memory shortages up to three times instead of losing the candidate
  - Each benchmark has a 10-minute cutoff, with a status line every 30s
Trying maziyarpanahi-qwen3-0.6b-gguf...
Memory preflight before download: committed RAM 0.27 GiB; runtime buffers 0.27 GiB; mmap-backed weights 0.45 GiB; median available 1.59 GiB; emergency reserve 0.50 GiB; estimate source gguf_header.
Predicted speed: 130.8 tok/s (range 57.3-164.4).
  Qwen3-0.6B.Q4_K_M.gguf ############ 484.2/484.2 MB 31.1 MB/s
Computing checksum...
Benchmarking...
63.6 tok/s
Local calibration updated: correction ×0.55 (the calibration stays in ~/.omm and is never uploaded).
Benchmark result uploaded.
Removed Qwen3-0.6B.Q4_K_M.gguf
Trying tinyllama-1.1b-q4...`,
    },

    trouble: [
      {
        see: "omm contribute requires benchmark uploads to be enabled. Run `omm setting upload --enable` or `--ask` first.",
        source: "src/omm/cli.py:8433-8436",
      },
      {
        see: "Neither Ollama nor LM Studio is installed or available. Install one of them, start it once, then retry `omm contribute`.",
        source: "src/omm/cli.py:8456-8459",
      },
      {
        see: "omm contribute will not start with low disk space. Keep at least 10 GiB free on every model volume before an unattended run. /Users/you/.omm/models: 3.2 GiB free.",
        source: "src/omm/cli.py:7871-7879",
      },
    ],

    related: [
      {
        label: "omm benchmark",
        href: "https://github.com/omm-hippo/omm#self-hosted-benchmark-data",
        internal: false,
      },
      {
        label: "omm setting",
        href: "https://github.com/omm-hippo/omm#update--configuration",
        internal: false,
      },
    ],
  },

  setup: {
    slug: "setup",
    name: "omm setup",
    href: "/commands/setup",

    options: [{ name: "--quiet", argument: null, default: "off" }],

    examples: [
      { prompt: "$", command: "omm setup" },
      { prompt: "$", command: "omm setup --quiet" },
    ],

    capture: {
      title: "omm setup",
      text: ` ██████╗ ███╗   ███╗███╗   ███╗
██╔═══██╗████╗ ████║████╗ ████║
██║   ██║██╔████╔██║██╔████╔██║
██║   ██║██║╚██╔╝██║██║╚██╔╝██║
╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║
 ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝
Let's get you set up.

Preview - how each kind of omm message will look:
error / warning / success / accent / muted / value / heading / label / rule

Pick a color theme for omm's output:
  light
❯ dark
  high-contrast
  no-color

                Your machine
 Field           Value
 OS              Windows 11
 CPU             Intel(R) Core(TM) Ultra 7 155H
 RAM (total)     15.5 GB
 Model budget    12.4 GB
 Free right now  8.2 GB (close other apps before running big models)
 GPU             Intel(R) Arc(TM) Graphics
 omm home        C:\\Users\\you\\.omm  (131.6 GB free)

? Install any local AI runners you'd like to use? (space to select, enter to confirm)
   - Ollama (installed)
   - LM Studio (installed)
   - Jan (installed)
 » [ ] AnythingLLM
   [ ] Msty
   [ ] text-generation-webui
   [ ] KoboldCpp
${PICKER_PAUSE}
? Install any local AI runners you'd like to use? (space to select, enter to confirm) done
Enable tab-completion for install/remove any time: \`omm --install-completion\`.

Setup complete. Run \`omm setting\` any time to change telemetry, upload, or update-channel settings.

Next: \`omm recommend\` picks a model that fits this PC and installs it, then \`omm run\` starts chatting with it.

Error reports are off unless you turn them on: \`omm setting error-reports --ask\` (see docs/error-reports.md).`,
    },

    trouble: [
      {
        see: "Engine selection requires an interactive terminal. Re-run this command from a real terminal.",
        source: "src/omm/onboarding.py:221-224",
      },
      {
        see: "AnythingLLM isn't auto-installable yet. Install it yourself, then re-run `omm setup` or `omm link`. See https://github.com/omm-hippo/omm/wiki/Compatible-Programs",
        source: "src/omm/onboarding.py:258-261",
      },
      {
        see: "Couldn't enable tab-completion automatically. Run `omm --install-completion` to set it up manually.",
        source: "src/omm/onboarding.py:303-305",
      },
    ],

    related: [
      { label: "omm recommend", href: "/commands/recommend", internal: true },
      { label: "omm engine install", href: "https://github.com/omm-hippo/omm#usage", internal: false },
    ],
  },

  scan: {
    slug: "scan",
    name: "omm scan",
    href: "/commands/scan",

    options: [{ name: "--json", argument: null, default: "off" }],

    examples: [
      { prompt: "$", command: "omm scan" },
      { prompt: "$", command: "omm scan --json" },
      { prompt: "$", command: "omm scan --quiet" },
    ],

    capture: {
      title: "omm scan",
      text: `                 omm hardware scan
 Field                   Value
 OS                      macOS 27.0
 CPU                     Apple M2
 RAM (total)             8.0 GB
 RAM (available)         1.1 GB
 Safe model budget now   0.1 GB
 Reserved for apps/OS    1.0 GB+
 omm hub storage         1.6 GB
 Saved via omm import    0.0 GB
 Memory type             Unified (Apple Silicon)
 GPU                     Apple M2

    Local AI runners
 Program      Status
 Ollama       installed
 AnythingLLM  installed
+ 5 program(s) not installed — see the compatibility list:
https://github.com/omm-hippo/omm/wiki/Compatible-Programs

                                Local AI models
 Model                           Location   Engine(s)            Managed by omm
 qwen2.5-0.5b-instruct-q4_k_m.…  (omm hub)  ollama, anythingllm  yes
 qwen1_5-1_8b-chat-q4_k_m.gguf   (omm hub)  ollama, anythingllm  yes`,
    },

    trouble: [
      {
        see: "Some omm-hub models aren't linked into an installed engine yet. Run: omm link",
        source: "src/omm/cli.py:1059-1064",
      },
      {
        see: "Found model file(s) outside the omm hub. Run: omm import",
        source: "src/omm/cli.py:1065-1069",
      },
    ],

    related: [
      { label: "omm setup", href: "/commands/setup", internal: true },
      { label: "omm list", href: "/commands/list", internal: true },
    ],
  },

  tune: {
    slug: "tune",
    name: "omm tune",
    href: "/commands/tune",

    options: [{ name: "<name>", argument: null, default: "required" }],

    examples: [
      { prompt: "$", command: "omm tune qwen2.5-0.5b-instruct-q4_k_m.gguf" },
      { prompt: "$", command: "omm tune qwen2.5-0.5b-instruct-q4_k_m.gguf --json" },
      { prompt: "$", command: "omm tune mistral-7b-instruct-q4" },
    ],

    capture: {
      title: "omm tune qwen2.5-0.5b-instruct-q4_k_m.gguf",
      text: `qwen2.5-0.5b-instruct-q4_k_m.gguf
       Recommended safe runtime profile
 Setting                    Starting value
 Context length             2,048 tokens
 GPU offload                all layers
 CPU threads                8
 Batch size                 256
 Safe model budget now      0.2 GB
 Estimated memory headroom  -0.4 GB
These are conservative starting values; benchmark before treating them as
optimal.`,
    },

    trouble: [
      {
        see: "Unknown model 'zzzz-totally-fake-model-name-xyz'. Use a curated name (tinyllama-1.1b-q4, llama3.1-8b-instruct-q4, mistral-7b-instruct-q4), an 'org/repo:file.gguf' ref (optionally prefixed 'hf:' or 'ms:'), or a direct URL.",
        source: "src/omm/hub.py:371",
      },
    ],

    related: [
      { label: "omm install", href: "/commands/install", internal: true },
      { label: "omm fit", href: "/commands/fit", internal: true },
    ],
  },

  fit: {
    slug: "fit",
    name: "omm fit",
    href: "/commands/fit",

    options: [{ name: "<name>", argument: null, default: "required" }],

    examples: [
      { prompt: "$", command: "omm fit qwen2.5-0.5b-instruct-q4_k_m.gguf" },
      { prompt: "$", command: "omm fit qwen2.5-0.5b-instruct-q4_k_m.gguf --json" },
      { prompt: "$", command: "omm fit mistral-7b-instruct-q4" },
    ],

    capture: {
      title: "omm fit qwen2.5-0.5b-instruct-q4_k_m.gguf",
      text: `╭─ qwen2.5-0.5b-instruct-q4_k_m.gguf ────────────────────────────────────────╮
│                                                                            │
│  RAM 8.0 GB  ·  APPLE M2  ·  MACOS 27.0                                    │
│                                                                            │
│                                                           0.46 GB MODEL ┃  │
│  ██████████████████████████████████████████████████████████┊██▓▓▓▓▓▓▓▓▓██  │
│  in use                                                       reserved     │
│                                                                            │
│  In use by other apps                                              6.8 GB  │
│  Reserved for apps/OS                                             1.0 GB+  │
│  Safe model budget - the smaller of the two                        0.2 GB  │
│  Install cap - 80% of total RAM                                    6.4 GB  │
│  This model - 0.46 GB file + runtime overhead                      0.5 GB  │
│                                                                            │
│  !  Fits this PC, but not right now - free 0.4 GB more (close other apps)  │
│  before running it                                                         │
│                                                                            │
╰────────────────────────────────────────────────────────────────────────────╯`,
    },

    trouble: [
      {
        see: "Could not determine the size of oversized-405b-q4_k_m.gguf (not installed, and the provider did not report a file size).",
        source: "src/omm/cli.py:5608-5611",
      },
      {
        see: "--json has no effect on `omm fit` - ignoring it.",
        source: "src/omm/cli.py global_flags decorator",
      },
    ],

    related: [
      { label: "omm tune", href: "/commands/tune", internal: true },
      { label: "omm install", href: "/commands/install", internal: true },
    ],
  },

  help: {
    slug: "help",
    name: "omm help",
    href: "/commands/help",

    options: [
      { name: "[command]", argument: null, default: "none — shows general help" },
      { name: "--all", argument: null, default: "off" },
      { name: "--flags", argument: null, default: "off" },
    ],

    examples: [
      { prompt: "$", command: "omm help" },
      { prompt: "$", command: "omm help search" },
      { prompt: "$", command: "omm help --all" },
      { prompt: "$", command: "omm help --all --flags" },
    ],

    capture: {
      title: "omm help",
      text: `Example usage:
  omm search TEXT
  omm install MODEL
  omm list
  omm recommend
  omm uninstall MODEL

Tuning & quality:
  omm tune MODEL
  omm benchmark MODEL...
  omm contribute

Maintenance:
  omm scan
  omm doctor
  omm setup
  omm engine install
  omm upgrade [MODEL]
  omm setting

Further help:
  omm help COMMAND      Show help for one command
  omm help --all        List every command
  https://github.com/omm-hippo/omm`,
    },

    trouble: [
      {
        see: "No such command 'zzzz-not-a-real-command'. See `omm help`.",
        source: "src/omm/cli.py:795-796",
      },
    ],

    related: [
      { label: "omm search", href: "/commands/search", internal: true },
      { label: "omm setup", href: "/commands/setup", internal: true },
    ],
  },

  import: {
    slug: "import",
    name: "omm import",
    href: "/commands/import",

    options: [{ name: "[path]", argument: null, default: "none — scans the usual app directories" }],

    examples: [
      { prompt: "$", command: "omm import" },
      { prompt: "$", command: "omm import ~/Downloads" },
      { prompt: "$", command: "omm import --yes" },
    ],

    capture: {
      title: "omm import ~/Downloads",
      text: `Found 1 model(s) (2 file(s), ~0.5 GB) in supported local AI apps not yet managed by omm.
? Import 1 model(s) into the omm hub? Yes
? Select which models to import:
  ❯ [x] qwen2.5-0.5b-instruct-q4_k_m.gguf (0.5 GB, found in: import)
${PICKER_PAUSE}
  Ω Imported qwen2.5-0.5b-instruct-q4_k_m.gguf
Done: 1 model(s) in the omm hub, 0.5 GB saved.`,
    },

    trouble: [
      {
        see: "No externally-managed .gguf files found.",
        source: "src/omm/cli.py:1421",
      },
      {
        see: "Not a directory: /definitely/not/a/real/directory",
        source: "src/omm/cli.py:1490",
      },
    ],

    related: [
      { label: "omm scan", href: "/commands/scan", internal: true },
      { label: "omm list", href: "/commands/list", internal: true },
    ],
  },

  uninstall: {
    slug: "uninstall",
    name: "omm uninstall",
    href: "/commands/uninstall",

    options: [
      { name: "<name> | all", argument: null, default: "required" },
      { name: "--dry-run", argument: null, default: "off" },
    ],

    examples: [
      { prompt: "$", command: "omm uninstall qwen2.5-0.5b-instruct-q4_k_m.gguf" },
      { prompt: "$", command: "omm uninstall qwen2.5-0.5b-instruct-q4_k_m.gguf --dry-run" },
      { prompt: "$", command: "omm uninstall all --dry-run" },
      { prompt: "$", command: "omm uninstall 1" },
    ],

    capture: {
      title: "omm uninstall qwen2.5-0.5b-instruct-q4_k_m.gguf --dry-run",
      text: `Would uninstall: qwen2.5-0.5b-instruct-q4_k_m.gguf`,
    },

    trouble: [
      {
        see: "zzzz-fake-model-xyz is not installed via omm. See `omm list`.",
        source: "src/omm/cli.py:5008-5013",
      },
      {
        see: "Run `omm search` or `omm list` first to install/uninstall by number.",
        source: "src/omm/cli.py:3057-3059",
      },
    ],

    related: [
      { label: "omm list", href: "/commands/list", internal: true },
      { label: "omm install", href: "/commands/install", internal: true },
    ],
  },

  list: {
    slug: "list",
    name: "omm list",
    href: "/commands/list",

    options: [{ name: "--engine", argument: "NAME", default: "every engine" }],

    examples: [
      { prompt: "$", command: "omm list" },
      { prompt: "$", command: "omm list --engine ollama" },
      { prompt: "$", command: "omm list --json" },
    ],

    capture: {
      title: "omm list",
      text: `                               omm models
 #   Filename                            Size  Links
 1   qwen2.5-0.5b-instruct-q4_k_m.gguf  0.46 GB  Ollama, AnythingLLM
 2   qwen1_5-1_8b-chat-q4_k_m.gguf      1.13 GB  Ollama, AnythingLLM`,
    },

    trouble: [
      {
        see: "--engine must be one of: anythingllm, jan, koboldcpp, lmstudio, mstystudio, ollama, textgenwebui (got 'bogus').",
        source: "src/omm/cli.py:909-911",
      },
    ],

    related: [
      { label: "omm info", href: "/commands/info", internal: true },
      { label: "omm install", href: "/commands/install", internal: true },
    ],
  },

  info: {
    slug: "info",
    name: "omm info",
    href: "/commands/info",

    options: [{ name: "<name>", argument: null, default: "required" }],

    examples: [
      { prompt: "$", command: "omm info qwen2.5-0.5b-instruct-q4_k_m.gguf" },
      { prompt: "$", command: "omm info qwen2.5-0.5b-instruct-q4_k_m.gguf --json" },
      { prompt: "$", command: "omm info 1" },
    ],

    capture: {
      title: "omm info qwen2.5-0.5b-instruct-q4_k_m.gguf",
      text: `                   qwen2.5-0.5b-instruct-q4_k_m.gguf
 Repo                 Qwen/Qwen2.5-0.5B-Instruct-GGUF
 Version              74a4da8
 Size                 0.46 GB
 Installed at         2026-08-22T11:11:59Z
 ollama verification  failed (server_unavailable)
 Ollama               ollama run qwen2.5-0.5b-instruct-q4_k_m:latest
 AnythingLLM          linked (visible in AnythingLLM)

╭─ qwen2.5-0.5b-instruct-q4_k_m.gguf ────────────────────────────────────────╮
│  RAM 8.0 GB  ·  APPLE M2  ·  MACOS 27.0                                    │
│                                                           0.46 GB MODEL ┃  │
│  ██████████████████████████████████████████████████████████┊███▓▓▓▓▓▓▓▓▓█  │
│  in use                                                        reserved    │
│  In use by other apps                                              6.9 GB  │
│  Reserved for apps/OS                                             1.0 GB+  │
│  Safe model budget - the smaller of the two                        0.1 GB  │
│  Install cap - 80% of total RAM                                    6.4 GB  │
│  This model - 0.46 GB file + runtime overhead                      0.5 GB  │
│  !  Fits this PC, but not right now - free 0.4 GB more (close other apps)  │
│     before running it                                                      │
╰────────────────────────────────────────────────────────────────────────────╯
+ 5 program(s) not installed — see the compatibility list:
https://github.com/omm-hippo/omm/wiki/Compatible-Programs`,
    },

    trouble: [
      {
        see: "zzzz-fake-model-xyz is not installed via omm. See `omm list`.",
        source: "src/omm/cli.py:5276",
      },
    ],

    related: [
      { label: "omm list", href: "/commands/list", internal: true },
      { label: "omm fit", href: "/commands/fit", internal: true },
    ],
  },

  upgrade: {
    slug: "upgrade",
    name: "omm upgrade",
    href: "/commands/upgrade",

    options: [
      { name: "[name] | all", argument: null, default: "all installed models" },
      { name: "--dry-run", argument: null, default: "off" },
    ],

    examples: [
      { prompt: "$", command: "omm upgrade" },
      { prompt: "$", command: "omm upgrade qwen2.5-0.5b-instruct-q4_k_m.gguf --dry-run" },
      { prompt: "$", command: "omm upgrade --dry-run" },
    ],

    capture: {
      title: "omm upgrade --dry-run",
      text: `Would check for updates: qwen2.5-0.5b-instruct-q4_k_m.gguf
Would check for updates: qwen1_5-1_8b-chat-q4_k_m.gguf`,
    },

    trouble: [
      {
        see: "zzzz-fake-model-xyz is not installed via omm. See `omm list`.",
        source: "src/omm/cli.py:5676",
      },
    ],

    related: [
      { label: "omm list", href: "/commands/list", internal: true },
      { label: "omm install", href: "/commands/install", internal: true },
    ],
  },

  link: {
    slug: "link",
    name: "omm link",
    href: "/commands/link",

    options: [
      { name: "[directory]", argument: null, default: "none — repairs known app links" },
      { name: "--engine", argument: "NAME", default: "every engine" },
      { name: "--force", argument: null, default: "off" },
    ],

    examples: [
      { prompt: "$", command: "omm link" },
      { prompt: "$", command: "omm link --engine ollama" },
      { prompt: "$", command: "omm link ~/my-runner/models" },
    ],

    capture: {
      title: "omm link",
      text: `1 model(s) relinked/verified. 0 skipped (conflict). 0 skipped (file missing).`,
    },

    trouble: [
      {
        see: "--engine must be one of: anythingllm, jan, koboldcpp, lmstudio, mstystudio, ollama, textgenwebui (got 'bogus').",
        source: "src/omm/cli.py:909-911",
      },
      {
        see: "--engine only applies without a directory argument.",
        source: "src/omm/cli.py:6501-6502",
      },
    ],

    related: [
      { label: "omm scan", href: "/commands/scan", internal: true },
      { label: "omm install", href: "/commands/install", internal: true },
    ],
  },

  autoremove: {
    slug: "autoremove",
    name: "omm autoremove",
    href: "/commands/autoremove",

    options: [],

    examples: [
      { prompt: "$", command: "omm autoremove" },
      { prompt: "$", command: "omm autoremove --quiet" },
    ],

    capture: {
      title: "omm autoremove",
      text: `Removed 2 broken Ollama link(s), 1 broken AnythingLLM link(s).`,
    },

    trouble: [
      {
        see: "No broken symlinks found.",
        source: "src/omm/cli.py:6689",
      },
    ],

    related: [
      { label: "omm cleanup", href: "/commands/cleanup", internal: true },
      { label: "omm scan", href: "/commands/scan", internal: true },
    ],
  },

  cleanup: {
    slug: "cleanup",
    name: "omm cleanup",
    href: "/commands/cleanup",

    options: [],

    examples: [
      { prompt: "$", command: "omm cleanup" },
      { prompt: "$", command: "omm cleanup --quiet" },
    ],

    capture: {
      title: "omm cleanup",
      text: `Cleaned up 2 incomplete install file(s).`,
    },

    trouble: [
      {
        see: "No leftover install files found.",
        source: "src/omm/cli.py:6706",
      },
    ],

    related: [
      { label: "omm autoremove", href: "/commands/autoremove", internal: true },
      { label: "omm install", href: "/commands/install", internal: true },
    ],
  },

  verify: {
    slug: "verify",
    name: "omm verify",
    href: "/commands/verify",

    options: [
      { name: "<name>", argument: null, default: "required" },
      { name: "--engine", argument: "ollama | lmstudio", default: "auto-picks" },
      { name: "--keep-loaded", argument: null, default: "off" },
      { name: "--yes / -y", argument: null, default: "off" },
    ],

    examples: [
      { prompt: "$", command: "omm verify qwen2.5-0.5b-instruct-q4_k_m.gguf" },
      { prompt: "$", command: "omm verify qwen2.5-0.5b-instruct-q4_k_m.gguf --engine ollama --yes" },
      { prompt: "$", command: "omm verify qwen2.5-0.5b-instruct-q4_k_m.gguf --keep-loaded" },
    ],

    capture: {
      title: "omm verify qwen2.5-0.5b-instruct-q4_k_m.gguf",
      text: `Verifying qwen2.5-0.5b-instruct-q4_k_m.gguf with Ollama...
Compatible: local text generation succeeded (already loaded and preserved).`,
    },

    trouble: [
      {
        see: "zzzz-fake-model-xyz is not installed via omm. See `omm list`.",
        source: "src/omm/cli.py:5157",
      },
      {
        see: "--engine must be ollama or lmstudio.",
        source: "src/omm/cli.py:5081-5163",
      },
    ],

    related: [
      { label: "omm run", href: "/commands/run", internal: true },
      { label: "omm install", href: "/commands/install", internal: true },
    ],
  },

  benchmark: {
    slug: "benchmark",
    name: "omm benchmark",
    href: "/commands/benchmark",

    options: [
      { name: "<name>...", argument: null, default: "required, or 'all'" },
      { name: "--pack", argument: "PATH", default: "the built-in pack" },
      { name: "--output", argument: "PATH", default: "an auto-generated path" },
      { name: "--speed-runs", argument: "1-10", default: "3" },
      { name: "--confirm-performance-timeout", argument: null, default: "off" },
    ],

    examples: [
      { prompt: "$", command: "omm benchmark qwen2.5-0.5b-instruct-q4_k_m.gguf" },
      { prompt: "$", command: "omm benchmark all" },
      { prompt: "$", command: "omm benchmark qwen2.5-0.5b-instruct-q4_k_m.gguf --speed-runs 5" },
    ],

    capture: {
      title: "omm benchmark qwen2.5-0.5b-instruct-q4_k_m.gguf",
      text: `  Benchmarking qwen2.5-0.5b-instruct-q4_k_m:latest (1/1)  0:00:24
                     Localfit reproducible quality evidence
 Model                   Parameters  Quantization      Quality       Speed
 qwen2.5-0.5b-instruc…   0.5B        Q4_K_M        1/8 (12.5%)  54.7 tok/s

Saved reproducible local evidence to ~/.omm/evaluations/quality-20260825T042436Z.json.
No generated text is stored. v8 telemetry includes a CPU/GPU generation score
(never the model name), plus CPU architecture and core counts. Not a leaderboard.
Summary: 1 succeeded, 0 model_unfit, 0 performance_unfit, 0 transient_error`,
    },

    trouble: [
      {
        see: "Neither Ollama nor LM Studio is installed or available. Install one of them, start it once, then retry `omm benchmark`.",
        source: "src/omm/cli.py:6825-6827",
      },
      {
        see: "`all` must be the only argument.",
        source: "src/omm/cli.py:6820",
      },
    ],

    related: [
      { label: "omm contribute", href: "/commands/contribute", internal: true },
      { label: "omm run", href: "/commands/run", internal: true },
    ],
  },

  update: {
    slug: "update",
    name: "omm update",
    href: "/commands/update",

    options: [],

    examples: [
      { prompt: "$", command: "omm update" },
      { prompt: "$", command: "omm update --quiet" },
    ],

    capture: {
      title: "omm update",
      text: `omm is already up to date - v0.2.148 (7860ded)`,
    },

    trouble: [
      {
        see: "Update failed:",
        source: "src/omm/cli.py:2542-2544",
      },
    ],

    related: [
      { label: "omm setting", href: "/commands/setting", internal: true },
      { label: "omm setup", href: "/commands/setup", internal: true },
    ],
  },

  setting: {
    slug: "setting",
    name: "omm setting",
    href: "/commands/setting",

    options: [
      { name: "setting telemetry --endpoint URL", argument: null, default: "not configured" },
      { name: "setting upload --enable|--disable|--ask", argument: null, default: "ask" },
      { name: "setting error-reports --enable|--disable|--ask", argument: null, default: "never" },
      {
        name: "setting memory-guard --policy ask|block|observe --poll-seconds N --low-memory-seconds N",
        argument: null,
        default: "show current values",
      },
      { name: "setting version --stable|--beta", argument: null, default: "stable" },
      { name: "setting theme --set NAME", argument: null, default: "dark" },
      { name: "setting calibrate [name]", argument: null, default: "smallest Ollama model" },
      { name: "setting catalog-trust --manifest-url URL --public-key KEY", argument: null, default: "unset" },
      { name: "setting catalog-status", argument: null, default: "—" },
      { name: "setting catalog-rollback", argument: null, default: "—" },
    ],

    examples: [
      { prompt: "$", command: "omm setting" },
      { prompt: "$", command: "omm setting theme" },
      { prompt: "$", command: "omm setting upload" },
      { prompt: "$", command: "omm setting theme --set dark" },
      { prompt: "$", command: "omm setting catalog-status" },
    ],

    capture: {
      title: "omm setting theme --set high-contrast",
      text: `       Color theme
 Theme  high-contrast`,
    },

    trouble: [
      {
        see: "Choose only one of --enable, --disable, or --ask.",
        source: "src/omm/cli.py:5798",
      },
      {
        see: "The signed catalog manifest must use HTTPS.",
        source: "src/omm/cli.py:6104",
      },
      {
        see: "--policy must be ask, block, or observe.",
        source: "src/omm/cli.py:5901",
      },
    ],

    related: [
      { label: "omm setup", href: "/commands/setup", internal: true },
      { label: "omm contribute", href: "/commands/contribute", internal: true },
    ],
  },

  doctor: {
    slug: "doctor",
    name: "omm doctor",
    href: "/commands/doctor",

    options: [{ name: "--json", argument: null, default: "off" }],

    examples: [
      { prompt: "$", command: "omm doctor" },
      { prompt: "$", command: "omm doctor --json" },
      { prompt: "$", command: "omm doctor --quiet" },
    ],

    capture: {
      title: "omm doctor",
      text: `                                   omm doctor
 Status  Check                                          Detail
 PASS    installation                                    omm 0.2.146; source=git; command=~/.local/bin/omm; module=~/.omm-src/src/omm/cli.py
 PASS    command                                          ~/.local/bin/omm -> ~/.local/bin/omm
 PASS    editable source                                  ~/.omm-src
 PASS    source commit                                    7860dedf19fa
 WARN    version agreement                                package metadata=0.2.146; editable source=0.2.170
 PASS    pipx                                              pipx 1.16.7 at /opt/homebrew/bin/pipx
 PASS    registry                                          2 registered model(s) at ~/.omm/models.json
 PASS    Ollama installation                               detected at /usr/local/bin/ollama
 PASS    Ollama server                                     reachable; version=0.32.14
 PASS    Ollama tag: qwen2.5-0.5b-instruct-q4_k_m.gguf     stored=qwen2.5-0.5b-instruct-q4_k_m; runtime=qwen2.5-0.5b-instruct-q4_k_m:latest; present in /api/tags
 PASS    Ollama tag: qwen1_5-1_8b-chat-q4_k_m.gguf         stored=qwen1_5-1_8b-chat-q4_k_m; runtime=qwen1_5-1_8b-chat-q4_k_m:latest; present in /api/tags
Overall: WARN (10 pass, 1 warn, 0 fail)`,
    },

    trouble: [
      {
        see: "Overall: FAIL (N pass, N warn, 1 fail)",
        source: "src/omm/cli.py:2513-2514",
      },
    ],

    related: [
      { label: "omm scan", href: "/commands/scan", internal: true },
      { label: "omm setup", href: "/commands/setup", internal: true },
    ],
  },

  engine: {
    slug: "engine",
    name: "omm engine install",
    href: "/commands/engine",

    options: [{ name: "[engine]", argument: null, default: "none — interactive checklist" }],

    examples: [
      { prompt: "$", command: "omm engine install" },
      { prompt: "$", command: "omm engine install lmstudio" },
      { prompt: "$", command: "omm engine install ollama --yes" },
    ],

    capture: {
      title: "omm engine install lmstudio",
      text: `Installing LM Studio...
Downloading llmster 0.0.21-2 Darwin arm64
##################################################### 100.0%
Verifying checksum...
Installing llmster...
Installation finished successfully! llmster is ready to launch.
To start the daemon, run:

    lms daemon up

LM Studio installed successfully.`,
    },

    trouble: [
      {
        see: "LM Studio is already installed.",
        source: "src/omm/cli.py:1109-1111",
      },
      {
        see: "engine must be one of: anythingllm, jan, koboldcpp, lmstudio, mstystudio, ollama, textgenwebui (got 'bogus').",
        source: "src/omm/cli.py:1104-1108",
      },
    ],

    related: [
      { label: "omm setup", href: "/commands/setup", internal: true },
      { label: "omm scan", href: "/commands/scan", internal: true },
    ],
  },
} as const satisfies Record<
  Slug,
  {
    slug: Slug;
    name: string;
    href: string;
    options: readonly Option[];
    examples: readonly Example[];
    capture: { title: string; text: string };
    trouble: readonly Trouble[];
    related: readonly Related[];
  }
>;

export type CommandBase = typeof COMMAND_BASE;
