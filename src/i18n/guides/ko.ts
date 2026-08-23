/**
 * Korean translation of `./en.ts` — the prose for the three per-OS install
 * guides.
 *
 * All commands, verbatim installer/shell messages, paths, environment
 * variables, and other non-translatable strings stay in English and live in
 * `./base.ts`; nothing here duplicates them. This file adds no claim and
 * changes no claim relative to the English original — every sentence should
 * trace back to the same fact in `en.ts`.
 */

/**
 * GLOSSARY — fixed terminology, keep consistent across edits.
 *
 * install (verb/noun)            설치 / 설치하다
 * installer (the one-line script) 설치 스크립트
 * uninstall / uninstaller         제거 / 제거 스크립트
 * run (a command)                 실행
 * command (full command line)     명령   (명령어 only for the word itself)
 * terminal                        터미널
 * shell                           셸
 * window / tab                    창 / 탭
 * prompt                          프롬프트
 * runner (local AI runner)        러너
 * hub                             허브
 * model                           모델
 * link (verb, hard/symlink)       링크하다
 * hard link / symbolic link       하드 링크 / 심볼릭 링크
 * signed commit verification      서명된 커밋 검증
 * trust anchor                    신뢰 앵커
 * staging clone                   스테이징 클론
 * environment variable            환경 변수
 * package manager                 패키지 매니저
 * dependency                      의존성
 * bootstrap (verb / noun)         자동으로 설치하다 / 부트스트랩
 * setup wizard                    설정 마법사
 * hardware summary                하드웨어 요약
 * tab-completion / shell completion 셸 자동 완성
 * free space                      여유 공간
 * checkout (Git)                  체크아웃
 * capture (of output)             캡처
 * supported baseline              지원 기준
 * troubleshooting                 문제 해결
 * open an issue                   이슈를 등록하세요
 */

import type { GuideTextSet } from "@/i18n/guides/shape";

const PYPI_ALT = {
  heading: "또는 패키지로 설치",
  body: "PyPI를 통한 일반 패키지 설치도 가능합니다. 위 설치 스크립트가 수행하는 서명된 커밋 검증은 건너뛰며, 이미 Python 도구를 직접 관리하고 있다면 이 방법이 적합합니다.",
  captions: [null, "격리된 명령줄 설치를 원한다면 pipx를 권장합니다"],
  notes: [
    "배포 이름은 omm-model이지만, 설치되는 명령과 Python import는 그대로 omm입니다.",
    "설치에 사용한 도구로 업그레이드하거나 제거하세요: python -m pip install --upgrade omm-model 또는 pipx upgrade omm-model. 둘 다 OMM_HOME 아래의 다운로드된 모델과 설정을 보존합니다.",
    "이 방법은 위에서 설명한 서명된 커밋 검증을 거치지 않으며, PyPI 자체의 계정 보안과 TLS에 의존합니다. 다른 PyPI 패키지를 설치할 때와 동일한 신뢰 모델입니다.",
    "omm update는 정식 omm Git 소스 설치만 업데이트합니다. pip나 pipx로 설치한 경우에는 아무것도 변경하지 않고 대신 해당하는 패키지 매니저 명령을 출력합니다. Git 전용 베타 채널 역시 패키지 매니저로 설치한 경우에는 사용할 수 없습니다.",
  ],
} as const;

const AFTER_BODY =
  "설치 스크립트의 마지막 줄은 Done.입니다. 'omm' isn't found가 나타나면 새 셸을 여세요(pipx가 방금 PATH를 갱신했습니다). 말 그대로입니다.";

const SETUP_STEP_BODY = (os: string) =>
  `방금 설치한 상태에서 인자 없이 omm을 실행하면 설정 마법사가 시작됩니다: 하드웨어 요약에 이어 로컬 AI 러너 체크리스트가 나타납니다. omm이 ${os}에서 설치할 수 있는 항목을 체크하면 실시간 진행 상황과 함께 공식 설치 프로그램이 실행되고, 여기서 자동으로 설치할 수 없는 항목을 체크하면 대신 링크가 출력됩니다. omm setup으로 언제든 다시 실행할 수 있습니다.`;

const SCAN_STEP = {
  title: "omm이 인식하는 내용 확인하기",
  body: "omm scan은 모든 적합성 판단의 근거가 되는 하드웨어, 러너, 모델 요약을 출력합니다.",
} as const;

const SCAN_RUNNERS_ROW = "로컬 AI 러너 — 러너마다 한 행씩, 상태와 함께 표시";

const WIZARD_LISTS_INSTALLED =
  "이미 설치된 러너도 마법사 목록에 모두 표시됩니다. 숨기지 않고 installed로 표시하므로, 체크리스트는 항상 omm이 실제로 감지한 내용을 그대로 반영합니다.";

const MANUAL_MEANS =
  "여기서 수동은 마법사가 제조사의 설치 프로그램을 대신 실행해 주지 않는다는 뜻일 뿐입니다. 다운로드 링크를 출력해 주며, 앱이 존재하기만 하면 omm은 다른 러너와 마찬가지로 이를 감지하고 링크합니다.";

const LMSTUDIO_NOTE =
  "Ollama 자체의 모델 위치는 OLLAMA_MODELS를 따릅니다. LM Studio는 자체 home 포인터를 따르며, LM Studio가 omm이 찾을 수 없는 사용자 지정 디렉터리를 사용한다면 OMM_LMSTUDIO_MODELS_DIR을 설정하세요.";

const UNINSTALL_BODY =
  "이 작업은 omm 명령과 설치 스크립트가 관리하는 소스 체크아웃을 제거합니다. OMM_HOME 아래의 다운로드된 모델과 설정은 보존됩니다.";

const UNINSTALL_MARKS =
  "설치 스크립트는 사용자 지정 홈 디렉터리에 표시를 남겨, 제거 스크립트가 모호하거나 안전하지 않은 위치를 거부할 수 있게 합니다. 제거 과정에서 셸 프로필은 절대 다시 쓰지 않습니다.";

const UNINSTALL_PYPI =
  "대신 PyPI로 설치했다면 python -m pip uninstall omm-model 또는 pipx uninstall omm-model을 사용하세요. 둘 다 모델과 설정을 보존합니다.";

const OLD_GIT = {
  why: "git 버전이 너무 오래되어 SSH 커밋 서명을 확인할 수 없습니다. 설치 스크립트는 검증 불가 상태를 서명 오류와 동일하게 취급합니다.",
} as const;

const BAD_SIGNATURE = {
  why: "스테이징된 커밋이 설치 스크립트의 신뢰 앵커에 있는 키로 서명되지 않았거나, 앞 항목과 마찬가지로 git이 서명을 아예 확인하지 못한 경우입니다.",
  fix: "git을 업데이트한 뒤 다시 시도하세요. 그래도 실패한다면 일반 git clone으로 우회하지 말고, 대신 저장소에 이슈를 등록하세요.",
} as const;

const UNRELATED_PIPX = {
  why: "omm이라는 이름의 무관한 다른 PyPI 프로젝트가 이미 해당 pipx 환경을 점유하고 있습니다. 설치 스크립트는 다른 도구를 덮어쓰지 않습니다.",
  fix: "그 다른 도구가 필요 없다면 pipx uninstall omm을 실행하거나 해당 환경의 이름을 변경한 뒤, 설치 명령을 다시 실행하세요.",
} as const;

const UNVERIFIED_PIPX = {
  why: "omm-model pipx 환경이 존재하지만 omm이 생성한 것으로 보이지 않습니다.",
  fix: "pipx uninstall omm-model을 실행한 뒤 설치 명령을 다시 실행하세요.",
} as const;

const UNRECOGNIZED_HOME = {
  why: "설치 스크립트가 자신의 것으로 표시한 적 없는 사용자 지정 OMM_HOME으로 제거를 시도하고 있어, 제거 스크립트는 해당 폴더를 건드려도 안전한지 증명할 수 없습니다.",
  fix: "OMM_HOME이 omm이 실제로 설치된 폴더를 가리키는지 확인한 뒤, 제거 스크립트를 다시 실행하세요.",
} as const;

const CURL_SILENT = {
  /* The English `see` describes an absence rather than quoting a printed
     message, so this is one of the few entries that is translated. */
  see: "아무 일도 일어나지 않습니다. 명령이 곧바로 끝나고 omm은 나타나지 않습니다.",
  why: "curl -fsSL은 의도적으로 조용합니다: -s는 진행 상황과 오류를 숨기고, -f는 HTTP 오류가 발생해도 조용히 종료시킵니다. 그래서 네트워크가 차단되었거나 프록시가 있으면 아무 일도 일어나지 않는 것처럼 보입니다.",
  fix: "먼저 스크립트만 따로 다운로드해 오류를 확인한 뒤 실행하세요: curl -fL https://omm.run/install.sh -o install.sh && sh install.sh",
} as const;

const PIPX_UNINSPECTABLE = {
  why: "pipx list --json이 사용 가능한 출력을 반환하지 않아, 설치 스크립트는 무엇을 대체하게 될지 판단할 수 없습니다. 추측하는 대신 중단합니다.",
  fix: "pipx가 단독으로 실행되는지 확인하고(python3 -m pipx list), 안 된다면 복구한 뒤 설치 명령을 다시 실행하세요.",
} as const;

export const GUIDES_KO: GuideTextSet = {
  /* ====================================================================== */
  /* Windows                                                                */
  /* ====================================================================== */
  windows: {
    metaTitle: "Windows에 omm 설치하기",
    metaDescription:
      "Windows용 omm 설치 단계별 안내: 어떤 PowerShell 창을 열어야 하는지, TLS 사전 설정 줄이 포함된 정확한 명령, 설치 스크립트가 검증하는 항목, 그리고 설치 스크립트가 출력할 수 있는 모든 오류에 대한 대처법을 다룹니다.",
    heading: "Windows에 omm 설치하기",
    lede: "설치 전체는 한 줄이지만, 반드시 올바른 프로그램에서 실행해야 합니다. 이 페이지는 그 프로그램을 알려주고, 명령을 제공하며, 설치 스크립트가 출력할 수 있는 메시지와 각각의 의미를 정리합니다.",
    summary:
      "PowerShell, TLS 사전 설정 줄, winget을 통한 자동 설치, 그리고 하드 링크 → 심볼릭 링크 → 복사 순의 전략.",

    app: {
      heading: "PowerShell 열기",
      body: "omm의 Windows 설치 스크립트는 PowerShell 스크립트입니다. Command Prompt에서는 실행할 수 없고, Git Bash나 WSL 셸에서도 실행할 수 없습니다 — 이들은 Unix 셸이라 PowerShell 명령을 이해하지 못합니다.",
      open: [
        "Windows 키를 누르고 PowerShell을 입력해 Windows PowerShell을 여세요. Windows에 기본 내장된 Windows PowerShell 5.1과 PowerShell 7 모두 사용할 수 있습니다.",
        "Windows Terminal을 창으로 사용해도 괜찮지만, 탭을 확인하세요: 더하기 기호 옆 화살표를 열어 Command Prompt가 아니라 Windows PowerShell 또는 PowerShell을 선택하세요.",
        "omm을 설치하는 데 관리자 권한으로 실행할 필요는 없습니다.",
      ],
      samplesIntro:
        "지금 무엇을 열어 놓았는지 확실하지 않다면 줄 맨 앞의 프롬프트를 확인하세요.",
      samples: [
        "PowerShell — 이 창을 사용하세요",
        "Command Prompt — 여기서는 설치 명령이 동작하지 않습니다",
        "Git Bash — 여기서는 설치 명령이 동작하지 않습니다",
      ],
      notes: [
        "Windows 10 22H2 또는 Windows 11이 지원 기준입니다. Ollama가 Windows에서 요구하는 조건이기 때문입니다.",
      ],
    },

    before: {
      body: "설치 스크립트는 필요한 것을 직접 받아오지만, 그중 두 가지 자동 설치 과정은 winget이 있어야 동작합니다.",
      requirements: [
        "필수입니다. PATH에 적합한 Python이 없으면 설치 스크립트는 winget에 Python 3.12 설치를 요청한 뒤 다시 확인합니다.",
        "필수입니다. omm은 검증된 Git 체크아웃으로부터 설치되기 때문입니다. git이 없으면 설치 스크립트는 winget에 MinGit을 요청합니다.",
        "Windows 10 2004 이상과 Windows 11에는 기본 내장되어 있습니다. 그보다 이전 버전에는 없으므로, Python 3.10+와 git을 먼저 직접 설치하세요 — 설치 스크립트는 이를 대신할 수 없습니다.",
        "omm은 Windows, macOS, Linux에서 Python 3.10+로 테스트됩니다. Windows 10 22H2 / 11이 지원되는 Windows 기준입니다.",
        "선택적인 NVIDIA 감지 기능은 nvidia-smi가 NVIDIA 드라이버의 존재를 보여줄 때만 설치됩니다. 어느 쪽이든 따로 할 일은 없습니다.",
      ],
    },

    install: {
      body: "세미콜론 앞부분을 포함한 전체 줄을 PowerShell에 붙여넣고 Enter를 누르세요.",
      notes: [
        "앞부분은 생략할 수 없습니다. 반드시 irm보다 먼저 실행되어야 합니다. 스크립트 내부의 TLS 설정은 첫 다운로드에는 이미 늦습니다 — PowerShell이 스크립트의 한 줄을 읽을 때는 이미 스크립트 다운로드가 끝난 뒤이기 때문입니다.",
        "irm은 스크립트를 다운로드하고 iex는 이를 실행합니다. 둘 다 PowerShell 명령이므로 탭이 반드시 PowerShell이어야 합니다.",
        "이후 새 PowerShell 창을 열어야 PATH가 omm을 인식합니다.",
      ],
      alts: [PYPI_ALT],
    },

    after: {
      body: AFTER_BODY,
      steps: [
        {
          title: "새 PowerShell 창 열기",
          body: "pipx가 bin 디렉터리를 PATH에 추가했지만, 이미 열려 있던 창은 시작 당시의 PATH를 그대로 유지합니다. 창을 닫고 새로 여세요.",
        },
        { title: "omm을 한 번 실행하기", body: SETUP_STEP_BODY("Windows") },
        SCAN_STEP,
      ],
      captureFootnote:
        "부하가 심한 Windows 11 머신 하나에서 실제로 캡처한 결과라 안전 예산이 0.0 GB로 나타납니다. 실제 숫자는 사용자마다 다르겠지만, 출력의 형태는 동일합니다.",
      scanRunnersRow: null,
    },

    runners: {
      body: "omm은 각 모델을 중앙에 하나만 보관하고 이를 발견한 모든 러너에 링크합니다. 설정 마법사는 이 러너 중 일부를 대신 설치해 줄 수 있는데, 어떤 것이 가능한지는 운영체제에 따라 다릅니다. 각 제조사가 공식적으로 지원하는 패키지만 사용하기 때문입니다.",
      rows: [
        "자동 설치",
        "자동 설치 — headless lms CLI",
        "자동 설치 — winget",
        "64비트 x86(AMD64)에서 자동 설치",
        "64비트 x86에서 자동 설치",
        "수동 — 직접 설치하면 omm이 그대로 링크합니다",
        "수동 — 직접 설치하면 omm이 그대로 링크합니다",
      ],
      notes: [
        MANUAL_MEANS,
        "AnythingLLM은 더 이상 winget 패키지가 없습니다 — 커뮤니티 매니페스트가 2025년에 철회되었습니다 — 그리고 현재의 Msty Studio 앱을 대상으로 하는 winget 패키지도 없고, 있는 것은 단종된 이전 버전용뿐입니다. 이런 이유로 Windows에서는 두 러너 모두 자동 설치되지 않습니다.",
        WIZARD_LISTS_INSTALLED,
        "Windows에서는 Ollama를 먼저 HTTP API를 통해 감지하므로, 방금 설치된 트레이 앱도 이 터미널이 새 PATH를 받기 전에 이미 발견됩니다.",
      ],
      linking: [
        "omm은 허브에 파일 하나만 보관하고 이를 각 러너에 노출합니다. Windows에서는 먼저 권한이 필요 없는 동일 볼륨 하드 링크를 시도합니다.",
        "그것이 불가능하면 심볼릭 링크를 시도하는데, 이는 Developer Mode가 켜져 있거나 관리자 셸이 필요합니다.",
        "둘 다 안 되면 자체 복사본으로 대체합니다. 복사하기 전에 omm은 대상의 여유 공간을 확인하고, 해당 모델이 이제 추가 바이트를 차지한다고 알려줍니다.",
        "파일 정션은 여기서 절대 사용되지 않습니다. 링크 대상이 디렉터리가 아니라 파일이기 때문입니다.",
      ],
    },

    keeping: {
      storageBody:
        "모델 허브와 omm 자체 상태는 기본적으로 사용자 프로필 안의 .omm 폴더에 저장됩니다. 다른 드라이브에 두려면 설치 전과 이후 실행 시 모두 OMM_HOME을 설정하세요.",
      storageCaptions: [
        "앞으로의 창에도 유지되도록 설정",
        "지금 열려 있는 창에도 바로 설정",
      ],
      storageNotes: [LMSTUDIO_NOTE],
      completionBody: "셸 자동 완성을 한 번 설치한 뒤 셸을 재시작하세요.",
      uninstallBody: UNINSTALL_BODY,
      uninstallNotes: [
        "모델 허브와 설정까지 함께 제거하려면 스크립트를 다운로드해 -Purge와 함께 실행하세요. Purge는 omm이 소유한다고 알려진 경로만 제거하며, 사용자 지정 OMM_HOME 안의 무관한 파일은 그대로 둡니다.",
        UNINSTALL_MARKS,
        UNINSTALL_PYPI,
      ],
    },

    trouble: [
      {
        why: "PowerShell에 macOS·Linux용 명령(curl … | sh가 들어간 명령)을 붙여넣었습니다. PowerShell에는 sh가 없습니다.",
        fix: "대신 이 페이지의 3단계에 있는 Windows용 명령을 사용하세요. 두 운영체제는 같은 명령의 표기만 다른 것이 아니라 실제로 서로 다른 명령을 사용합니다.",
      },
      {
        why: "Unix용 설치 스크립트가 Git Bash, MSYS 또는 Cygwin에서 실행되었습니다. 이 경우 스크립트는 자신이 Windows 위에 있음을 감지하고, 망가진 상태로 설치하는 대신 설치를 거부합니다.",
        fix: "1단계에서 설명한 대로 PowerShell을 열고 Windows용 명령을 실행하세요. 메시지에도 올바른 명령이 함께 출력됩니다.",
      },
      {
        why: "지금 Command Prompt에 있습니다. irm과 iex는 PowerShell 명령입니다.",
        fix: "PowerShell을 여세요. Windows Terminal에서는 더하기 기호 옆 화살표를 사용해 PowerShell 탭을 시작하세요.",
      },
      {
        why: "Windows PowerShell 5.1은 기본적으로 GitHub가 더 이상 허용하지 않는 TLS 버전을 사용합니다. irm이 먼저 스크립트를 다운로드해야 하므로, 스크립트 내부에서 이 문제를 스스로 해결할 수는 없습니다.",
        fix: "irm 앞의 [Net.ServicePointManager] 부분을 포함한 전체 줄을 실행하세요. 그래도 실패한다면 회사 프록시나 HTTPS를 검사하는 백신 프로그램이 연결을 가로채고 있는 것입니다 — 다른 네트워크에서 시도해 보세요.",
      },
      {
        why: "Python 3.10 이상을 찾지 못했고, winget이 설치되어 있지 않거나 설치 시도가 실패했습니다.",
        fix: "python.org에서 Python을 설치하면서 Add python.exe to PATH를 체크하고, 새 PowerShell 창을 연 뒤 설치 명령을 다시 실행하세요.",
      },
      {
        why: "git도 상황은 같습니다. omm은 검증된 Git 체크아웃으로부터 설치되므로 git이 반드시 있어야 합니다.",
        fix: "링크된 페이지에서 git을 설치하고, 새 PowerShell 창을 연 뒤 설치 명령을 다시 실행하세요.",
      },
      {
        why: OLD_GIT.why,
        fix: "git을 업데이트한 뒤 설치 명령을 다시 실행하세요.",
      },
      BAD_SIGNATURE,
      {
        why: "스테이징 클론이 github.com에 접속하지 못했습니다. 대개 프록시, 방화벽 또는 네트워크 없음이 원인입니다.",
        fix: "이 기기의 브라우저에서 github.com을 열 수 있는지 확인한 뒤 설치 명령을 다시 실행하세요.",
      },
      UNRELATED_PIPX,
      UNVERIFIED_PIPX,
      {
        why: "OMM_HOME이 드라이브 루트나 사용자 프로필 자체를 가리키고 있습니다. 그런 위치에서는 안전하게 제거할 방법이 없습니다.",
        fix: "OMM_HOME이 D:\\omm처럼 하위 디렉터리를 가리키도록 설정하세요. 관련 메시지인 Refusing OMM_HOME that contains the current directory가 나타나면 현재 그 폴더 안에 있다는 뜻이니, 먼저 다른 곳으로 cd하세요.",
      },
      {
        why: "설치는 끝났지만 이 창은 여전히 시작할 때의 PATH를 그대로 가지고 있습니다.",
        fix: "새 PowerShell 창을 여세요. 설치 스크립트도 마지막 줄에 같은 안내를 출력합니다.",
      },
      UNRECOGNIZED_HOME,
    ],
  },

  /* ====================================================================== */
  /* macOS                                                                  */
  /* ====================================================================== */
  macos: {
    metaTitle: "macOS에 omm 설치하기",
    metaDescription:
      "macOS용 omm 설치 단계별 안내: Terminal 열기, macOS가 기본적으로 충족하지 못하는 Python 3.10+ 요구 사항, 정확한 명령, 설치 스크립트가 검증하는 항목, 그리고 각 오류 메시지의 의미를 다룹니다.",
    heading: "macOS에 omm 설치하기",
    lede: "Terminal에서 명령 하나면 됩니다. 가장 먼저 읽어둘 만한 부분은 Python 요구 사항입니다. macOS에 기본 탑재된 Python 버전은 대개 너무 오래되었고, 설치 스크립트가 이를 대신 교체해 주지는 않습니다.",
    summary:
      "Terminal, 기본 탑재된 Python이 보통 너무 오래된 이유, 그리고 Homebrew 기반 러너 지원 범위.",

    app: {
      heading: "Terminal 열기",
      body: "어떤 터미널 애플리케이션을 사용해도 됩니다. 명령은 sh에서 실행되므로, 로그인 셸이 zsh든 bash든 fish든 상관없습니다.",
      open: [
        "Command와 Space를 누르고 Terminal을 입력한 뒤 Enter를 누르세요. Terminal은 Applications › Utilities에서도 찾을 수 있습니다.",
        "iTerm2, Warp, Ghostty, 또는 에디터에 내장된 터미널을 사용해도 모두 괜찮습니다.",
        "omm을 설치하는 데 sudo가 필요하지 않습니다.",
      ],
      samplesIntro:
        "프롬프트를 보면 어떤 셸에 있는지 알 수 있습니다. 아래 모두 사용해도 괜찮습니다.",
      samples: ["zsh — macOS 기본 셸", "bash", "sh 또는 기호만 있는 프롬프트"],
      notes: [
        "omm은 macOS에서 Apple Silicon과 Intel 모두를 대상으로 Python 3.10+로 CI 테스트를 거칩니다.",
      ],
    },

    before: {
      body: "설치 스크립트의 자동 의존성 설치는 apt를 사용하는데, macOS에는 apt가 없습니다. 따라서 Mac에서는 Python과 git이 이미 준비되어 있다고 가정합니다.",
      requirements: [
        "필수이며, 대개 여기서 문제가 생깁니다. macOS에 기본 포함된 python3는 대부분의 시스템에서 3.10보다 낮은 버전입니다. 설치 스크립트를 실행하기 전에 python.org에서 최신 Python을 설치하거나 Homebrew로 설치하세요.",
        "필수입니다. macOS에는 처음 실행할 때 Apple의 Command Line Tools 설치 프로그램을 여는 git 스텁이 포함되어 있습니다. 그 대화상자를 수락하거나, xcode-select --install을 직접 실행하세요.",
        "설치 스크립트는 검증을 마친 바로 그 Python을 통해 pipx를 대신 설치합니다. Homebrew나 PEP 668 Python이 일반 --user 설치를 거부하면 --break-system-packages를 붙여 재시도합니다.",
      ],
    },

    install: {
      body: "이것을 Terminal에 붙여넣고 Enter를 누르세요.",
      notes: [
        "curl이 스크립트를 다운로드하고 sh가 이를 실행합니다. pipx를 통해 omm을 격리된 CLI로 설치합니다.",
        "이후 새 셸을 열어야 PATH가 omm을 인식합니다.",
        "-f와 -s 플래그는 실패 시 curl을 조용하게 만듭니다. 아무 일도 일어나지 않는다면 아래 문제 해결 섹션을 참고하세요.",
      ],
      alts: [
        {
          heading: "또는 Homebrew Tap으로 설치",
          body: "omm은 Homebrew Tap을 제공합니다. 이 Mac에서 이미 Homebrew로 명령줄 도구를 관리하고 있다면 이 방법을 사용하세요.",
          captions: [
            "macOS · Homebrew Tap",
            "Homebrew로 포뮬러를 업그레이드하거나 제거",
            null,
          ],
          notes: [
            "포뮬러를 제거해도 OMM_HOME 아래의 다운로드된 모델과 설정은 보존됩니다.",
            "Homebrew 포뮬러와 PyPI 패키지는 서로 다른 릴리스 일정으로 움직일 수 있습니다. brew info omm-hippo/omm/omm으로 Tap이 현재 제공하는 버전을 확인하세요.",
            "omm update는 Homebrew로 설치한 경우 아무것도 변경하지 않고, 대신 해당하는 brew upgrade 명령을 출력합니다.",
          ],
        },
        PYPI_ALT,
      ],
    },

    after: {
      body: AFTER_BODY,
      steps: [
        {
          title: "새 터미널 창 열기",
          body: "pipx가 bin 디렉터리를 PATH에 추가했지만, 이미 실행 중이던 셸은 시작 당시의 PATH를 그대로 유지합니다. 새 창이나 탭이면 충분합니다.",
        },
        { title: "omm을 한 번 실행하기", body: SETUP_STEP_BODY("macOS") },
        SCAN_STEP,
      ],
      captureFootnote: null,
      scanRunnersRow: SCAN_RUNNERS_ROW,
    },

    runners: {
      body: "omm은 각 모델을 중앙에 하나만 보관하고 이를 발견한 모든 러너에 링크합니다. 설정 마법사는 이 러너 중 일부를 대신 설치해 줄 수 있는데, 어떤 것이 가능한지는 운영체제에 따라 다릅니다. 각 제조사가 공식적으로 지원하는 패키지만 사용하기 때문입니다. 세 운영체제 중 macOS의 지원 범위가 가장 넓습니다.",
      rows: [
        "자동 설치",
        "자동 설치 — headless lms CLI",
        "자동 설치 — Homebrew cask",
        "자동 설치 — Homebrew cask",
        "자동 설치 — Homebrew cask",
        "Apple Silicon에서 자동 설치, Intel Mac은 수동",
        "모든 Mac에서 자동 설치",
      ],
      notes: [
        "Homebrew를 사용하는 세 행은 Homebrew가 설치되어 있어야 합니다. 없으면 마법사는 Homebrew not found - install manually from …를 보고하고, 다운로드 URL을 추측하는 대신 제조사의 링크를 제공합니다.",
        "KoboldCpp는 Intel Mac용 빌드를 제공하지 않으므로, Intel Mac에서는 마법사가 설치 대신 다운로드 페이지를 출력합니다.",
        WIZARD_LISTS_INSTALLED,
      ],
      linking: null,
    },

    keeping: {
      storageBody:
        "모델 허브와 omm 자체 상태는 기본적으로 ~/.omm에 저장됩니다. 다른 볼륨에 두려면 설치 전과 이후 실행 시 모두 OMM_HOME을 설정하세요. 홈 파일시스템에 GGUF 파일을 담을 여유 공간이 없을 때 유용합니다.",
      storageCaptions: [null],
      storageNotes: [
        "이후 실행에서도 적용되도록 이 줄을 셸 프로필에 넣어 두세요. macOS의 외장 볼륨은 /Volumes 아래에 있습니다.",
        LMSTUDIO_NOTE,
      ],
      completionBody:
        "셸 자동 완성을 한 번 설치한 뒤 셸을 재시작하세요. bash와 fish도 같은 방식으로 지원됩니다.",
      uninstallBody: UNINSTALL_BODY,
      uninstallNotes: [
        "모델 허브와 설정까지 함께 제거하려면 스크립트를 다운로드해 --purge와 함께 실행하세요. Purge는 omm이 소유한다고 알려진 경로만 제거하며, 사용자 지정 OMM_HOME 안의 무관한 파일은 그대로 둡니다.",
        UNINSTALL_MARKS,
        UNINSTALL_PYPI,
      ],
    },

    trouble: [
      CURL_SILENT,
      {
        why: "python3나 python 3.10 이상 버전을 찾지 못했습니다. macOS에서는 설치 스크립트가 이를 스스로 해결할 수 없습니다 — 자동 설치는 apt 기반인데 macOS에는 apt가 없기 때문입니다.",
        fix: "python.org에서 Python 3.10 이상을 설치하거나 Homebrew로 설치한 뒤, 새 터미널 창을 열고 설치 명령을 다시 실행하세요.",
      },
      {
        why: "omm은 검증된 Git 체크아웃으로부터 설치됩니다. Xcode Command Line Tools가 없는 Mac에는 사용할 수 있는 git이 없습니다.",
        fix: "xcode-select --install을 실행해 완료될 때까지 기다린 뒤 설치 명령을 다시 실행하세요. macOS가 자체적으로 Command Line Tools 대화상자를 열었다면, 그것을 수락해도 같은 효과입니다.",
      },
      {
        why: OLD_GIT.why,
        fix: "git을 업데이트하세요 — brew install git을 실행하거나 Command Line Tools를 다시 설치한 뒤 설치 명령을 다시 실행하세요.",
      },
      BAD_SIGNATURE,
      {
        why: "Homebrew 등 PEP 668 Python은 일반 pip 설치를 거부합니다. 설치 스크립트는 이를 이미 예상하고 있으며, pipx 자체 설치를 --break-system-packages와 함께 재시도합니다.",
        fix: "이 단계를 넘어가며 설치가 계속된다면 별도로 할 일은 없습니다. 여기서 멈춘다면 직접 pipx를 설치하고(brew install pipx && pipx ensurepath) 설치 명령을 다시 실행하세요.",
      },
      PIPX_UNINSPECTABLE,
      UNRELATED_PIPX,
      UNVERIFIED_PIPX,
      {
        why: "설치는 끝났지만 이 셸은 여전히 시작할 때의 PATH를 그대로 가지고 있습니다.",
        fix: "새 터미널 창을 여세요. 설치 스크립트도 마지막 줄에 같은 안내를 출력합니다.",
      },
      {
        why: "OMM_HOME은 절대 경로여야 합니다. 관련 메시지인 Refusing unsafe OMM_HOME이 나타나면 /나 홈 디렉터리 자체를 가리키고 있다는 뜻입니다.",
        fix: "하위 디렉터리로 이어지는 전체 경로를 사용하세요. 예: export OMM_HOME=/Volumes/Models/omm.",
      },
      {
        why: "이는 설치 스크립트가 아니라 설정 마법사 이야기입니다. Homebrew 기반의 세 러너는 PATH에 brew가 있어야 합니다. omm은 다운로드 URL을 직접 추측하는 일이 없습니다.",
        fix: "Homebrew를 설치하고 omm setup을 다시 실행하거나, 출력된 링크에서 해당 러너를 직접 설치하세요 — 어느 쪽이든 omm은 모델을 링크합니다.",
      },
      UNRECOGNIZED_HOME,
    ],
  },

  /* ====================================================================== */
  /* Linux                                                                  */
  /* ====================================================================== */
  linux: {
    metaTitle: "Linux에 omm 설치하기",
    metaDescription:
      "Linux용 omm 설치 단계별 안내: 한 줄 설치 스크립트, apt를 통해 자동으로 설치되는 항목과 Fedora·Arch·openSUSE에서 직접 해야 하는 항목, 그리고 각 설치 오류 메시지의 의미를 다룹니다.",
    heading: "Linux에 omm 설치하기",
    lede: "어떤 터미널에서든 명령 하나면 됩니다. Debian과 Ubuntu에서는 설치 스크립트가 필요한 의존성을 직접 받아올 수 있고, 다른 배포판에서는 python3와 git을 먼저 직접 설치하면 그 이후 과정은 동일합니다.",
    summary:
      "아무 터미널이나, apt 자동 설치가 하는 일, 그리고 Fedora·Arch·openSUSE에서 직접 설치해야 하는 것.",

    app: {
      heading: "터미널 열기",
      body: "어떤 터미널 에뮬레이터를 사용해도 됩니다 — GNOME Terminal, Konsole, xterm, Alacritty. 명령은 sh에서 실행되므로, 로그인 셸이 bash든 zsh든 fish든 상관없습니다.",
      open: [
        "대부분의 데스크톱에서는 Ctrl, Alt, T를 함께 눌러 터미널을 엽니다.",
        "그렇지 않다면 애플리케이션 메뉴에서 Terminal, Konsole 또는 Console을 찾으세요.",
        "root일 필요는 없습니다. 설치 스크립트는 apt로 패키지를 설치해야 할 때만 sudo를 요청합니다.",
      ],
      samplesIntro:
        "프롬프트를 보면 어떤 셸에 있는지 알 수 있습니다. 아래 모두 사용해도 괜찮습니다.",
      samples: ["bash — 일반적인 기본 셸", "zsh", "root 셸 — 이것도 괜찮습니다"],
      notes: ["omm은 Linux에서 Python 3.10+로 CI 테스트를 거칩니다."],
    },

    before: {
      body: "설치 스크립트의 자동 의존성 설치는 apt에서만 동작합니다. Debian과 Ubuntu에서는 필요한 모든 것을 설치할 수 있고, 그 외에서는 설치 대신 확인하고 알려주기만 합니다.",
      requirements: [
        "필수입니다. apt가 있는 시스템에서는 python3가 없으면 설치 스크립트가 apt-get install python3 python3-venv python3-pip를 실행합니다. 그 외에는 먼저 직접 설치하세요.",
        "필수입니다. omm은 검증된 Git 체크아웃으로부터 설치되기 때문입니다. apt가 있으면 설치 스크립트가 git과 ca-certificates를 대신 추가합니다.",
        "pipx가 필요로 하며, Debian과 Ubuntu에서는 별도 패키지로 제공됩니다. 없으면 pipx가 알기 힘든 ensurepip is not available 오류로 실패하므로, 설치 스크립트가 이를 명시적으로 먼저 설치합니다.",
        "apt가 없으므로 자동 설치도 없습니다. 사용 중인 패키지 매니저로 Python 3.10+와 git을 먼저 설치하세요 — 예를 들어 sudo dnf install python3 git 또는 sudo pacman -S python git.",
        "apt 단계는 root로 직접 실행되거나, 가능하다면 sudo를 통해 실행됩니다. 둘 다 없으면 이 단계는 건너뛰고, 설치 스크립트는 대신 누락된 의존성을 알려줍니다.",
      ],
    },

    install: {
      body: "이것을 터미널에 붙여넣고 Enter를 누르세요.",
      notes: [
        "curl이 스크립트를 다운로드하고 sh가 이를 실행합니다. pipx를 통해 omm을 격리된 CLI로 설치합니다.",
        "이후 새 셸을 열어야 PATH가 omm을 인식합니다.",
        "-f와 -s 플래그는 실패 시 curl을 조용하게 만듭니다. 아무 일도 일어나지 않는다면 아래 문제 해결 섹션을 참고하세요.",
      ],
      alts: [PYPI_ALT],
    },

    after: {
      body: AFTER_BODY,
      steps: [
        {
          title: "새 셸 열기",
          body: "pipx가 bin 디렉터리를 PATH에 추가했지만, 이미 실행 중이던 셸은 시작 당시의 PATH를 그대로 유지합니다. 새 터미널 창이나 탭이면 충분합니다.",
        },
        { title: "omm을 한 번 실행하기", body: SETUP_STEP_BODY("Linux") },
        SCAN_STEP,
      ],
      captureFootnote: null,
      scanRunnersRow: SCAN_RUNNERS_ROW,
    },

    runners: {
      body: "omm은 각 모델을 중앙에 하나만 보관하고 이를 발견한 모든 러너에 링크합니다. 설정 마법사는 이 러너 중 일부를 대신 설치해 줄 수 있는데, 어떤 것이 가능한지는 운영체제에 따라 다릅니다. 각 제조사가 공식적으로 지원하는 패키지만 사용하기 때문입니다.",
      rows: [
        "자동 설치",
        "자동 설치 — headless lms CLI",
        "자동 설치 — Flatpak",
        "x86_64에서 자동 설치",
        "x86_64에서 자동 설치",
        "수동 — 직접 설치하면 omm이 그대로 링크합니다",
        "수동 — 직접 설치하면 omm이 그대로 링크합니다",
      ],
      notes: [
        MANUAL_MEANS,
        "Jan은 PATH에 flatpak이 있어야 합니다. 없으면 마법사는 flatpak not found - install manually from https://jan.ai/download를 보고합니다.",
        "AnythingLLM의 유일한 공식 Linux 설치 방법은 AppArmor 프로필을 묻는 대화형 설치 프로그램이며 문서화된 silent 플래그가 없습니다. Msty는 Linux용 패키지가 아예 없습니다 — 이런 이유로 여기서는 둘 다 자동 설치되지 않습니다.",
        "KoboldCpp와 text-generation-webui는 x86_64 Linux 빌드만 제공하므로, ARM에서는 마법사가 대신 다운로드 페이지를 출력합니다.",
      ],
      linking: null,
    },

    keeping: {
      storageBody:
        "모델 허브와 omm 자체 상태는 기본적으로 ~/.omm에 저장됩니다. 다른 볼륨에 두려면 설치 전과 이후 실행 시 모두 OMM_HOME을 설정하세요. 홈 파일시스템에 GGUF 파일을 담을 여유 공간이 없을 때 유용합니다.",
      storageCaptions: [null],
      storageNotes: [
        "이후 실행에서도 적용되도록 이 줄을 셸 프로필에 넣어 두세요.",
        LMSTUDIO_NOTE,
      ],
      completionBody:
        "셸 자동 완성을 한 번 설치한 뒤 셸을 재시작하세요. zsh와 fish도 같은 방식으로 지원됩니다.",
      uninstallBody: UNINSTALL_BODY,
      uninstallNotes: [
        "모델 허브와 설정까지 함께 제거하려면 스크립트를 다운로드해 --purge와 함께 실행하세요. Purge는 omm이 소유한다고 알려진 경로만 제거하며, 사용자 지정 OMM_HOME 안의 무관한 파일은 그대로 둡니다.",
        UNINSTALL_MARKS,
        UNINSTALL_PYPI,
      ],
    },

    trouble: [
      CURL_SILENT,
      {
        why: "python3나 python 3.10 이상 버전을 찾지 못했습니다. 설치 스크립트의 자동 설치는 apt-get이 있는 곳에서만 동작하며, 그런 곳에서도 apt가 실패하면 조용히 포기합니다.",
        fix: "배포판의 패키지 매니저로 Python 3.10 이상을 설치하세요 — sudo apt install python3 python3-venv python3-pip, sudo dnf install python3, sudo pacman -S python — 그런 다음 설치 명령을 다시 실행하세요.",
      },
      {
        why: "omm은 검증된 Git 체크아웃으로부터 설치되는데, 여기서는 git이 없고 apt로도 설치할 수 없었습니다.",
        fix: "사용 중인 패키지 매니저로 git을 설치한 뒤 설치 명령을 다시 실행하세요.",
      },
      {
        why: "참고용 메시지입니다. Debian과 Ubuntu에서는 ensurepip가 별도 패키지로 제공되며, 없으면 pipx가 ensurepip is not available로 실패합니다.",
        fix: "설치가 계속 진행된다면 별도로 할 일은 없습니다. apt를 사용하지 않는 배포판이라면 해당하는 패키지를 직접 설치하세요 — python3-virtualenv 또는 배포판의 python3 venv 패키지.",
      },
      {
        why: OLD_GIT.why,
        fix: "git을 업데이트한 뒤 설치 명령을 다시 실행하세요.",
      },
      BAD_SIGNATURE,
      PIPX_UNINSPECTABLE,
      UNRELATED_PIPX,
      UNVERIFIED_PIPX,
      {
        why: "설치는 끝났지만 이 셸은 여전히 시작할 때의 PATH를 그대로 가지고 있습니다.",
        fix: "새 셸을 여세요. 설치 스크립트도 마지막 줄에 같은 안내를 출력합니다.",
      },
      {
        why: "OMM_HOME은 절대 경로여야 합니다. 관련 메시지인 Refusing unsafe OMM_HOME이 나타나면 /나 홈 디렉터리 자체를 가리키고 있다는 뜻입니다.",
        fix: "하위 디렉터리로 이어지는 전체 경로를 사용하세요. 예: export OMM_HOME=/mnt/models/omm.",
      },
      {
        why: "이는 설치 스크립트가 아니라 설정 마법사 이야기입니다. Jan을 Linux에서 자동 설치할 수 있는 유일한 경로는 Flatpak입니다. omm은 다운로드 URL을 직접 추측하는 일이 없습니다.",
        fix: "flatpak을 설치하고 Flathub remote를 추가한 뒤 omm setup을 다시 실행하세요 — 또는 출력된 링크에서 Jan을 직접 설치하세요. 어느 쪽이든 omm은 모델을 링크합니다.",
      },
      UNRECOGNIZED_HOME,
    ],
  },
};
