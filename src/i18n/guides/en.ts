/**
 * English prose for the three per-OS install guides.
 *
 * Nothing here is paraphrased from memory: every claim traces to the omm
 * product repo through design/FACTS.md, section "Install guide pages".
 */

import type { GuideTextSet } from "@/i18n/guides/shape";

const PYPI_ALT = {
  heading: "Or install the package",
  body: "There is also a plain package install from PyPI. It skips the signed-commit check that the script above performs, and it is the right choice if you already manage your Python tooling.",
  captions: [
    null,
    "For an isolated command-line installation, pipx is recommended",
  ],
  notes: [
    "The distribution name is omm-model; the installed command and Python import remain omm.",
    "Upgrade and remove it with the same tool that installed it: python -m pip install --upgrade omm-model, or pipx upgrade omm-model. Both preserve downloaded models and settings under OMM_HOME.",
    "This does not go through the signed-commit verification described above; it relies on PyPI's own account security and TLS, the same trust model as installing any other PyPI package.",
    "omm update only updates a canonical omm Git-source installation. On a pip or pipx install it changes nothing and prints the matching package manager command instead. The Git-only beta channel is likewise unavailable to package-managed installations.",
  ],
} as const;

const AFTER_BODY =
  "The installer's last line is Done. If 'omm' isn't found, open a new shell (pipx just updated your PATH). Take that literally.";

const SETUP_STEP_BODY = (os: string) =>
  `A bare omm on a fresh install starts the setup wizard: a hardware summary, then a checklist of local AI runners. Checking one that omm can install on ${os} runs its official installer with live progress; checking one it cannot automate here prints a link instead. You can re-run it any time with omm setup.`;

const SCAN_STEP = {
  title: "check what omm sees",
  body: "omm scan prints the hardware, runner and model summary it will base every fit decision on.",
} as const;

const SCAN_RUNNERS_ROW = "Local AI runners — one row per runner, with its status";

const WIZARD_LISTS_INSTALLED =
  "Every runner already installed is listed in the wizard too, marked as installed rather than hidden, so the checklist always reflects what omm actually detects.";

const MANUAL_MEANS =
  "Manual here means only that the wizard will not run the vendor's installer for you; it prints the download link, and once the app exists omm detects and links it like any other runner.";

const LMSTUDIO_NOTE =
  "Ollama's own model location follows OLLAMA_MODELS. LM Studio follows its home pointer; set OMM_LMSTUDIO_MODELS_DIR when LM Studio uses a custom directory omm cannot discover.";

const UNINSTALL_BODY =
  "This removes the omm command and the installer-managed source checkouts. Downloaded models and settings under OMM_HOME are preserved.";

const UNINSTALL_MARKS =
  "Installers mark custom homes so uninstallers can refuse ambiguous or unsafe locations, and shell profiles are never rewritten during uninstall.";

const UNINSTALL_PYPI =
  "If you installed from PyPI instead, use python -m pip uninstall omm-model or pipx uninstall omm-model. Both preserve models and settings.";

const OLD_GIT = {
  why: "Your git is too old to check SSH commit signatures. The installer treats cannot verify exactly like a bad signature.",
} as const;

const BAD_SIGNATURE = {
  why: "The staged commit was not signed by a key in the installer's trust anchor — or git could not check the signature at all, as in the previous entry.",
  fix: "Update git and retry. If it still fails, do not work around it with a plain git clone: open an issue on the repository instead.",
} as const;

const UNRELATED_PIPX = {
  why: "An unrelated PyPI project also called omm already owns that pipx environment. The installer will not overwrite someone else's tool.",
  fix: "Run pipx uninstall omm if you do not need that other tool, or rename its environment, then run the install command again.",
} as const;

const UNVERIFIED_PIPX = {
  why: "An omm-model pipx environment exists but does not look like one omm created.",
  fix: "Run pipx uninstall omm-model, then run the install command again.",
} as const;

const UNRECOGNIZED_HOME = {
  why: "You are uninstalling with a custom OMM_HOME that the installer never marked as its own, so the uninstaller cannot prove the folder is safe to touch.",
  fix: "Check that OMM_HOME points at the folder omm actually installed into, then run the uninstaller again.",
} as const;

const CURL_SILENT = {
  why: "curl -fsSL is deliberately quiet: -s hides its progress and errors, -f makes it exit silently on an HTTP error. A blocked network or a proxy therefore looks like nothing happening.",
  fix: "Download the script on its own first so you can read the error, then run it: curl -fL https://omm.run/install.sh -o install.sh && sh install.sh",
} as const;

const PIPX_UNINSPECTABLE = {
  why: "pipx list --json did not return usable output, so the installer cannot tell what it would be replacing. It stops instead of guessing.",
  fix: "Check that pipx runs on its own (python3 -m pipx list), repair it if not, then run the install command again.",
} as const;

export const GUIDES_EN: GuideTextSet = {
  /* ====================================================================== */
  /* Windows                                                                */
  /* ====================================================================== */
  windows: {
    metaTitle: "Install omm on Windows",
    metaDescription:
      "Step-by-step omm install for Windows: which PowerShell window to open, the exact command with its TLS pre-line, what the installer verifies, and what to do about every error the installer can print.",
    heading: "Install omm on Windows",
    lede: "The whole install is one line, but it has to run in the right program. This page names that program, gives you the command, and lists the messages the installer can print with what each one means.",
    summary:
      "PowerShell, the TLS pre-line, winget bootstrapping, and the hard-link-then-symlink-then-copy strategy.",

    app: {
      heading: "Open PowerShell",
      body: "omm's Windows installer is a PowerShell script. It cannot run in Command Prompt, and it cannot run in Git Bash or a WSL shell — those are Unix shells and do not understand PowerShell commands.",
      open: [
        "Press the Windows key, type PowerShell, and open Windows PowerShell. Either Windows PowerShell 5.1 (built into Windows) or PowerShell 7 works.",
        "Windows Terminal is fine as a window, but check the tab: open the arrow next to the plus sign and pick Windows PowerShell or PowerShell, not Command Prompt.",
        "You do not need to run as Administrator to install omm.",
      ],
      samplesIntro:
        "If you are not sure what you have open, look at the prompt at the start of the line.",
      samples: [
        "PowerShell — this is the one you want",
        "Command Prompt — the install command will not work here",
        "Git Bash — the install command will not work here",
      ],
      notes: [
        "Windows 10 22H2 or Windows 11 is the supported baseline, because that is what Ollama requires on Windows.",
      ],
    },

    before: {
      body: "The installer fetches what it needs, but two of those bootstraps depend on winget being present.",
      requirements: [
        "Required. If no suitable Python is on PATH, the installer asks winget to install Python 3.12 and then looks again.",
        "Required, because omm is installed from a verified Git checkout. If it is missing, the installer asks winget for MinGit.",
        "Built into Windows 10 2004 and later and into Windows 11. On anything older it is absent, so install Python 3.10+ and git yourself first — the installer will not be able to.",
        "omm is tested on Windows, macOS and Linux with Python 3.10+. Windows 10 22H2 / 11 is the supported Windows baseline.",
        "The optional NVIDIA detector is installed only when nvidia-smi shows an NVIDIA driver is present. Nothing to do either way.",
      ],
    },

    install: {
      body: "Paste the whole line, including the part before the semicolon, into PowerShell and press Enter.",
      notes: [
        "The first half is not optional. It must run before irm: script-internal TLS settings are too late for its first download — by the time PowerShell reads a line of the script, the script has already been downloaded.",
        "irm downloads the script and iex runs it. Both are PowerShell commands, which is why the tab has to be PowerShell.",
        "Open a new PowerShell window afterward so your PATH picks up omm.",
      ],
      alts: [PYPI_ALT],
    },

    after: {
      body: AFTER_BODY,
      steps: [
        {
          title: "open a new PowerShell window",
          body: "pipx added its bin directory to your PATH, but a window that was already open keeps the PATH it started with. Close it and open a fresh one.",
        },
        { title: "run omm once", body: SETUP_STEP_BODY("Windows") },
        SCAN_STEP,
      ],
      captureFootnote:
        "A real capture from one Windows 11 machine under heavy load, which is why the safe budget reads 0.0 GB. Your own numbers will differ; the shape of the output will not.",
      scanRunnersRow: null,
    },

    runners: {
      body: "omm links one central copy of each model into every runner it finds. The setup wizard can install some of those runners for you — which ones depends on the operating system, because it only uses each vendor's own supported package.",
      rows: [
        "Automated",
        "Automated — headless lms CLI",
        "Automated — winget",
        "Automated on 64-bit x86 (AMD64)",
        "Automated on 64-bit x86",
        "Automated on 64-bit x86 (AMD64)",
        "Automated on 64-bit x86 (AMD64)",
      ],
      notes: [
        "Neither AnythingLLM nor Msty Studio has a winget package — AnythingLLM's community manifest was withdrawn in 2025, and no winget package targets the current Msty Studio app rather than its retired predecessor. On 64-bit Windows, omm downloads each vendor's own installer directly instead and runs it silently; on ARM Windows it prints the download link.",
        WIZARD_LISTS_INSTALLED,
        "On Windows, Ollama is detected through its HTTP API first, so a freshly installed tray app is found even before this terminal receives the new PATH.",
      ],
      linking: [
        "omm keeps one file in the hub and exposes it to each runner. On Windows it tries an unprivileged same-volume hard link first.",
        "If that is not possible it tries a symbolic link, which needs Developer Mode turned on or an Administrator shell.",
        "If neither works it falls back to an owned copy. Before copying, omm checks the destination's free space and reports that the model now consumes additional bytes.",
        "File junctions never apply here, because the link targets are files, not directories.",
      ],
    },

    keeping: {
      storageBody:
        "The model hub and omm's own state default to a .omm folder in your user profile. Set OMM_HOME before installing, and on later runs, to put them on another drive.",
      storageCaptions: [
        "Persist it for future windows",
        "And set it in the window you have open now",
      ],
      storageNotes: [LMSTUDIO_NOTE],
      completionBody: "Install tab-completion once, then restart the shell.",
      uninstallBody: UNINSTALL_BODY,
      uninstallNotes: [
        "To remove the model hub and settings as well, download the script and run it with -Purge. Purge removes only known omm-owned paths and leaves unrelated files in a custom OMM_HOME untouched.",
        UNINSTALL_MARKS,
        UNINSTALL_PYPI,
      ],
    },

    trouble: [
      {
        why: "You pasted the macOS and Linux command (the one with curl … | sh) into PowerShell. PowerShell has no sh.",
        fix: "Use the Windows command in step 3 of this page instead. The two operating systems get genuinely different commands, not two spellings of the same one.",
      },
      {
        why: "The Unix installer ran under Git Bash, MSYS or Cygwin. It detects that it is on Windows and refuses rather than installing something broken.",
        fix: "Open PowerShell as described in step 1 and run the Windows command. The message prints the right command too.",
      },
      {
        why: "You are in Command Prompt. irm and iex are PowerShell commands.",
        fix: "Open PowerShell. In Windows Terminal, use the arrow next to the plus sign and start a PowerShell tab.",
      },
      {
        why: "Windows PowerShell 5.1 defaulted to a TLS version GitHub no longer accepts. The script cannot fix this from inside itself, because irm has to download it first.",
        fix: "Run the full line including the [Net.ServicePointManager] part before irm. If it still fails, a corporate proxy or an antivirus inspecting HTTPS is intercepting the connection — try another network.",
      },
      {
        why: "No Python 3.10 or newer was found, and winget either is not installed or its install attempt failed.",
        fix: "Install Python from python.org, tick Add python.exe to PATH during setup, open a new PowerShell window, and run the install command again.",
      },
      {
        why: "Same situation for git: omm is installed from a verified Git checkout, so git has to exist.",
        fix: "Install git from the linked page, open a new PowerShell window, and run the install command again.",
      },
      {
        why: OLD_GIT.why,
        fix: "Update git, then run the install command again.",
      },
      BAD_SIGNATURE,
      {
        why: "The staging clone could not reach github.com. Usually a proxy, a firewall, or no network.",
        fix: "Confirm you can open github.com in a browser from this machine, then run the install command again.",
      },
      {
        why: "A pipx environment named omm already exists, and the installer does not recognize it as an omm install — often because OMM_HOME moved after that install, or its source checkout was deleted. Your models and settings under OMM_HOME are unaffected either way.",
        fix: "Run pipx uninstall omm, then run the install command again.",
      },
      UNVERIFIED_PIPX,
      {
        why: "OMM_HOME points at a drive root or at your user profile itself. Uninstalling from there could not be made safe.",
        fix: "Point OMM_HOME at a subdirectory, such as D:\\omm. A related message, Refusing OMM_HOME that contains the current directory, means you are standing inside that folder — cd somewhere else first.",
      },
      {
        why: "The install finished, but this window still has the PATH it started with.",
        fix: "Open a new PowerShell window. The installer prints the same advice on its last line.",
      },
      UNRECOGNIZED_HOME,
    ],
  },

  /* ====================================================================== */
  /* macOS                                                                  */
  /* ====================================================================== */
  macos: {
    metaTitle: "Install omm on macOS",
    metaDescription:
      "Step-by-step omm install for macOS: opening Terminal, the Python 3.10+ requirement macOS does not satisfy on its own, the exact command, what the installer verifies, and what each error message means.",
    heading: "Install omm on macOS",
    lede: "One command in Terminal. The part worth reading first is the Python requirement: the version of Python that ships with macOS is usually too old, and the installer will not replace it for you.",
    summary:
      "Terminal, why the bundled Python is usually too old, and the Homebrew-backed runner coverage.",

    app: {
      heading: "Open Terminal",
      body: "Any terminal application works. The command runs under sh, so your login shell being zsh, bash or fish makes no difference.",
      open: [
        "Press Command and Space, type Terminal, and press Enter. Terminal is also in Applications › Utilities.",
        "iTerm2, Warp, Ghostty, or the terminal built into your editor are all fine.",
        "You do not need sudo to install omm.",
      ],
      samplesIntro:
        "The prompt tells you which shell you are in. All of these are fine.",
      samples: ["zsh — the macOS default", "bash", "sh, or a bare prompt"],
      notes: [
        "omm is tested in CI on macOS with Python 3.10+, on both Apple Silicon and Intel.",
      ],
    },

    before: {
      body: "The installer fills in whatever is missing through Homebrew. If Homebrew itself isn't installed, it bootstraps Homebrew first, using Homebrew's own official installer (export OMM_AUTO_INSTALL_HOMEBREW=0 first if you'd rather install Homebrew yourself).",
      requirements: [
        "The python3 that comes with macOS is usually older than 3.10. If no Python 3.10+ is found, the installer installs one through Homebrew, bootstrapping Homebrew itself first if needed.",
        "macOS ships a git stub that opens Apple's Command Line Tools installer the first time you run it; accepting that dialog satisfies this on its own. If git is still missing after that, the installer installs it through Homebrew the same way it does Python.",
        "The installer installs pipx for you through the exact Python it validated, retrying with --break-system-packages when a Homebrew or PEP 668 Python refuses a plain --user install.",
      ],
    },

    install: {
      body: "Paste this into Terminal and press Enter.",
      notes: [
        "curl downloads the script and sh runs it. It installs omm as an isolated CLI through pipx.",
        "Open a new shell afterward so your PATH picks up omm.",
        "The -f and -s flags make curl silent on failure. If nothing at all happens, see the troubleshooting section below.",
      ],
      alts: [
        {
          heading: "Or install from the Homebrew Tap",
          body: "omm publishes a Homebrew Tap. Use it if Homebrew is already how you manage command-line tools on this Mac.",
          captions: [
            "macOS · Homebrew Tap",
            "Upgrade or remove the formula with Homebrew",
            null,
          ],
          notes: [
            "Removing the formula preserves downloaded models and settings under OMM_HOME.",
            "The Homebrew formula and PyPI package can move on separate release schedules; use brew info omm-hippo/omm/omm to see the version currently provided by the Tap.",
            "omm update does not modify a Homebrew installation and instead prints the matching brew upgrade command.",
          ],
        },
        PYPI_ALT,
      ],
    },

    after: {
      body: AFTER_BODY,
      steps: [
        {
          title: "open a new terminal window",
          body: "pipx added its bin directory to your PATH, but a shell that was already running keeps the PATH it started with. A new window or tab is enough.",
        },
        { title: "run omm once", body: SETUP_STEP_BODY("macOS") },
        SCAN_STEP,
      ],
      captureFootnote: null,
      scanRunnersRow: SCAN_RUNNERS_ROW,
    },

    runners: {
      body: "omm links one central copy of each model into every runner it finds. The setup wizard can install some of those runners for you — which ones depends on the operating system, because it only uses each vendor's own supported package. macOS has the widest coverage of the three.",
      rows: [
        "Automated",
        "Automated — headless lms CLI",
        "Automated — Homebrew cask",
        "Automated — Homebrew cask",
        "Automated — Homebrew cask",
        "Automated on Apple Silicon; Intel Macs are manual",
        "Automated on any Mac",
      ],
      notes: [
        "The three Homebrew rows need Homebrew installed. Without it the wizard reports Homebrew not found - install manually from … and gives you the vendor's link rather than guessing at a download URL.",
        "KoboldCpp publishes no Intel Mac build, so on an Intel Mac the wizard prints the download page instead of installing.",
        WIZARD_LISTS_INSTALLED,
      ],
      linking: null,
    },

    keeping: {
      storageBody:
        "The model hub and omm's own state default to ~/.omm. Set OMM_HOME before installing, and on later runs, to put them on another volume — useful when your home filesystem does not have room for GGUF files.",
      storageCaptions: [null],
      storageNotes: [
        "Put that line in your shell profile so later runs see it too. An external volume on macOS lives under /Volumes.",
        LMSTUDIO_NOTE,
      ],
      completionBody:
        "Install tab-completion once, then restart the shell. bash and fish are supported the same way.",
      uninstallBody: UNINSTALL_BODY,
      uninstallNotes: [
        "To remove the model hub and settings as well, download the script and run it with --purge. Purge removes only known omm-owned paths and leaves unrelated files in a custom OMM_HOME untouched.",
        UNINSTALL_MARKS,
        UNINSTALL_PYPI,
      ],
    },

    trouble: [
      CURL_SILENT,
      {
        why: "No Python 3.10+ was found, and the installer's own Homebrew-based bootstrap could not supply one either — most often because Homebrew itself failed to install.",
        fix: "Install Python 3.10 or newer from python.org, or with Homebrew, open a new terminal window, then run the install command again.",
      },
      {
        why: "omm is installed from a verified Git checkout, and no usable git was found even after the installer tried to install one through Homebrew.",
        fix: "Run xcode-select --install, let it finish, then run the install command again. If macOS opened its own Command Line Tools dialog, accepting that has the same effect.",
      },
      {
        why: OLD_GIT.why,
        fix: "Update git — brew install git, or reinstall the Command Line Tools — then run the install command again.",
      },
      {
        why: "Homebrew itself could not be installed automatically — its own installer failed, or curl/bin/bash (which it needs to bootstrap) were unavailable. Setting OMM_AUTO_INSTALL_HOMEBREW=0 without Homebrew already present hits the same wall.",
        fix: "Install Homebrew yourself from https://brew.sh/, or unset OMM_AUTO_INSTALL_HOMEBREW, then run the install command again.",
      },
      BAD_SIGNATURE,
      {
        why: "A Homebrew or other PEP 668 Python refuses plain pip installs. The installer already expects this and retries pipx's own install with --break-system-packages.",
        fix: "Nothing, if the install continues past it. If it stops there, install pipx yourself (brew install pipx && pipx ensurepath) and run the install command again.",
      },
      PIPX_UNINSPECTABLE,
      UNRELATED_PIPX,
      UNVERIFIED_PIPX,
      {
        why: "The install finished, but this shell still has the PATH it started with.",
        fix: "Open a new terminal window. The installer prints the same advice on its last line.",
      },
      {
        why: "OMM_HOME has to be an absolute path. A sibling message, Refusing unsafe OMM_HOME, means it points at / or at your home directory itself.",
        fix: "Use a full path to a subdirectory, for example export OMM_HOME=/Volumes/Models/omm.",
      },
      {
        why: "This is the setup wizard, not the installer: the three Homebrew-based runners need brew on PATH. omm never guesses a direct download URL.",
        fix: "Install Homebrew and re-run omm setup, or install that runner yourself from the printed link — omm links models into it either way.",
      },
      UNRECOGNIZED_HOME,
    ],
  },

  /* ====================================================================== */
  /* Linux                                                                  */
  /* ====================================================================== */
  linux: {
    metaTitle: "Install omm on Linux",
    metaDescription:
      "Step-by-step omm install for Linux: the one-line installer, what it bootstraps through apt and what it leaves to you on Fedora, Arch and openSUSE, plus what each installer error message means.",
    heading: "Install omm on Linux",
    lede: "One command in any terminal. On Debian and Ubuntu the installer can fetch its own dependencies; on other distributions you install python3 and git first, and everything after that is identical.",
    summary:
      "Any terminal, what the apt bootstrap does, and what to install yourself on Fedora, Arch or openSUSE.",

    app: {
      heading: "Open a terminal",
      body: "Any terminal emulator works — GNOME Terminal, Konsole, xterm, Alacritty. The command runs under sh, so your login shell being bash, zsh or fish makes no difference.",
      open: [
        "Most desktops open a terminal with Ctrl, Alt and T together.",
        "Otherwise find Terminal, Konsole or Console in your application menu.",
        "You do not need to be root. The installer asks for sudo only if it has to install packages through apt.",
      ],
      samplesIntro:
        "The prompt tells you which shell you are in. All of these are fine.",
      samples: ["bash — the common default", "zsh", "a root shell — also works"],
      notes: ["omm is tested in CI on Linux with Python 3.10+."],
    },

    before: {
      body: "The installer's automatic dependency bootstrap works with apt-get, dnf, yum, pacman or apk — whichever it finds on the system. On a distribution with none of those, such as openSUSE, it checks and reports rather than installing.",
      requirements: [
        "Required. When python3 is missing, the installer installs it — with its venv and pip pieces — through whichever of those package managers is present. On an unsupported distribution, install it yourself first.",
        "Required, because omm is installed from a verified Git checkout. The installer adds git for you through the same package manager, wherever one is present.",
        "Needed by pipx, and packaged separately on some distributions (Debian and Ubuntu among them). Without it pipx fails with a confusing ensurepip is not available, so the installer bootstraps the right venv/pip package explicitly.",
        "None of apt-get, dnf, yum, pacman or apk was found, so there is no automatic bootstrap here. Install Python 3.10+ and git with your own package manager first — for example sudo zypper install python3 git on openSUSE.",
        "This package-manager step runs directly as root, or through sudo when it is available. Without either it is skipped, and the installer then reports the missing dependency instead.",
      ],
    },

    install: {
      body: "Paste this into your terminal and press Enter.",
      notes: [
        "curl downloads the script and sh runs it. It installs omm as an isolated CLI through pipx.",
        "Open a new shell afterward so your PATH picks up omm.",
        "The -f and -s flags make curl silent on failure. If nothing at all happens, see the troubleshooting section below.",
      ],
      alts: [PYPI_ALT],
    },

    after: {
      body: AFTER_BODY,
      steps: [
        {
          title: "open a new shell",
          body: "pipx added its bin directory to your PATH, but a shell that was already running keeps the PATH it started with. A new terminal window or tab is enough.",
        },
        { title: "run omm once", body: SETUP_STEP_BODY("Linux") },
        SCAN_STEP,
      ],
      captureFootnote: null,
      scanRunnersRow: SCAN_RUNNERS_ROW,
    },

    runners: {
      body: "omm links one central copy of each model into every runner it finds. The setup wizard can install some of those runners for you — which ones depends on the operating system, because it only uses each vendor's own supported package.",
      rows: [
        "Automated",
        "Automated — headless lms CLI",
        "Automated — Flatpak",
        "Automated on x86_64",
        "Automated on x86_64",
        "Manual — install it yourself, omm still links to it",
        "Manual — install it yourself, omm still links to it",
      ],
      notes: [
        MANUAL_MEANS,
        "Jan needs flatpak on PATH. Without it the wizard reports flatpak not found - install manually from https://jan.ai/download.",
        "AnythingLLM's only official Linux install is an interactive installer that prompts for an AppArmor profile and has no documented silent flag, and Msty has no Linux package at all — which is why neither is automated here.",
        "KoboldCpp and text-generation-webui publish x86_64 Linux builds only, so on ARM the wizard prints the download page instead.",
      ],
      linking: null,
    },

    keeping: {
      storageBody:
        "The model hub and omm's own state default to ~/.omm. Set OMM_HOME before installing, and on later runs, to put them on another volume — useful when your home filesystem does not have room for GGUF files.",
      storageCaptions: [null],
      storageNotes: [
        "Put that line in your shell profile so later runs see it too.",
        LMSTUDIO_NOTE,
      ],
      completionBody:
        "Install tab-completion once, then restart the shell. zsh and fish are supported the same way.",
      uninstallBody: UNINSTALL_BODY,
      uninstallNotes: [
        "To remove the model hub and settings as well, download the script and run it with --purge. Purge removes only known omm-owned paths and leaves unrelated files in a custom OMM_HOME untouched.",
        UNINSTALL_MARKS,
        UNINSTALL_PYPI,
      ],
    },

    trouble: [
      CURL_SILENT,
      {
        why: "No python3 or python of version 3.10 or newer was found. The installer's automatic bootstrap only runs where apt-get, dnf, yum, pacman or apk exists, and even there it gives up quietly if that package manager fails.",
        fix: "Install Python 3.10 or newer with your distribution's package manager — sudo apt install python3 python3-venv python3-pip, sudo dnf install python3, sudo pacman -S python, sudo apk add python3 — then run the install command again.",
      },
      {
        why: "omm is installed from a verified Git checkout, and git was neither present nor installable through any of the supported package managers here.",
        fix: "Install git with your own package manager, then run the install command again.",
      },
      {
        why: "Informational. On some distributions (Debian and Ubuntu among them), ensurepip lives in a separate package; without it pipx fails with ensurepip is not available.",
        fix: "Nothing, if the install continues. On an unsupported distribution install the equivalent package yourself — python3-virtualenv or your distribution's python3 venv package.",
      },
      {
        why: OLD_GIT.why,
        fix: "Update git, then run the install command again.",
      },
      BAD_SIGNATURE,
      PIPX_UNINSPECTABLE,
      UNRELATED_PIPX,
      UNVERIFIED_PIPX,
      {
        why: "The install finished, but this shell still has the PATH it started with.",
        fix: "Open a new shell. The installer prints the same advice on its last line.",
      },
      {
        why: "OMM_HOME has to be an absolute path. A sibling message, Refusing unsafe OMM_HOME, means it points at / or at your home directory itself.",
        fix: "Use a full path to a subdirectory, for example export OMM_HOME=/mnt/models/omm.",
      },
      {
        why: "This is the setup wizard, not the installer: Jan's only automated Linux path is Flatpak. omm never guesses a direct download URL.",
        fix: "Install flatpak and add the Flathub remote, then re-run omm setup — or install Jan yourself from the printed link. omm links models into it either way.",
      },
      UNRECOGNIZED_HOME,
    ],
  },
};
