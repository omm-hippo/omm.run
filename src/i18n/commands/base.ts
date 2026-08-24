/**
 * The command-doc-page facts that are identical in every locale: options,
 * example commands, the captured terminal output, and the verbatim errors
 * with their file:line source. Prose lives in `./en.ts` and `./ko.ts` and is
 * merged onto this by index in `src/components/commands/commands.ts`.
 *
 * See design/FACTS.md, section "Command doc pages", for the product-repo
 * source behind every option, message and captured line below.
 */

export type Slug = "search" | "install" | "run" | "recommend" | "contribute" | "setup";

export const COMMAND_ORDER: readonly Slug[] = [
  "search",
  "install",
  "run",
  "recommend",
  "contribute",
  "setup",
];

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
      title: "omm install mistral-7b-instruct-q4",
      text: `  mistral-7b-instruct-v0.2.Q4_K_M.gguf ############ 4.4/4.4 GB
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
Started Ollama in the background for this chat.
Type /bye to leave the chat.

[ ...interactive chat with Ollama, not reproduced here... ]

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
      { name: "--json", argument: null, default: "off" },
      { name: "--yes", argument: null, default: "off" },
    ],

    examples: [
      { prompt: "$", command: "omm recommend" },
      { prompt: "$", command: "omm recommend --json" },
      { prompt: "$", command: "omm recommend --yes" },
    ],

    capture: {
      title: "omm recommend",
      text: `10 compatible models found
╭─ This PC ────────────────────────────────────────────────────────────────────╮
│ CPU  Apple M2                                                                │
│ RAM  8.0 GB                                                                  │
│ GPU  Apple M2  ·  8.0 GB                                                     │
│ MODEL MEMORY  6.4 GB                                                         │
╰──────────────────────────────────────────────────────────────────────────────╯
Recommended models
   MODEL                                        STATUS     SPEED        BEST FOR
 ❯ ornith 1.0 9b                                 BEST FIT   ~14 tok/s    General purpose
   Qwen3.5 9B                                    POPULAR    ~14 tok/s    General purpose
   … 8 more, ↑↓ move · Enter select · Esc cancel`,
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
      title: "omm contribute",
      text: `omm contribute - before you start:
  - Downloads, benchmarks, and deletes GGUF models repeatedly until you press Esc
  - Uses real bandwidth, disk space, and compute; runs unattended (no per-model confirmation)
  - Uploads every benchmark result per your current upload policy (ask)
  - Reserves space per candidate (central GGUF + worst-case engine copy + headroom); skips anything that won't fit
  - Uses a fixed 1024-token context and 128-token batch for comparable results
  - Gates committed runtime memory before download; monitors paging and measurement stability while running
  - Defers transient memory shortages up to three times instead of losing the candidate
  - Each benchmark has a 10-minute cutoff, with a status line every 30s
Start contributing compute now? [y/N]`,
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

                Your machine
 Field           Value
 OS              macOS 27.0
 CPU             Apple M2
 RAM (total)     8.0 GB
 Model budget    6.4 GB
 Free right now  0.4 GB (close other apps before running big models)
 GPU             Apple M2
 omm home        /Users/you/.omm  (147.3 GB free)

[ ...interactive runner checklist, then an optional tab-completion prompt, not reproduced here... ]`,
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
