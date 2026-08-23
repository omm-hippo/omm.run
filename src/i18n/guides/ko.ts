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
  body: "PyPI를 통한 일반 패키지 설치도 가능합니다. 위 설치 스크립트가 수행하는 서명된 커밋 검증은 건너뛰며, 이미 Python 도구를 직접 관리하고 있다면 이 방법이 더 맞을 수 있습니다.",
  captions: [null, "격리된 명령줄 설치를 원한다면 pipx를 권장합니다"],
  notes: [
    "배포 이름은 omm-model이지만, 설치되는 명령과 Python import는 그대로 omm입니다.",
    "설치할 때 쓴 도구로 그대로 업그레이드하거나 제거하세요: python -m pip install --upgrade omm-model 또는 pipx upgrade omm-model. 둘 다 OMM_HOME 아래의 다운로드된 모델과 설정을 그대로 보존합니다.",
    "이 방법은 앞서 설명한 서명된 커밋 검증을 거치지 않고, PyPI 자체의 계정 보안과 TLS에 의존합니다. 다른 PyPI 패키지를 설치할 때와 다르지 않은 신뢰 모델입니다.",
    "omm update는 정식 omm Git 소스 설치만 업데이트합니다. pip나 pipx로 설치했다면 아무것도 바꾸지 않고 해당하는 패키지 매니저 명령만 출력합니다. Git 전용 베타 채널도 패키지 매니저로 설치한 경우에는 쓸 수 없습니다.",
  ],
} as const;

const AFTER_BODY =
  "설치 스크립트의 마지막 줄은 Done.입니다. 그런데도 'omm' isn't found가 뜬다면 새 셸을 여세요. pipx가 방금 PATH를 갱신했을 뿐이니, 말 그대로 창만 새로 열면 됩니다.";

const SETUP_STEP_BODY = (os: string) =>
  `막 설치를 마친 상태에서 인자 없이 omm만 실행하면 설정 마법사가 시작됩니다. 하드웨어 요약이 먼저 나오고, 이어서 로컬 AI 러너 체크리스트가 뜹니다. omm이 ${os}에서 설치할 수 있는 항목을 체크하면 실시간 진행 상황과 함께 공식 설치 프로그램이 실행되고, 자동으로 설치할 수 없는 항목을 체크하면 대신 다운로드 링크가 출력됩니다. omm setup으로 언제든 다시 실행할 수 있습니다.`;

const SCAN_STEP = {
  title: "omm이 인식하는 내용 확인하기",
  body: "omm scan은 앞으로의 모든 적합성 판단이 근거로 삼을 하드웨어, 러너, 모델 요약을 출력합니다.",
} as const;

const SCAN_RUNNERS_ROW = "로컬 AI 러너 — 러너마다 한 행씩, 상태와 함께 표시";

const WIZARD_LISTS_INSTALLED =
  "이미 설치된 러너도 마법사 목록에 빠짐없이 나타납니다. 숨기지 않고 installed로 표시하므로, 체크리스트는 항상 omm이 실제로 감지한 상태를 그대로 반영합니다.";

const MANUAL_MEANS =
  "여기서 '수동'이라는 말은 마법사가 제조사의 설치 프로그램을 대신 실행해 주지는 않는다는 뜻일 뿐입니다. 대신 다운로드 링크를 출력해 주고, 앱만 존재하면 omm은 다른 러너와 똑같이 이를 감지하고 링크합니다.";

const LMSTUDIO_NOTE =
  "Ollama 자체의 모델 위치는 OLLAMA_MODELS를 따릅니다. LM Studio는 자체 home 포인터를 따르므로, LM Studio가 omm이 찾을 수 없는 사용자 지정 디렉터리를 쓰고 있다면 OMM_LMSTUDIO_MODELS_DIR을 설정하세요.";

const UNINSTALL_BODY =
  "이 작업은 omm 명령과, 설치 스크립트가 관리하던 소스 체크아웃을 제거합니다. OMM_HOME 아래의 다운로드된 모델과 설정은 그대로 남습니다.";

const UNINSTALL_MARKS =
  "설치 스크립트는 사용자 지정 홈 디렉터리에 표시를 남겨 두어, 제거 스크립트가 모호하거나 안전하지 않은 위치는 건드리지 않고 거부할 수 있게 합니다. 제거하는 동안 셸 프로필을 다시 쓰는 일은 절대 없습니다.";

const UNINSTALL_PYPI =
  "PyPI로 설치했다면 대신 python -m pip uninstall omm-model 또는 pipx uninstall omm-model을 쓰세요. 둘 다 모델과 설정을 보존합니다.";

const OLD_GIT = {
  why: "git 버전이 너무 오래되어 SSH 커밋 서명을 확인할 수 없습니다. 설치 스크립트는 이런 '검증 불가' 상태를 서명 오류와 똑같이 취급합니다.",
} as const;

const BAD_SIGNATURE = {
  why: "스테이징된 커밋이 설치 스크립트의 신뢰 앵커에 등록된 키로 서명되지 않았거나, 앞 항목처럼 git이 서명 자체를 확인하지 못한 경우입니다.",
  fix: "git을 업데이트한 뒤 다시 시도하세요. 그래도 실패한다면 일반 git clone으로 우회하지 말고, 대신 저장소에 이슈를 등록하세요.",
} as const;

const UNRELATED_PIPX = {
  why: "omm이라는 이름의 무관한 다른 PyPI 프로젝트가 이미 그 pipx 환경을 쓰고 있습니다. 설치 스크립트는 남의 도구를 덮어쓰지 않습니다.",
  fix: "그 다른 도구가 필요 없다면 pipx uninstall omm을 실행하거나 해당 환경의 이름을 바꾼 뒤, 설치 명령을 다시 실행하세요.",
} as const;

const UNVERIFIED_PIPX = {
  why: "omm-model이라는 pipx 환경은 있지만, omm이 만든 것으로 보이지 않습니다.",
  fix: "pipx uninstall omm-model을 실행한 뒤 설치 명령을 다시 실행하세요.",
} as const;

const UNRECOGNIZED_HOME = {
  why: "설치 스크립트가 한 번도 자신의 것으로 표시한 적 없는 사용자 지정 OMM_HOME에서 제거를 시도하고 있어, 제거 스크립트가 그 폴더를 건드려도 안전한지 확신할 수 없습니다.",
  fix: "OMM_HOME이 omm이 실제로 설치된 폴더를 가리키는지 확인한 뒤, 제거 스크립트를 다시 실행하세요.",
} as const;

const CURL_SILENT = {
  /* The English `see` describes an absence rather than quoting a printed
     message, so this is one of the few entries that is translated. */
  see: "아무 일도 일어나지 않습니다. 명령이 곧바로 끝나 버리고 omm은 나타나지 않습니다.",
  why: "curl -fsSL은 일부러 조용합니다: -s는 진행 상황과 오류를 숨기고, -f는 HTTP 오류가 나도 조용히 종료시킵니다. 그래서 네트워크가 막혀 있거나 프록시를 거치는 경우, 겉으로는 아무 일도 없는 것처럼 보입니다.",
  fix: "스크립트만 따로 먼저 내려받아 오류를 확인한 뒤 실행하세요: curl -fL https://omm.run/install.sh -o install.sh && sh install.sh",
} as const;

const PIPX_UNINSPECTABLE = {
  why: "pipx list --json이 쓸 수 있는 출력을 내놓지 못해서, 설치 스크립트는 자신이 무엇을 대체하게 될지 알 방법이 없습니다. 짐작하는 대신 그냥 멈춥니다.",
  fix: "pipx가 단독으로 잘 실행되는지 확인하고(python3 -m pipx list), 안 된다면 복구한 뒤 설치 명령을 다시 실행하세요.",
} as const;

export const GUIDES_KO: GuideTextSet = {
  /* ====================================================================== */
  /* Windows                                                                */
  /* ====================================================================== */
  windows: {
    metaTitle: "Windows에 omm 설치하기",
    metaDescription:
      "Windows용 omm 설치 단계별 안내: 열어야 할 PowerShell 창, TLS 사전 설정 줄이 포함된 정확한 명령, 설치 스크립트가 검증하는 항목, 그리고 설치 스크립트가 출력할 수 있는 모든 오류 메시지에 대한 대처법까지 다룹니다.",
    heading: "Windows에 omm 설치하기",
    lede: "설치 전체는 한 줄이지만, 반드시 올바른 프로그램 안에서 실행해야 합니다. 이 페이지는 그 프로그램이 무엇인지 알려주고 명령을 제공하며, 설치 스크립트가 낼 수 있는 메시지와 각각의 뜻을 정리해 둡니다.",
    summary:
      "PowerShell, TLS 사전 설정 줄, winget을 통한 자동 설치, 그리고 하드 링크 → 심볼릭 링크 → 복사 순의 대체 전략.",

    app: {
      heading: "PowerShell 열기",
      body: "omm의 Windows 설치 스크립트는 PowerShell 스크립트입니다. Command Prompt에서는 실행되지 않고, Git Bash나 WSL 셸에서도 마찬가지입니다 — 둘 다 Unix 셸이라 PowerShell 명령을 이해하지 못합니다.",
      open: [
        "Windows 키를 누르고 PowerShell을 입력해 Windows PowerShell을 여세요. Windows에 기본 내장된 Windows PowerShell 5.1과 PowerShell 7 모두 문제없이 쓸 수 있습니다.",
        "Windows Terminal을 창으로 써도 괜찮지만 탭은 꼭 확인하세요: 더하기 기호 옆 화살표를 눌러 Command Prompt가 아니라 Windows PowerShell 또는 PowerShell을 선택해야 합니다.",
        "omm을 설치하는 데 관리자 권한은 필요 없습니다.",
      ],
      samplesIntro:
        "지금 무엇을 열어 놓았는지 헷갈린다면 줄 맨 앞의 프롬프트를 보세요.",
      samples: [
        "PowerShell — 이 창을 쓰세요",
        "Command Prompt — 여기서는 설치 명령이 동작하지 않습니다",
        "Git Bash — 여기서도 설치 명령이 동작하지 않습니다",
      ],
      notes: [
        "Windows 10 22H2 또는 Windows 11이 지원 기준입니다. Ollama가 Windows에서 요구하는 조건을 그대로 따른 것입니다.",
      ],
    },

    before: {
      body: "설치 스크립트는 필요한 것을 알아서 받아 오지만, 그중 두 가지 자동 설치 과정은 winget이 있어야만 동작합니다.",
      requirements: [
        "필수입니다. PATH에 적합한 Python이 없으면 설치 스크립트가 winget에 Python 3.12 설치를 요청한 뒤 다시 확인합니다.",
        "필수입니다. omm은 검증된 Git 체크아웃으로부터 설치되기 때문입니다. git이 없으면 설치 스크립트가 winget에 MinGit을 요청합니다.",
        "Windows 10 2004 이상과 Windows 11에는 기본 내장돼 있습니다. 그보다 이전 버전에는 없으므로, Python 3.10+와 git을 먼저 직접 설치해야 합니다 — 설치 스크립트가 대신해 줄 수 없는 부분입니다.",
        "omm은 Windows, macOS, Linux에서 Python 3.10+ 기준으로 테스트됩니다. Windows 10 22H2 / 11이 지원되는 Windows 기준입니다.",
        "선택적인 NVIDIA 감지 기능은 nvidia-smi가 NVIDIA 드라이버의 존재를 확인해 줄 때만 설치됩니다. 어느 쪽이든 따로 할 일은 없습니다.",
      ],
    },

    install: {
      body: "세미콜론 앞부분까지 포함한 줄 전체를 PowerShell에 붙여넣고 Enter를 누르세요.",
      notes: [
        "앞부분은 생략할 수 없습니다. 반드시 irm보다 먼저 실행돼야 합니다. 스크립트 내부에서 TLS를 설정해서는 이미 늦습니다 — PowerShell이 스크립트의 첫 줄을 읽는 시점에는 다운로드 자체가 이미 끝난 뒤이기 때문입니다.",
        "irm은 스크립트를 내려받고 iex는 이를 실행합니다. 둘 다 PowerShell 명령이라 탭이 반드시 PowerShell이어야 하는 이유이기도 합니다.",
        "설치 후에는 새 PowerShell 창을 열어야 PATH에 omm이 반영됩니다.",
      ],
      alts: [PYPI_ALT],
    },

    after: {
      body: AFTER_BODY,
      steps: [
        {
          title: "새 PowerShell 창 열기",
          body: "pipx가 bin 디렉터리를 PATH에 추가하긴 했지만, 이미 열려 있던 창은 시작할 때의 PATH를 그대로 유지합니다. 창을 닫고 새로 여세요.",
        },
        { title: "omm을 한 번 실행하기", body: SETUP_STEP_BODY("Windows") },
        SCAN_STEP,
      ],
      captureFootnote:
        "부하가 심한 Windows 11 머신 하나에서 실제로 캡처한 화면이라 안전 예산이 0.0 GB로 나옵니다. 실제 숫자는 사용자마다 다르겠지만 출력의 형태는 똑같습니다.",
      scanRunnersRow: null,
    },

    runners: {
      body: "omm은 모델마다 중앙에 사본 하나만 두고, 이를 찾아낸 모든 러너에 링크합니다. 설정 마법사는 이 러너 중 일부를 대신 설치해 주는데, 어떤 것이 가능한지는 운영체제에 따라 갈립니다. 각 제조사가 공식 지원하는 패키지만 쓰기 때문입니다.",
      rows: [
        "자동 설치",
        "자동 설치 — headless lms CLI",
        "자동 설치 — winget",
        "64비트 x86(AMD64)에서 자동 설치",
        "64비트 x86에서 자동 설치",
        "64비트 x86(AMD64)에서 자동 설치",
        "64비트 x86(AMD64)에서 자동 설치",
      ],
      notes: [
        "AnythingLLM도 Msty Studio도 winget 패키지가 없습니다 — AnythingLLM의 커뮤니티 매니페스트는 2025년에 철회됐고, Msty Studio는 단종된 이전 버전용 winget 패키지만 있을 뿐 현재 앱을 겨냥한 것은 없습니다. 대신 64비트 Windows에서는 omm이 각 제조사의 공식 설치 프로그램을 직접 내려받아 조용히 실행합니다. ARM Windows에서는 다운로드 링크만 출력합니다.",
        WIZARD_LISTS_INSTALLED,
        "Windows에서는 Ollama를 HTTP API로 먼저 감지하므로, 방금 설치된 트레이 앱도 이 터미널이 새 PATH를 받기 전에 이미 잡힙니다.",
      ],
      linking: [
        "omm은 허브에 파일 하나만 두고 이를 각 러너에 노출합니다. Windows에서는 먼저 권한이 필요 없는 동일 볼륨 하드 링크를 시도합니다.",
        "이게 안 되면 심볼릭 링크를 시도하는데, 여기에는 Developer Mode가 켜져 있거나 관리자 셸이 필요합니다.",
        "둘 다 안 되면 마지막으로 자체 복사본을 만듭니다. 복사하기 전에 omm은 대상의 여유 공간을 확인하고, 이제 그 모델이 추가로 바이트를 차지하게 됐다고 알려줍니다.",
        "파일 정션은 여기서 쓰이지 않습니다. 링크 대상이 디렉터리가 아니라 파일이기 때문입니다.",
      ],
    },

    keeping: {
      storageBody:
        "모델 허브와 omm 자체 상태는 기본적으로 사용자 프로필 안의 .omm 폴더에 저장됩니다. 다른 드라이브에 두려면 설치 전과 이후 실행 시 모두 OMM_HOME을 설정하세요.",
      storageCaptions: [
        "앞으로 열 창에도 유지되도록 설정",
        "지금 열려 있는 창에도 바로 적용",
      ],
      storageNotes: [LMSTUDIO_NOTE],
      completionBody: "셸 자동 완성은 한 번만 설치하면 됩니다. 설치 후 셸을 재시작하세요.",
      uninstallBody: UNINSTALL_BODY,
      uninstallNotes: [
        "모델 허브와 설정까지 함께 지우려면 스크립트를 내려받아 -Purge와 함께 실행하세요. Purge는 omm 소유로 확인된 경로만 지우고, 사용자 지정 OMM_HOME 안의 무관한 파일은 건드리지 않습니다.",
        UNINSTALL_MARKS,
        UNINSTALL_PYPI,
      ],
    },

    trouble: [
      {
        why: "PowerShell에 macOS·Linux용 명령(curl … | sh가 들어간 명령)을 붙여넣었습니다. PowerShell에는 sh가 없습니다.",
        fix: "대신 이 페이지 3단계의 Windows용 명령을 쓰세요. 두 운영체제는 같은 명령을 다르게 표기한 게 아니라, 아예 서로 다른 명령을 씁니다.",
      },
      {
        why: "Unix용 설치 스크립트가 Git Bash, MSYS 또는 Cygwin에서 실행됐습니다. 이 경우 스크립트는 자신이 Windows 위에 있다는 걸 감지하고, 어설프게 설치를 진행하는 대신 아예 거부합니다.",
        fix: "1단계대로 PowerShell을 열고 Windows용 명령을 실행하세요. 메시지 자체에도 올바른 명령이 함께 출력됩니다.",
      },
      {
        why: "지금 Command Prompt에 있습니다. irm과 iex는 PowerShell 명령입니다.",
        fix: "PowerShell을 여세요. Windows Terminal이라면 더하기 기호 옆 화살표로 PowerShell 탭을 새로 시작하면 됩니다.",
      },
      {
        why: "Windows PowerShell 5.1은 기본값으로 GitHub가 더 이상 허용하지 않는 TLS 버전을 씁니다. irm이 먼저 스크립트를 내려받아야 하는 구조라, 스크립트 내부에서는 이 문제를 스스로 해결할 수 없습니다.",
        fix: "irm 앞의 [Net.ServicePointManager] 부분까지 포함한 줄 전체를 실행하세요. 그래도 실패한다면 회사 프록시나 HTTPS를 들여다보는 백신 프로그램이 연결을 가로채고 있는 것이니, 다른 네트워크에서 시도해 보세요.",
      },
      {
        why: "Python 3.10 이상을 찾지 못했고, winget이 없거나 설치 시도가 실패했습니다.",
        fix: "python.org에서 Python을 설치하며 Add python.exe to PATH를 체크하고, 새 PowerShell 창을 연 뒤 설치 명령을 다시 실행하세요.",
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
        why: "스테이징 클론이 github.com에 접속하지 못했습니다. 대개 프록시, 방화벽, 또는 네트워크 자체가 없는 경우입니다.",
        fix: "이 기기의 브라우저에서 github.com이 열리는지 먼저 확인한 뒤 설치 명령을 다시 실행하세요.",
      },
      {
        why: "omm이라는 이름의 pipx 환경이 이미 있는데, 설치 스크립트가 이를 omm 설치로 인식하지 못합니다 — 대개 설치 이후 OMM_HOME이 옮겨졌거나, 그 소스 체크아웃이 삭제된 경우입니다. 어느 쪽이든 OMM_HOME 아래의 모델과 설정은 영향받지 않습니다.",
        fix: "pipx uninstall omm을 실행한 뒤 설치 명령을 다시 실행하세요.",
      },
      UNVERIFIED_PIPX,
      {
        why: "OMM_HOME이 드라이브 루트나 사용자 프로필 자체를 가리키고 있습니다. 그런 위치는 안전하게 제거할 방법이 없습니다.",
        fix: "OMM_HOME이 D:\\omm처럼 하위 디렉터리를 가리키도록 바꾸세요. Refusing OMM_HOME that contains the current directory라는 관련 메시지가 뜬다면, 지금 그 폴더 안에 있다는 뜻이니 먼저 다른 곳으로 cd하세요.",
      },
      {
        why: "설치는 끝났지만, 이 창은 여전히 시작할 때의 PATH를 그대로 갖고 있습니다.",
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
      "macOS용 omm 설치 단계별 안내: Terminal 열기, macOS가 기본으로는 충족하지 못하는 Python 3.10+ 요구 사항, 정확한 명령, 설치 스크립트가 검증하는 항목, 오류 메시지마다의 의미까지 다룹니다.",
    heading: "macOS에 omm 설치하기",
    lede: "Terminal에서 명령 하나면 끝입니다. 먼저 읽어 둘 만한 부분은 Python 요구 사항입니다. macOS에 기본 탑재된 Python은 대개 버전이 너무 낮고, 설치 스크립트가 이를 대신 바꿔 주지는 않습니다.",
    summary:
      "Terminal, 기본 탑재 Python이 대개 너무 오래된 이유, 그리고 Homebrew 기반 러너 지원 범위.",

    app: {
      heading: "Terminal 열기",
      body: "어떤 터미널 애플리케이션을 써도 상관없습니다. 명령은 sh에서 실행되므로 로그인 셸이 zsh든 bash든 fish든 결과는 같습니다.",
      open: [
        "Command와 Space를 함께 누르고 Terminal을 입력한 뒤 Enter를 누르세요. Terminal은 Applications › Utilities에서도 찾을 수 있습니다.",
        "iTerm2, Warp, Ghostty, 또는 에디터에 내장된 터미널을 써도 모두 괜찮습니다.",
        "omm을 설치하는 데 sudo는 필요 없습니다.",
      ],
      samplesIntro:
        "프롬프트를 보면 지금 어떤 셸에 있는지 알 수 있습니다. 아래 어느 쪽이든 상관없습니다.",
      samples: ["zsh — macOS 기본 셸", "bash", "sh 또는 기호만 있는 프롬프트"],
      notes: [
        "omm은 macOS에서 Apple Silicon과 Intel 양쪽 모두 Python 3.10+ 기준으로 CI 테스트를 거칩니다.",
      ],
    },

    before: {
      body: "설치 스크립트는 빠진 부분을 Homebrew로 채워 넣습니다. Homebrew 자체가 없다면 Homebrew의 공식 설치 프로그램으로 Homebrew부터 부트스트랩합니다(직접 Homebrew를 설치해 두고 싶다면 먼저 OMM_AUTO_INSTALL_HOMEBREW=0을 export하세요).",
      requirements: [
        "macOS에 기본 포함된 python3는 대개 3.10보다 낮습니다. Python 3.10+를 찾지 못하면 설치 스크립트가 Homebrew로 설치합니다 — 필요하면 Homebrew 자체도 먼저 부트스트랩합니다.",
        "macOS에는 처음 실행하면 Apple의 Command Line Tools 설치 프로그램을 띄우는 git 스텁이 들어 있습니다. 그 대화상자를 수락하는 것만으로 이 요구 사항은 충족됩니다. 그래도 git이 없다면 설치 스크립트가 Python과 같은 방식으로 Homebrew를 통해 git을 설치합니다.",
        "설치 스크립트는 방금 검증을 마친 그 Python으로 pipx까지 대신 설치합니다. Homebrew나 PEP 668 Python이 일반 --user 설치를 거부하면 --break-system-packages를 붙여 재시도합니다.",
      ],
    },

    install: {
      body: "이 명령을 Terminal에 붙여넣고 Enter를 누르세요.",
      notes: [
        "curl이 스크립트를 내려받고 sh가 이를 실행합니다. pipx를 통해 omm을 격리된 CLI로 설치합니다.",
        "설치 후에는 새 셸을 열어야 PATH에 omm이 반영됩니다.",
        "-f와 -s 플래그는 실패 시 curl을 조용하게 만듭니다. 아무 반응도 없다면 아래 문제 해결 섹션을 확인하세요.",
      ],
      alts: [
        {
          heading: "또는 Homebrew Tap으로 설치",
          body: "omm은 Homebrew Tap도 제공합니다. 이 Mac에서 이미 Homebrew로 명령줄 도구를 관리하고 있다면 이 방법이 더 편합니다.",
          captions: [
            "macOS · Homebrew Tap",
            "Homebrew로 포뮬러를 업그레이드하거나 제거",
            null,
          ],
          notes: [
            "포뮬러를 제거해도 OMM_HOME 아래의 다운로드된 모델과 설정은 그대로 남습니다.",
            "Homebrew 포뮬러와 PyPI 패키지는 릴리스 일정이 서로 다를 수 있습니다. brew info omm-hippo/omm/omm으로 Tap이 지금 제공하는 버전을 확인하세요.",
            "omm update는 Homebrew로 설치한 경우 아무것도 바꾸지 않고, 대신 해당하는 brew upgrade 명령만 출력합니다.",
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
          body: "pipx가 bin 디렉터리를 PATH에 추가하긴 했지만, 이미 실행 중이던 셸은 시작할 때의 PATH를 그대로 유지합니다. 새 창이나 탭이면 충분합니다.",
        },
        { title: "omm을 한 번 실행하기", body: SETUP_STEP_BODY("macOS") },
        SCAN_STEP,
      ],
      captureFootnote: null,
      scanRunnersRow: SCAN_RUNNERS_ROW,
    },

    runners: {
      body: "omm은 모델마다 중앙에 사본 하나만 두고, 이를 찾아낸 모든 러너에 링크합니다. 설정 마법사는 이 러너 중 일부를 대신 설치해 주는데, 어떤 것이 가능한지는 운영체제에 따라 갈립니다. 각 제조사가 공식 지원하는 패키지만 쓰기 때문입니다. 세 운영체제 중에서는 macOS의 지원 범위가 가장 넓습니다.",
      rows: [
        "자동 설치",
        "자동 설치 — headless lms CLI",
        "자동 설치 — Homebrew cask",
        "자동 설치 — Homebrew cask",
        "자동 설치 — Homebrew cask",
        "Apple Silicon에서는 자동 설치, Intel Mac은 수동",
        "모든 Mac에서 자동 설치",
      ],
      notes: [
        "Homebrew를 쓰는 세 행은 Homebrew가 설치돼 있어야 동작합니다. 없으면 마법사는 Homebrew not found - install manually from …라고 알려 주고, 다운로드 URL을 짐작하는 대신 제조사 링크를 그대로 제공합니다.",
        "KoboldCpp는 Intel Mac용 빌드를 내놓지 않으므로, Intel Mac에서는 마법사가 설치 대신 다운로드 페이지를 보여 줍니다.",
        WIZARD_LISTS_INSTALLED,
      ],
      linking: null,
    },

    keeping: {
      storageBody:
        "모델 허브와 omm 자체 상태는 기본적으로 ~/.omm에 저장됩니다. 다른 볼륨에 두려면 설치 전과 이후 실행 시 모두 OMM_HOME을 설정하세요. 홈 파일시스템에 GGUF 파일을 담을 여유 공간이 부족할 때 특히 유용합니다.",
      storageCaptions: [null],
      storageNotes: [
        "이 줄을 셸 프로필에 넣어 두면 다음 실행에도 그대로 적용됩니다. macOS의 외장 볼륨은 /Volumes 아래에 있습니다.",
        LMSTUDIO_NOTE,
      ],
      completionBody:
        "셸 자동 완성은 한 번만 설치하면 됩니다. 설치 후 셸을 재시작하세요. bash와 fish도 같은 방식으로 지원됩니다.",
      uninstallBody: UNINSTALL_BODY,
      uninstallNotes: [
        "모델 허브와 설정까지 함께 지우려면 스크립트를 내려받아 --purge와 함께 실행하세요. Purge는 omm 소유로 확인된 경로만 지우고, 사용자 지정 OMM_HOME 안의 무관한 파일은 건드리지 않습니다.",
        UNINSTALL_MARKS,
        UNINSTALL_PYPI,
      ],
    },

    trouble: [
      CURL_SILENT,
      {
        why: "Python 3.10+를 찾지 못했고, 설치 스크립트 자체의 Homebrew 기반 부트스트랩도 이를 채우지 못했습니다 — 대개 Homebrew 자체 설치가 실패한 경우입니다.",
        fix: "python.org나 Homebrew로 Python 3.10 이상을 설치한 뒤, 새 터미널 창을 열고 설치 명령을 다시 실행하세요.",
      },
      {
        why: "omm은 검증된 Git 체크아웃으로부터 설치되는데, 설치 스크립트가 Homebrew로 git 설치를 시도한 뒤에도 쓸 수 있는 git을 찾지 못했습니다.",
        fix: "xcode-select --install을 실행해 끝날 때까지 기다린 뒤 설치 명령을 다시 실행하세요. macOS가 자체적으로 Command Line Tools 대화상자를 띄웠다면 그걸 수락해도 같은 효과입니다.",
      },
      {
        why: OLD_GIT.why,
        fix: "git을 업데이트하세요 — brew install git을 실행하거나 Command Line Tools를 다시 설치한 뒤 설치 명령을 다시 실행하세요.",
      },
      {
        why: "Homebrew 자체를 자동으로 설치하지 못했습니다 — Homebrew의 자체 설치 프로그램이 실패했거나, 부트스트랩에 필요한 curl·/bin/bash를 쓸 수 없었던 경우입니다. Homebrew가 없는 상태에서 OMM_AUTO_INSTALL_HOMEBREW=0을 설정해도 같은 벽에 부딪힙니다.",
        fix: "https://brew.sh/ 에서 Homebrew를 직접 설치하거나, OMM_AUTO_INSTALL_HOMEBREW를 unset한 뒤 설치 명령을 다시 실행하세요.",
      },
      BAD_SIGNATURE,
      {
        why: "Homebrew 등 PEP 668 Python은 일반 pip 설치를 거부합니다. 설치 스크립트는 이 상황을 이미 예상하고 있어서, pipx 자체 설치를 --break-system-packages와 함께 재시도합니다.",
        fix: "이 단계를 지나 설치가 계속된다면 따로 할 일은 없습니다. 여기서 멈췄다면 pipx를 직접 설치하고(brew install pipx && pipx ensurepath) 설치 명령을 다시 실행하세요.",
      },
      PIPX_UNINSPECTABLE,
      UNRELATED_PIPX,
      UNVERIFIED_PIPX,
      {
        why: "설치는 끝났지만, 이 셸은 여전히 시작할 때의 PATH를 그대로 갖고 있습니다.",
        fix: "새 터미널 창을 여세요. 설치 스크립트도 마지막 줄에 같은 안내를 출력합니다.",
      },
      {
        why: "OMM_HOME은 절대 경로여야 합니다. Refusing unsafe OMM_HOME이라는 관련 메시지가 뜬다면 /나 홈 디렉터리 자체를 가리키고 있다는 뜻입니다.",
        fix: "하위 디렉터리까지 이어지는 전체 경로를 쓰세요. 예: export OMM_HOME=/Volumes/Models/omm.",
      },
      {
        why: "이건 설치 스크립트가 아니라 설정 마법사 이야기입니다. Homebrew 기반의 세 러너는 PATH에 brew가 있어야 합니다. omm은 다운로드 URL을 직접 추측하지 않습니다.",
        fix: "Homebrew를 설치하고 omm setup을 다시 실행하거나, 출력된 링크에서 해당 러너를 직접 설치하세요 — 어느 쪽이든 omm은 모델을 링크해 줍니다.",
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
      "Linux용 omm 설치 단계별 안내: 한 줄짜리 설치 스크립트, apt로 자동 설치되는 항목과 Fedora·Arch·openSUSE에서 직접 해야 하는 항목, 그리고 설치 오류 메시지마다의 의미까지 다룹니다.",
    heading: "Linux에 omm 설치하기",
    lede: "어떤 터미널에서든 명령 하나면 됩니다. Debian과 Ubuntu에서는 설치 스크립트가 필요한 의존성을 알아서 받아 오고, 다른 배포판에서는 python3와 git만 먼저 직접 설치하면 그 뒤 과정은 완전히 똑같습니다.",
    summary:
      "아무 터미널이나 좋다는 점, apt 자동 설치가 하는 일, 그리고 Fedora·Arch·openSUSE에서 직접 설치해야 하는 것.",

    app: {
      heading: "터미널 열기",
      body: "어떤 터미널 에뮬레이터를 써도 됩니다 — GNOME Terminal, Konsole, xterm, Alacritty 무엇이든 괜찮습니다. 명령은 sh에서 실행되므로 로그인 셸이 bash든 zsh든 fish든 결과는 같습니다.",
      open: [
        "대부분의 데스크톱 환경에서는 Ctrl, Alt, T를 함께 눌러 터미널을 엽니다.",
        "그렇지 않다면 애플리케이션 메뉴에서 Terminal, Konsole, Console을 찾아보세요.",
        "root일 필요는 없습니다. 설치 스크립트는 apt로 패키지를 설치해야 할 때만 sudo를 요청합니다.",
      ],
      samplesIntro:
        "프롬프트를 보면 지금 어떤 셸에 있는지 알 수 있습니다. 아래 어느 쪽이든 상관없습니다.",
      samples: ["bash — 일반적인 기본 셸", "zsh", "root 셸 — 이것도 문제없습니다"],
      notes: ["omm은 Linux에서 Python 3.10+ 기준으로 CI 테스트를 거칩니다."],
    },

    before: {
      body: "설치 스크립트의 자동 의존성 설치는 apt-get, dnf, yum, pacman, apk 중 시스템에 있는 것을 찾아 동작합니다. 이 중 무엇도 없는 배포판(예: openSUSE)에서는 설치 대신 상태만 확인하고 알려줍니다.",
      requirements: [
        "필수입니다. python3가 없으면 설치 스크립트가 이 패키지 매니저들 중 있는 것을 통해 venv·pip까지 함께 설치합니다. 지원되지 않는 배포판이라면 먼저 직접 설치하세요.",
        "필수입니다. omm은 검증된 Git 체크아웃으로부터 설치되기 때문입니다. 같은 패키지 매니저가 있으면 설치 스크립트가 git도 대신 추가합니다.",
        "pipx가 필요로 하는 요소이며, 일부 배포판(Debian과 Ubuntu 포함)에서는 별도 패키지로 나뉘어 있습니다. 없으면 pipx가 원인을 알기 힘든 ensurepip is not available 오류로 실패하기 때문에, 설치 스크립트가 알맞은 venv·pip 패키지를 먼저 명시적으로 설치해 둡니다.",
        "apt-get, dnf, yum, pacman, apk 중 어느 것도 없어 자동 설치가 불가능합니다. 쓰고 있는 패키지 매니저로 Python 3.10+와 git을 먼저 설치하세요 — 예를 들어 openSUSE라면 sudo zypper install python3 git.",
        "이 패키지 매니저 단계는 root로 직접 실행되거나, 가능하면 sudo를 통해 실행됩니다. 둘 다 없으면 이 단계는 건너뛰고, 설치 스크립트는 대신 부족한 의존성을 알려 줍니다.",
      ],
    },

    install: {
      body: "이 명령을 터미널에 붙여넣고 Enter를 누르세요.",
      notes: [
        "curl이 스크립트를 내려받고 sh가 이를 실행합니다. pipx를 통해 omm을 격리된 CLI로 설치합니다.",
        "설치 후에는 새 셸을 열어야 PATH에 omm이 반영됩니다.",
        "-f와 -s 플래그는 실패 시 curl을 조용하게 만듭니다. 아무 반응도 없다면 아래 문제 해결 섹션을 확인하세요.",
      ],
      alts: [PYPI_ALT],
    },

    after: {
      body: AFTER_BODY,
      steps: [
        {
          title: "새 셸 열기",
          body: "pipx가 bin 디렉터리를 PATH에 추가하긴 했지만, 이미 실행 중이던 셸은 시작할 때의 PATH를 그대로 유지합니다. 새 터미널 창이나 탭이면 충분합니다.",
        },
        { title: "omm을 한 번 실행하기", body: SETUP_STEP_BODY("Linux") },
        SCAN_STEP,
      ],
      captureFootnote: null,
      scanRunnersRow: SCAN_RUNNERS_ROW,
    },

    runners: {
      body: "omm은 모델마다 중앙에 사본 하나만 두고, 이를 찾아낸 모든 러너에 링크합니다. 설정 마법사는 이 러너 중 일부를 대신 설치해 주는데, 어떤 것이 가능한지는 운영체제에 따라 갈립니다. 각 제조사가 공식 지원하는 패키지만 쓰기 때문입니다.",
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
        "Jan은 PATH에 flatpak이 있어야 합니다. 없으면 마법사는 flatpak not found - install manually from https://jan.ai/download라고 알려 줍니다.",
        "AnythingLLM의 공식 Linux 설치 방법은 AppArmor 프로필을 물어보는 대화형 설치 프로그램뿐이고 문서화된 silent 플래그도 없으며, Msty는 Linux용 패키지 자체가 없습니다 — 여기서 둘 다 자동 설치되지 않는 이유입니다.",
        "KoboldCpp와 text-generation-webui는 x86_64 Linux 빌드만 내놓으므로, ARM에서는 마법사가 대신 다운로드 페이지를 보여 줍니다.",
      ],
      linking: null,
    },

    keeping: {
      storageBody:
        "모델 허브와 omm 자체 상태는 기본적으로 ~/.omm에 저장됩니다. 다른 볼륨에 두려면 설치 전과 이후 실행 시 모두 OMM_HOME을 설정하세요. 홈 파일시스템에 GGUF 파일을 담을 여유 공간이 부족할 때 특히 유용합니다.",
      storageCaptions: [null],
      storageNotes: [
        "이 줄을 셸 프로필에 넣어 두면 다음 실행에도 그대로 적용됩니다.",
        LMSTUDIO_NOTE,
      ],
      completionBody:
        "셸 자동 완성은 한 번만 설치하면 됩니다. 설치 후 셸을 재시작하세요. zsh와 fish도 같은 방식으로 지원됩니다.",
      uninstallBody: UNINSTALL_BODY,
      uninstallNotes: [
        "모델 허브와 설정까지 함께 지우려면 스크립트를 내려받아 --purge와 함께 실행하세요. Purge는 omm 소유로 확인된 경로만 지우고, 사용자 지정 OMM_HOME 안의 무관한 파일은 건드리지 않습니다.",
        UNINSTALL_MARKS,
        UNINSTALL_PYPI,
      ],
    },

    trouble: [
      CURL_SILENT,
      {
        why: "python3나 python 3.10 이상 버전을 찾지 못했습니다. 설치 스크립트의 자동 설치는 apt-get이 있는 곳에서만 동작하고, 그런 곳에서도 apt가 실패하면 조용히 포기합니다.",
        fix: "배포판의 패키지 매니저로 Python 3.10 이상을 설치하세요 — sudo apt install python3 python3-venv python3-pip, sudo dnf install python3, sudo pacman -S python 등 — 그런 다음 설치 명령을 다시 실행하세요.",
      },
      {
        why: "omm은 검증된 Git 체크아웃으로부터 설치되는데, 여기에는 git이 없었고 apt로도 설치할 수 없었습니다.",
        fix: "쓰고 있는 패키지 매니저로 git을 설치한 뒤 설치 명령을 다시 실행하세요.",
      },
      {
        why: "참고용 메시지입니다. Debian과 Ubuntu에서는 ensurepip가 별도 패키지로 나뉘어 있어, 없으면 pipx가 ensurepip is not available로 실패합니다.",
        fix: "설치가 계속 진행된다면 따로 할 일은 없습니다. apt를 쓰지 않는 배포판이라면 해당 패키지를 직접 설치하세요 — python3-virtualenv나 배포판의 python3 venv 패키지.",
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
        why: "설치는 끝났지만, 이 셸은 여전히 시작할 때의 PATH를 그대로 갖고 있습니다.",
        fix: "새 셸을 여세요. 설치 스크립트도 마지막 줄에 같은 안내를 출력합니다.",
      },
      {
        why: "OMM_HOME은 절대 경로여야 합니다. Refusing unsafe OMM_HOME이라는 관련 메시지가 뜬다면 /나 홈 디렉터리 자체를 가리키고 있다는 뜻입니다.",
        fix: "하위 디렉터리까지 이어지는 전체 경로를 쓰세요. 예: export OMM_HOME=/mnt/models/omm.",
      },
      {
        why: "이건 설치 스크립트가 아니라 설정 마법사 이야기입니다. Jan을 Linux에서 자동 설치할 수 있는 유일한 경로는 Flatpak입니다. omm은 다운로드 URL을 직접 추측하지 않습니다.",
        fix: "flatpak을 설치하고 Flathub remote를 추가한 뒤 omm setup을 다시 실행하세요 — 또는 출력된 링크에서 Jan을 직접 설치하세요. 어느 쪽이든 omm은 모델을 링크해 줍니다.",
      },
      UNRECOGNIZED_HOME,
    ],
  },
};
