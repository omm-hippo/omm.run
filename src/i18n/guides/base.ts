/**
 * The parts of the three per-OS install guides that are the same in every
 * language: commands, shell prompt samples, dependency links, captured output,
 * runner names, the verbatim messages the installer prints, and the file:line
 * each message traces to.
 *
 * Prose lives in `./en.ts` and `./ko.ts` and is merged onto this by index in
 * `src/components/install/guides.ts`, so a command exists exactly once no
 * matter how many languages the site ships.
 *
 * Every string below traces to the omm product repo — see design/FACTS.md,
 * section "Install guide pages", for the file and line behind each one.
 */

export type Slug = "windows" | "macos" | "linux";

export const GUIDE_ORDER: readonly Slug[] = ["windows", "macos", "linux"];

const RAW = "https://omm.run";

const PYTHON_DOWNLOADS = {
  label: "python.org/downloads",
  href: "https://www.python.org/downloads/",
} as const;
const GIT_DOWNLOADS = {
  label: "git-scm.com/downloads",
  href: "https://git-scm.com/downloads",
} as const;

/** Shared by all three guides: the PyPI route, which is identical everywhere
 *  except for the shell prompt glyph. */
const pypiCommands = (prompt: string) =>
  [
    { prompt, command: "python -m pip install omm-model" },
    { prompt, command: "pipx install omm-model" },
  ] as const;

export const GUIDE_BASE = {
  windows: {
    slug: "windows",
    os: "Windows",
    href: "/install/windows",
    app: {
      samples: [
        { sample: "PS C:\\Users\\you>", ok: true },
        { sample: "C:\\Users\\you>", ok: false },
        { sample: "you@PC MINGW64 ~$", ok: false },
      ],
    },
    before: {
      requirements: [
        { label: "Python 3.10+", links: [PYTHON_DOWNLOADS] },
        { label: "git", links: [GIT_DOWNLOADS] },
        {
          label: "winget",
          links: [
            {
              label: "winget documentation",
              href: "https://learn.microsoft.com/en-us/windows/package-manager/winget/",
            },
            PYTHON_DOWNLOADS,
            GIT_DOWNLOADS,
          ],
        },
        { label: "Windows baseline", links: null },
        { label: "NVIDIA extra", links: null },
      ],
    },
    install: {
      command: {
        prompt: "PS >",
        command: `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; irm ${RAW}/install.ps1 | iex`,
      },
      alts: [{ commands: pypiCommands("PS >") }],
    },
    after: {
      steps: [
        { step: "01", command: null },
        { step: "02", command: { prompt: "PS >", command: "omm" } },
        { step: "03", command: { prompt: "PS >", command: "omm scan" } },
      ],
      capture: {
        title: "omm scan --no-color, Windows 11",
        text: `                      omm hardware scan
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
+ 6 program(s) not installed`,
      },
      /** Field names as `omm scan` prints them — never translated. */
      scanFields: null,
    },
    runners: {
      rows: [
        { runner: "Ollama", automated: true },
        { runner: "LM Studio", automated: true },
        { runner: "Jan", automated: true },
        { runner: "KoboldCpp", automated: true },
        { runner: "text-generation-webui", automated: true },
        { runner: "AnythingLLM", automated: true },
        { runner: "Msty", automated: true },
      ],
    },
    keeping: {
      storageCommands: [
        {
          prompt: "PS >",
          command:
            '[Environment]::SetEnvironmentVariable("OMM_HOME", "D:\\omm", "User")',
        },
        { prompt: "PS >", command: '$env:OMM_HOME = "D:\\omm"' },
      ],
      completionCommand: {
        prompt: "PS >",
        command: "omm --install-completion powershell",
      },
      uninstallCommand: {
        prompt: "PS >",
        command: `irm ${RAW}/uninstall.ps1 | iex`,
      },
    },
    trouble: [
      {
        see: "sh : The term 'sh' is not recognized as the name of a cmdlet, function, script file, or operable program.",
        source: "README, Install section — two separate installer commands",
      },
      {
        see: "Windows detected. Run the native PowerShell installer instead:",
        source: "install.sh:27-32",
      },
      {
        see: "'irm' is not recognized as an internal or external command, operable program or batch file.",
        source: "README, Install section — the command is PowerShell-only",
      },
      {
        see: "Invoke-RestMethod : The request was aborted: Could not create SSL/TLS secure channel.",
        source: "install.ps1:1-5 (header comment); README Windows caveat",
      },
      {
        see: "Python not found. Install Python 3.10+ first: https://www.python.org/downloads/",
        source: "install.ps1:220",
      },
      {
        see: "git not found. Install git first (needed to fetch omm from GitHub): https://git-scm.com/downloads",
        source: "install.ps1:232 and install.ps1:237",
      },
      {
        see: "git 2.34+ is required to verify SSH commit signatures (found git version 2.30.0).",
        source: "install.ps1:105",
      },
      {
        see: "Signature verification failed - refusing to install untrusted code.",
        source: "install.ps1:585",
      },
      { see: "git clone failed.", source: "install.ps1:561" },
      {
        see: "Refusing to replace pipx environment 'omm': it is not an omm install this installer recognises. Run 'pipx uninstall omm', then re-run this installer.",
        source: "install.ps1:536-538",
      },
      {
        see: "Refusing to replace an unverified omm-model pipx environment.",
        source: "install.ps1:546",
      },
      {
        see: "Refusing unsafe OMM_HOME: C:\\Users\\you",
        source: "install.ps1:13",
      },
      {
        see: "omm : The term 'omm' is not recognized as the name of a cmdlet …",
        source: "PowerShell — the new PATH from this install has not loaded into the current session yet",
      },
      {
        see: "Refusing unrecognized custom OMM_HOME (missing .omm-managed): D:\\omm",
        source: "uninstall.ps1:21",
      },
    ],
  },

  macos: {
    slug: "macos",
    os: "macOS",
    href: "/install/macos",
    app: {
      samples: [
        { sample: "you@Mac ~ %", ok: true },
        { sample: "you@Mac:~$", ok: true },
        { sample: "$", ok: true },
      ],
    },
    before: {
      requirements: [
        {
          label: "Python 3.10+",
          links: [PYTHON_DOWNLOADS, { label: "brew.sh", href: "https://brew.sh" }],
        },
        { label: "git", links: [GIT_DOWNLOADS] },
        { label: "pipx", links: null },
      ],
    },
    install: {
      command: { prompt: "$", command: `curl -fsSL ${RAW}/install.sh | sh` },
      alts: [
        {
          commands: [
            { prompt: "$", command: "brew install omm-hippo/omm/omm" },
            { prompt: "$", command: "brew upgrade omm-hippo/omm/omm" },
            { prompt: "$", command: "brew uninstall omm-hippo/omm/omm" },
          ],
        },
        { commands: pypiCommands("$") },
      ],
    },
    after: {
      steps: [
        { step: "01", command: null },
        { step: "02", command: { prompt: "$", command: "omm" } },
        { step: "03", command: { prompt: "$", command: "omm scan" } },
      ],
      capture: null,
      scanFields: [
        "OS",
        "CPU",
        "RAM (total)",
        "RAM (available)",
        "Safe model budget now",
        "Reserved for apps/OS",
        "GPU",
        "VRAM",
      ],
    },
    runners: {
      rows: [
        { runner: "Ollama", automated: true },
        { runner: "LM Studio", automated: true },
        { runner: "Jan", automated: true },
        { runner: "AnythingLLM", automated: true },
        { runner: "Msty", automated: true },
        { runner: "KoboldCpp", automated: true },
        { runner: "text-generation-webui", automated: true },
      ],
    },
    keeping: {
      storageCommands: [
        { prompt: "$", command: "export OMM_HOME=/mnt/models/omm" },
      ],
      completionCommand: { prompt: "$", command: "omm --install-completion zsh" },
      uninstallCommand: {
        prompt: "$",
        command: `curl -fsSL ${RAW}/uninstall.sh | sh`,
      },
    },
    trouble: [
      {
        see: "Nothing at all. The command returns immediately and no omm appears.",
        source: "README, Install section — the curl flags in the command itself",
      },
      {
        see: "Python 3.10+ not found after dependency bootstrap: https://www.python.org/downloads/",
        source: "install.sh:272",
      },
      {
        see: "git not found after dependency bootstrap (needed to fetch omm from GitHub).",
        source: "install.sh:277",
      },
      {
        see: "git 2.34+ is required to verify SSH commit signatures (found git version 2.30.0).",
        source: "install.sh:81",
      },
      {
        see: "Homebrew installation failed. Install it manually from https://brew.sh/ and rerun this installer.",
        source: "install.sh:205",
      },
      {
        see: "Signature verification failed - refusing to install untrusted code.",
        source: "install.sh:596",
      },
      { see: "error: externally-managed-environment", source: "install.sh:513-519" },
      {
        see: "Could not inspect existing pipx environments; refusing an unsafe migration.",
        source: "install.sh:543",
      },
      {
        see: "Refusing to replace unrelated pipx environment 'omm'. Remove or rename that environment manually first.",
        source: "install.sh:551",
      },
      {
        see: "Refusing to replace an unverified omm-model pipx environment.",
        source: "install.sh:561",
      },
      { see: "zsh: command not found: omm", source: "install.sh:494-509" },
      {
        see: "Refusing non-absolute OMM_HOME: models/omm",
        source: "install.sh:11",
      },
      {
        see: "Homebrew not found - install manually from https://docs.anythingllm.com/installation-desktop/overview",
        source: "src/omm/linker.py:2612-2616",
      },
      {
        see: "Refusing unrecognized custom OMM_HOME (missing .omm-managed): /Volumes/Models/omm",
        source: "uninstall.sh:42",
      },
    ],
  },

  linux: {
    slug: "linux",
    os: "Linux",
    href: "/install/linux",
    app: {
      samples: [
        { sample: "you@host:~$", ok: true },
        { sample: "you@host ~ %", ok: true },
        { sample: "root@host:~#", ok: true },
      ],
    },
    before: {
      requirements: [
        { label: "Python 3.10+", links: [PYTHON_DOWNLOADS] },
        { label: "git", links: [GIT_DOWNLOADS] },
        { label: "python3-venv", links: null },
        { label: "openSUSE, other distributions", links: null },
        { label: "root or sudo", links: null },
      ],
    },
    install: {
      command: { prompt: "$", command: `curl -fsSL ${RAW}/install.sh | sh` },
      alts: [{ commands: pypiCommands("$") }],
    },
    after: {
      steps: [
        { step: "01", command: null },
        { step: "02", command: { prompt: "$", command: "omm" } },
        { step: "03", command: { prompt: "$", command: "omm scan" } },
      ],
      capture: null,
      scanFields: [
        "OS",
        "CPU",
        "RAM (total)",
        "RAM (available)",
        "Safe model budget now",
        "Reserved for apps/OS",
        "GPU",
        "VRAM",
      ],
    },
    runners: {
      rows: [
        { runner: "Ollama", automated: true },
        { runner: "LM Studio", automated: true },
        { runner: "Jan", automated: true },
        { runner: "KoboldCpp", automated: true },
        { runner: "text-generation-webui", automated: true },
        { runner: "AnythingLLM", automated: false },
        { runner: "Msty", automated: false },
      ],
    },
    keeping: {
      storageCommands: [
        { prompt: "$", command: "export OMM_HOME=/mnt/models/omm" },
      ],
      completionCommand: { prompt: "$", command: "omm --install-completion bash" },
      uninstallCommand: {
        prompt: "$",
        command: `curl -fsSL ${RAW}/uninstall.sh | sh`,
      },
    },
    trouble: [
      {
        see: "Nothing at all. The command returns immediately and no omm appears.",
        source: "README, Install section — the curl flags in the command itself",
      },
      {
        see: "Python 3.10+ not found and no supported package manager was found.",
        source: "install.sh:245-248",
      },
      {
        see: "git not found and no supported package manager was found.",
        source: "install.sh:261-263",
      },
      {
        see: "Python venv support is missing, installing pip/venv support...",
        source: "install.sh:289",
      },
      {
        see: "git 2.34+ is required to verify SSH commit signatures (found git version 2.30.0).",
        source: "install.sh:81",
      },
      {
        see: "Signature verification failed - refusing to install untrusted code.",
        source: "install.sh:596",
      },
      {
        see: "Could not inspect existing pipx environments; refusing an unsafe migration.",
        source: "install.sh:543",
      },
      {
        see: "Refusing to replace unrelated pipx environment 'omm'. Remove or rename that environment manually first.",
        source: "install.sh:551",
      },
      {
        see: "Refusing to replace an unverified omm-model pipx environment.",
        source: "install.sh:561",
      },
      { see: "bash: omm: command not found", source: "install.sh:494-509" },
      {
        see: "Refusing non-absolute OMM_HOME: models/omm",
        source: "install.sh:11",
      },
      {
        see: "flatpak not found - install manually from https://jan.ai/download",
        source: "src/omm/linker.py:2625-2628",
      },
      {
        see: "Refusing unrecognized custom OMM_HOME (missing .omm-managed): /mnt/models/omm",
        source: "uninstall.sh:42",
      },
    ],
  },
} as const;

export type GuideBase = typeof GUIDE_BASE;
