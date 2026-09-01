/**
 * English copy for everything outside the per-OS install guides (those live in
 * `src/i18n/guides/`). This file is the shape both locales are checked
 * against — see `src/i18n/dictionaries/ko.ts`.
 *
 * Only prose belongs here. Commands, shell prompts, runner and product names,
 * captured output, file paths and the mono coverage chips stay in the
 * components, because they read the same in every language.
 *
 * Rich bodies are written as segment lists: a plain string is text, and
 * `{ code: "…" }` is an inline `<code>` run, so a translator can move the code
 * around inside the sentence without touching JSX.
 */

export const en = {
  meta: {
    title: "omm — Open source Model Manager",
    description:
      "omm is an apt/brew-style package manager for local LLMs (GGUF). It installs models into a central hub, links them into seven local AI runners automatically, and can recommend a model that fits your hardware.",
  },

  ui: {
    copy: "copy",
    copied: "copied",
    /** `{what}` is the command or platform being copied. */
    copyAria: "Copy: {what}",
  },

  nav: {
    /** Aligned with the section anchors in `Nav.tsx`. */
    sections: ["Problem", "Features", "Runners"],
    installGuides: "Guide",
    commands: "Commands",
    assistant: "OMM AI assistant",
    github: "GitHub",
    install: "Install",
    menu: "menu",
    close: "close",
    language: "Language",
  },

  hero: {
    eyebrow: "MIT · Python 3.10+ · Windows, macOS, Linux",
    heading: "One GGUF on disk. Linked into every runner automatically.",
    lede: "One copy of each model on disk, linked into Ollama, LM Studio, Jan, AnythingLLM, Msty, KoboldCpp and text-generation-webui — and checked against your free memory before it downloads anything.",
    cta: "Install omm",
    assistantCta: "Find the right command",
  },

  terminal: {
    a11y:
      "Terminal recording. omm scan reports the machine and three installed runners; " +
      "omm install downloads a 4.37 GB quantised Mistral 7B and links it; " +
      "omm list shows the single file linked into Ollama, LM Studio and Jan.",
    footnote:
      "4.37 GB decimal = 4.07 GiB — omm list labels GiB as GB; bug filed upstream.",
  },

  problem: {
    label: "The state of the disk",
    heading: "Four runners. Four copies. 17.5 GB of the same weights.",
    body: "Every runner ships its own models directory and downloads into it. Nothing on disk records that these four files are byte-identical, so nothing ever removes three of them.",
    total: "4 copies · 1 distinct file · 13.11 GB recoverable",
    caption: "Paths as omm resolves them on Linux",
  },

  features: {
    hub: {
      eyebrow: "One hub",
      title: "One file on disk. Seven runners think they own it.",
      body: [
        "omm writes the GGUF once into ",
        { code: "~/.omm/models" },
        " and links it into every runner directory it can resolve on the machine. Runners that are not installed are skipped rather than guessed at, and Windows falls back from hard link to symlink to an owned copy with a free-space check.",
      ],
    },
    localfit: {
      eyebrow: "Localfit",
      title: "It checks whether the model fits before it spends your bandwidth.",
      body: [
        "A scan reads total RAM, live availability and GPU memory, then holds back 10% of total RAM — never less than 1 GB — for the OS and the apps opened after the scan. The safe budget is whichever is smaller: what is left after that subtraction, or 80% of total RAM. Rerunning the scan re-derives both.",
      ],
    },
    benchmarks: {
      eyebrow: "Benchmarks",
      title: "Eight problems, fixed seed, median of repeated samples.",
      body: [
        "The quality pack is versioned and bilingual, runs through Ollama at temperature 0, and grades one number per item against a known answer. Generated text is never stored, and the result it reports is a median over repeated samples rather than a single lucky pass.",
      ],
    },
    catalogs: {
      eyebrow: "Signed catalogs",
      title: "Every catalog it replaces is kept, hash and all.",
      body: [
        { code: "catalog-trust" },
        " pins an Ed25519 public key and a manifest URL, and refuses any recommendation artifact whose hash or signature does not match. The replaced snapshot is archived under its own sha256, so ",
        { code: "catalog-rollback" },
        " puts the previous catalog back.",
      ],
    },
  },

  featureVisuals: {
    link: {
      alt: "One GGUF in the omm hub, linked into three installed runner directories; four more runner directories are not installed.",
      linked: "linked",
      skipped: "not installed — skipped",
    },
    budget: {
      caption: "RAM 15.5 GB · Intel Core Ultra 7 155H · Windows 11",
      model: "4.37 GB model",
      inUse: "In use by other apps",
      reserve: "Reserved for apps/OS",
      budget: "Safe model budget — the smaller of the two",
      cap: "Install cap — 80% of total RAM",
    },
    bench: {
      caption:
        "localfit-gsm8k-bilingual-smoke, pack version 1.1.0 — all eight items",
      footnote:
        "localfit-gsm8k-bilingual-smoke 1.1.0 · temperature 0, seed 0, Ollama only. Eight items. Not a leaderboard.",
    },
    catalog: {
      footnote: [
        "A mismatched hash aborts with ",
        { code: "catalog artifact hash does not match manifest" },
        " and the file on disk is left alone.",
      ],
    },
  },

  runners: {
    label: "7 runners · 3 platforms",
    heading: "omm links into these seven. It does not replace any of them.",
    body: "Where a platform has a package manager omm can drive, installation is automated. Everywhere else omm still links the model into the runner you installed yourself.",
    columns: {
      runner: "Runner",
      automated: "Automated on",
      manual: "Manual elsewhere",
    },
    /** One per row of `ROWS` in `Runners.tsx`; `—` where there is no gap. */
    manual: [
      "—",
      "—",
      "wherever that package manager isn't installed",
      "Linux, ARM Windows",
      "Linux, ARM Windows",
      "Intel Mac, other architectures",
      "ARM Linux/Windows",
    ],
  },

  install: {
    label: "Install",
    heading:
      "One line. It verifies the signed commit before it installs anything.",
    lede: "Requires Python 3.10+ on Windows 10 22H2 or later, macOS, or Linux. The script bootstraps whatever is missing, then installs omm as an isolated pipx CLI.",
    whatItDoes: "What the installer does",
    /** README "Supported platforms" — the three things the one-liner does. */
    steps: [
      {
        title: "staging clone",
        body: "The release is cloned into a versioned staging directory, never over the copy you are currently running.",
      },
      {
        title: "signed commit verified",
        body: "The staged commit is checked against a bootstrap trust anchor before any of it is executed.",
      },
      {
        title: "pipx switch",
        body: "Only after that does pipx switch to the staged tree, so omm stays an isolated CLI.",
      },
    ],
    tabs: {
      aria: "Install method",
      /** `{what}` is fed into `ui.copyAria`, matching the guide pages' pattern. */
      copyAria: "the {what} install command",
      needThemFirst: "Need them first?",
      methods: {
        curl: "curl",
        irm: "irm",
        brew: "Homebrew",
        pipx: "pipx",
      },
      curl: {
        notes: [
          "Open a new shell afterward so your PATH picks up omm.",
          "Requires Python 3.10+. On macOS the script uses Homebrew — bootstrapping it first if it is missing — to install Python and git; on Linux it installs them through whichever supported package manager is present (apt-get, dnf, yum, pacman or apk), and on an unsupported distribution it checks for Python 3.10+ and git and stops if they are missing.",
        ],
      },
      irm: {
        notes: [
          "This must run before irm: script-internal TLS settings are too late for its first download.",
          "Open a new PowerShell window afterward so your PATH picks up omm.",
          "Requires Python 3.10+. The script bootstraps Python and git via winget when they are missing.",
        ],
      },
      brew: {
        notes: ["macOS · Homebrew Tap"],
      },
      pipx: {
        notes: [
          "Any OS via PyPI, no signature verification — the distribution is omm-model, the command stays omm",
        ],
      },
      /** `{os}` is the guide's OS name. */
      guideLink: "{os} install guide",
    },
  },

  footer: {
    tagline: "MIT · Python 3.10+ · Windows, macOS, Linux",
    aria: "Footer",
    docs: {
      title: "Docs",
      links: [
        "Windows install guide",
        "macOS install guide",
        "Linux install guide",
        "README",
        "Supported platforms",
        "Storage location",
        "Scripting",
        "Compatible programs",
      ],
    },
    /** Command names are never translated, so this column has a title only. */
    commands: { title: "Commands" },
    project: {
      title: "Project",
      links: [
        "Contributing",
        "Code of conduct",
        "Security policy",
        "Third-party notices",
        "License",
      ],
    },
    source: {
      title: "Source",
      links: ["Repository", "Issues", "Releases", "Wiki"],
    },
    license: "MIT license",
    /** `{sha}` is the build's commit short-SHA, injected by Vercel. */
    build: "build {sha}",
  },

  installChooser: {
    metaTitle: "Install omm",
    metaDescription:
      "Pick your operating system for a step-by-step omm install guide: which terminal application to open, the exact command, what the installer verifies, and what every error message means.",
    label: "Install",
    heading: "Pick the system you are installing on.",
    lede: "Each guide starts by naming the exact application to open, because the install command for one system does not run on another. After that: the command, what it verifies before installing anything, what to run first, and every message the installer can print with what to do about it.",
    shortcut: [
      "Already comfortable at a terminal? The one-line commands are on the ",
      "landing page",
      ".",
    ],
  },

  guide: {
    /** Index rail and the eyebrow above each section head. */
    sections: [
      "Which app to open",
      "Before you start",
      "Install",
      "What the installer does",
      "After install",
      "Runners on this system",
      "Storage, completion, uninstall",
      "If something goes wrong",
    ],
    breadcrumbAria: "Breadcrumb",
    onThisPage: "On this page",
    notThisOne: "not this one — ",
    /** `{os}` is the guide's OS name. */
    installCommandAria: "the {os} install command",
    verificationBody:
      "The one-line installer is not a plain download-and-run. It does three things in order, and it stops at the second one if the code it fetched is not the code omm signed.",
    verificationNote:
      "Do not replace this with an unverified git clone plus pipx install if commit authenticity matters to you.",
    scanReports: "omm scan reports",
    runnersHeading: "Runners on {os}",
    linkingHeading: "How omm exposes a model here",
    storageHeading: "Where models are stored",
    storageAria: "set OMM_HOME",
    completionHeading: "Shell completion",
    completionAria: "install shell completion",
    uninstallHeading: "Uninstall",
    uninstallAria: "uninstall omm",
    troubleBody:
      "Every message below is one the installer, the uninstaller or the shell actually prints. Find yours, read why it happened, then do the last line.",
    troubleWhy: "why",
    troubleFix: "what to do",
    troubleSource: "source",
    stillStuck:
      "Still stuck? Open an issue with the exact message you saw and the output of omm scan.",
    elsewhere: "Elsewhere",
    installOn: "Install on {os}",
    repo: {
      title: "Source and README",
      body: "github.com/omm-hippo/omm — issues, releases, and the installer scripts quoted on this page.",
    },
    wiki: {
      title: "Wiki",
      body: "Compatible programs and the longer-form documentation.",
    },
  },

  commandsChooser: {
    metaTitle: "omm commands",
    metaDescription:
      "Full reference pages for omm's commands: every flag, real examples from basic to scripted, a real captured run, and the errors each one actually prints.",
    label: "Commands",
    heading: "Pick the command you want the full reference for.",
    lede: "Each page covers what the command is for and when to reach for it, every flag, five real examples, a real captured run, and the errors it actually prints with what to do about them.",
    searchPlaceholder: "Filter commands by name or what they do",
    /** `{query}` is what was typed into the filter box. */
    searchEmpty: "No commands match “{query}”.",
    /** Purpose buckets, in the order they appear. Keys match `COMMAND_GROUP`. */
    groups: {
      start: "Get a model running",
      models: "Manage installed models",
      hardware: "Check hardware & fit",
      quality: "Measure quality & speed",
      maintenance: "Fix & maintain",
      config: "Configure omm",
    },
  },

  assistant: {
    metaTitle: "OMM AI assistant",
    metaDescription:
      "Describe an omm installation, diagnosis, model, or runner task and get a command selected from the verified omm reference.",
    label: "OMM AI assistant",
    heading: "Describe the task. Get the verified command.",
    lede:
      "This is a narrow guide for omm installation, diagnosis, models, and runners — not a general chatbot. Workers AI can only select an allowed command ID; it cannot invent or run shell code.",
    scope: "Names, options, risks, examples, and links come from the official static command docs.",
    formLabel: "What do you need omm to do?",
    placeholder:
      "For example: LM Studio is installed, but omm does not find it. What should I check?",
    submit: "Find a command",
    submitting: "Checking the command reference…",
    counter: "{count} / {max}",
    privacy:
      "Do not paste API keys, tokens, passwords, private paths, model names, or terminal output containing personal data. A question may be processed by Workers AI.",
    quickLabel: "Try a focused question",
    quickQuestions: [
      "Why is an installed runner not detected?",
      "Which command finds a model that fits this computer?",
      "How do I remove unused model files safely?",
    ],
    resultLabel: "Verified command reference",
    clarifyLabel: "A little more detail is needed",
    fallbackLabel: "Command search fallback",
    source: {
      "workers-ai": "Selection: Workers AI classifier",
      deterministic: "Selection: deterministic fallback",
    },
    messages: {
      matched: "This documented command is the closest match for the task you described.",
      ambiguous:
        "More than one documented command may fit. Compare these candidates or add one concrete detail.",
      no_match:
        "No documented command was a confident match. Continue with the complete command search.",
      sensitive_input:
        "The question may contain private or secret information, so it was not sent for classification. Remove it and try again.",
      unsafe_input:
        "URLs are not opened or trusted, so this question was kept out of the classifier. Remove the URL and try again.",
      openai_model_ambiguous:
        "OMM manages downloadable local GGUF models, not hosted OpenAI API models such as GPT-4. If you mean the open-weight gpt-oss family, include ‘gpt-oss’ or the exact model name.",
      rate_limited:
        "This connection has reached the app limit of 10 model-backed questions per 10 minutes. No retry was attempted; wait for the window to reset or use regular command search.",
      daily_cap:
        "The daily inference cap has been reached. Use the regular command search.",
      not_configured:
        "Model classification is not configured here. Use the deterministic command search.",
      provider_unavailable:
        "The classifier is unavailable. No retry was attempted; use the regular command search.",
      invalid_response:
        "The classifier response did not match the safe command-ID contract, so it was discarded.",
      invalid_request:
        "The question could not be accepted. Shorten it and remove any private or secret information.",
    },
    example: "Documented example",
    options: "Options in the reference",
    moreOptions: "+{count} more",
    changeCheck: "Before running",
    risk: {
      inspect: {
        label: "Inspection",
        description: "Focused on reading or explaining local state.",
      },
      caution: {
        label: "Caution",
        description: "May use the network, start a runtime, or refresh local registry state.",
      },
      "high-impact": {
        label: "High impact",
        description: "May download, change settings, remove local data, or upload results.",
      },
    },
    changeNote:
      "This classification and the example come from the static omm docs. Read the full reference for option-level effects.",
    openReference: "Open full command reference",
    searchAll: "Search all commands",
    askAgain: "Ask another question",
    turnLimit: "Three questions reached. Start over to ask another.",
    empty:
      "Write a focused question about installing omm, diagnosing it, managing a model, or using a runner.",
    tooShort: "Add a little more detail so the command can be narrowed down.",
    unavailable:
      "The assistant is unavailable or its response could not be verified. Use the regular command search instead.",
  },

  commands: {
    breadcrumbAria: "Breadcrumb",
    onThisPage: "On this page",
    sections: [
      "Overview",
      "Options",
      "Examples",
      "A real run",
      "Related commands",
      "If something goes wrong",
    ],
    optionsIntro: "Every flag this command accepts, and what it defaults to when you leave it out.",
    optionsColumns: { flag: "Flag", argument: "Argument", default: "Default" },
    examplesIntro: "From a plain search to something you'd put in a script.",
    /** `{command}` is the captured command, e.g. "omm search qwen --limit 5". */
    captureAria: "Terminal recording of {command}",
    troubleBody:
      "Every message below is one this command actually prints. Find yours, read why it happened, then do the last line.",
    troubleWhy: "why",
    troubleFix: "what to do",
    troubleSource: "source",
    stillStuck: "Still stuck? Open an issue with the exact message you saw.",
    elsewhere: "All commands",
  },
} as const;
