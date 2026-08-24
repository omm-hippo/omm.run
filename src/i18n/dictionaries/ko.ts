/**
 * Korean copy. A translation of `./en.ts` — every fact, number and constraint
 * is the English one; nothing is added, softened or dropped. design/FACTS.md
 * therefore governs this file exactly as it governs the English.
 *
 * GLOSSARY — keep these renderings consistent when editing:
 *   install 설치 · installer(the one-line script) 설치 스크립트 ·
 *   uninstall 제거 · run 실행 · command 명령 · terminal 터미널 · shell 셸 ·
 *   prompt 프롬프트 · runner 러너 · hub 허브 · model 모델 · link 링크하다 ·
 *   hard link 하드 링크 · symbolic link 심볼릭 링크 ·
 *   signed commit verification 서명된 커밋 검증 · trust anchor 신뢰 앵커 ·
 *   staging clone 스테이징 클론 · environment variable 환경 변수 ·
 *   package manager 패키지 매니저 · dependency 의존성 ·
 *   setup wizard 설정 마법사 · shell completion 셸 자동 완성 ·
 *   free space 여유 공간 · budget 예산 · capture 캡처 · issue 이슈
 *
 * Left in English on purpose: commands and flags, environment variables, file
 * paths, verbatim installer output, product and runner names, and the mono
 * token lines (`MIT · Python 3.10+ · Windows, macOS, Linux`).
 */

import type { Dictionary } from "@/i18n/dictionaries";

export const ko = {
  meta: {
    title: "omm — 오픈소스 모델 매니저",
    description:
      "omm은 로컬 LLM(GGUF)을 위한 apt·brew 방식 패키지 매니저입니다. 모델을 중앙 허브 하나에 설치한 뒤 로컬 AI 러너 일곱 개에 자동으로 링크하고, 하드웨어에 맞는 모델을 추천해 줍니다.",
  },

  ui: {
    copy: "복사",
    copied: "복사됨",
    copyAria: "복사: {what}",
  },

  nav: {
    sections: ["문제", "기능", "러너", "설치"],
    installGuides: "가이드",
    commands: "명령어",
    github: "GitHub",
    install: "설치",
    menu: "메뉴",
    close: "닫기",
    language: "언어",
  },

  hero: {
    eyebrow: "MIT · Python 3.10+ · Windows, macOS, Linux",
    heading: "GGUF 파일은 허브 하나에, 러너 일곱 개는 자동으로 연결됩니다.",
    lede: "디스크에는 모델마다 사본을 하나만 두고 Ollama, LM Studio, Jan, AnythingLLM, Msty, KoboldCpp, text-generation-webui에 그대로 링크하며, 무엇이든 내려받기 전에 남은 메모리부터 확인합니다.",
    cta: "omm 설치하기",
  },

  terminal: {
    a11y:
      "터미널 녹화 화면입니다. omm scan은 이 컴퓨터와 설치된 러너 세 개를 보고하고, " +
      "omm install은 4.37 GB짜리 양자화 Mistral 7B를 내려받아 링크하며, " +
      "omm list는 Ollama, LM Studio, Jan에 링크된 파일 하나를 보여줍니다.",
    footnote:
      "4.37 GB(십진법 기준)는 4.07 GiB입니다 — omm list가 GiB를 GB로 잘못 표기하는 버그로, 업스트림에 이슈를 등록해 두었습니다.",
  },

  problem: {
    label: "디스크의 현재 상태",
    heading: "러너 네 개, 사본 네 개, 같은 가중치가 17.5 GB.",
    body: "러너마다 자기 모델 디렉터리를 따로 두고 그 안에 내려받습니다. 이 네 파일이 바이트 단위로 완전히 같다는 사실은 디스크 어디에도 기록되지 않으니, 셋을 지우는 일도 결국 일어나지 않습니다.",
    total: "사본 4개 · 고유 파일 1개 · 13.11 GB 회수 가능",
    caption: "omm이 Linux에서 해석하는 경로",
  },

  features: {
    hub: {
      eyebrow: "허브 하나",
      title: "모델 하나, 러너 일곱 개가 동시에.",
      body: [
        "omm은 GGUF 파일을 ",
        { code: "~/.omm/models" },
        "에 단 한 번만 기록한 뒤, 이 컴퓨터에서 찾아낼 수 있는 모든 러너 디렉터리에 링크합니다. 설치되지 않은 러너는 짐작하지 않고 건너뛰며, Windows에서는 하드 링크를 먼저 시도하고 안 되면 심볼릭 링크, 그마저 안 되면 여유 공간을 확인한 뒤 자체 사본으로 순서대로 대체합니다.",
      ],
    },
    localfit: {
      eyebrow: "Localfit",
      title: "모델을 받기 전에, PC에 맞는지부터 확인합니다.",
      body: [
        "스캔은 전체 RAM, 현재 가용량, GPU 메모리를 읽은 다음, 운영체제와 스캔 이후 실행될 앱을 위해 전체 RAM의 10%를(최소 1 GB는 남기고) 따로 떼어 둡니다. 안전 예산은 이렇게 뺀 나머지 값과 전체 RAM의 80% 중 더 작은 쪽입니다. 스캔을 다시 실행하면 두 값 모두 새로 계산됩니다.",
      ],
    },
    benchmarks: {
      eyebrow: "벤치마크",
      title: "문제 여덟 개, 고정된 시드, 반복 표본의 중앙값.",
      body: [
        "품질 팩은 버전이 관리되는 이중 언어 팩으로, Ollama에서 temperature 0으로 실행되며 항목마다 정답과 대조해 점수 하나를 매깁니다. 생성된 텍스트는 저장하지 않고, 결과는 어쩌다 한 번 맞은 값이 아니라 반복 표본의 중앙값으로 보고합니다.",
      ],
    },
    catalogs: {
      eyebrow: "서명된 카탈로그",
      title: "지운 카탈로그도 해시까지, 그대로 복원.",
      body: [
        { code: "catalog-trust" },
        "는 Ed25519 공개 키와 매니페스트 URL을 고정해 두고, 해시나 서명이 일치하지 않는 추천 아티팩트는 모두 거부합니다. 교체된 스냅샷은 자체 sha256 이름으로 그대로 보관되므로, ",
        { code: "catalog-rollback" },
        "로 이전 카탈로그를 되돌릴 수 있습니다.",
      ],
    },
  },

  featureVisuals: {
    link: {
      alt: "omm 허브에 있는 GGUF 파일 하나가 설치된 러너 디렉터리 세 곳에 링크되어 있고, 나머지 러너 디렉터리 네 곳은 아직 설치되어 있지 않습니다.",
      linked: "링크됨",
      skipped: "미설치 — 건너뜀",
    },
    budget: {
      caption: "RAM 15.5 GB · Intel Core Ultra 7 155H · Windows 11",
      model: "모델 4.37 GB",
      inUse: "다른 앱이 사용 중",
      reserve: "앱·OS용 예약",
      budget: "안전 모델 예산 — 둘 중 작은 값",
      cap: "설치 상한 — 전체 RAM의 80%",
    },
    bench: {
      caption: "localfit-gsm8k-bilingual-smoke, 팩 버전 1.1.0 — 여덟 항목 전체",
      footnote:
        "localfit-gsm8k-bilingual-smoke 1.1.0 · temperature 0, seed 0, Ollama 전용. 여덟 항목이며 리더보드가 아닙니다.",
    },
    catalog: {
      footnote: [
        "해시가 맞지 않으면 ",
        { code: "catalog artifact hash does not match manifest" },
        "로 중단되며, 디스크의 파일은 그대로 남습니다.",
      ],
    },
  },

  runners: {
    label: "러너 7개 · 플랫폼 3종",
    heading: "omm은 이 일곱 개에 링크할 뿐, 무엇도 대체하지 않습니다.",
    body: "omm이 다룰 수 있는 패키지 매니저가 있는 플랫폼에서는 설치까지 자동으로 이루어집니다. 그 외의 환경에서도 직접 설치해 둔 러너에 모델을 링크하는 일은 그대로 해냅니다.",
    columns: {
      runner: "러너",
      automated: "자동 설치 대상",
      manual: "그 외 수동",
    },
    manual: [
      "—",
      "—",
      "해당 패키지 매니저가 없는 환경",
      "Linux, ARM Windows",
      "Linux, ARM Windows",
      "Intel Mac 및 기타 아키텍처",
      "ARM Linux/Windows",
    ],
  },

  install: {
    label: "설치",
    heading: "한 줄이면 끝, 설치 전엔 서명 검증부터 안전하게.",
    lede: "Windows 10 22H2 이상, macOS 또는 Linux에서 Python 3.10+가 필요합니다. 스크립트가 빠진 부분을 알아서 채운 다음, omm을 격리된 pipx CLI로 설치합니다.",
    whatItDoes: "설치 스크립트가 하는 일",
    steps: [
      {
        title: "스테이징 클론",
        body: "릴리스는 버전이 붙은 스테이징 디렉터리에 클론되며, 지금 실행 중인 사본을 덮어쓰는 일은 없습니다.",
      },
      {
        title: "서명된 커밋 검증",
        body: "스테이징된 커밋은 어느 부분이든 실행되기 전에 부트스트랩 신뢰 앵커와 먼저 대조해 검증합니다.",
      },
      {
        title: "pipx 전환",
        body: "이 검증을 통과한 뒤에야 pipx가 스테이징된 트리로 전환하므로, omm은 계속 격리된 CLI로 남습니다.",
      },
    ],
    tabs: {
      aria: "운영체제",
      copyAria: "{what} 설치 명령 복사",
      needThemFirst: "먼저 설치해야 하나요?",
      otherWays: "다른 설치 방법",
      unix: {
        notes: [
          "설치 후에는 새 셸을 열어야 PATH에 omm이 반영됩니다.",
          "Python 3.10+가 필요합니다. macOS에서는 스크립트가 Homebrew를 이용해 — 없으면 Homebrew부터 먼저 설치한 뒤 — Python과 git을 채워 넣습니다. Linux에서는 apt-get, dnf, yum, pacman, apk 중 있는 패키지 매니저로 설치하며, 지원되지 않는 배포판이라면 Python 3.10+와 git이 있는지만 확인하고 없으면 그 자리에서 멈춥니다.",
        ],
        alternatives: [
          "macOS · Homebrew Tap",
          "모든 OS · PyPI 경유, 서명 검증 없음 — 배포 이름은 omm-model이지만 명령은 그대로 omm입니다",
        ],
      },
      windows: {
        notes: [
          "이 부분은 반드시 irm보다 먼저 실행해야 합니다. 스크립트 안에서 TLS를 설정하려 하면 이미 첫 다운로드에는 늦습니다.",
          "설치 후에는 새 PowerShell 창을 열어야 PATH에 omm이 반영됩니다.",
          "Python 3.10+가 필요합니다. 없으면 스크립트가 winget으로 Python과 git을 설치합니다.",
        ],
        alternatives: [
          "모든 OS · PyPI 경유, 서명 검증 없음 — 배포 이름은 omm-model이지만 명령은 그대로 omm입니다",
        ],
      },
      guideLink: "{os} 설치 가이드",
    },
  },

  footer: {
    tagline: "MIT · Python 3.10+ · Windows, macOS, Linux",
    aria: "푸터",
    docs: {
      title: "문서",
      links: [
        "Windows 설치 가이드",
        "macOS 설치 가이드",
        "Linux 설치 가이드",
        "README",
        "지원 플랫폼",
        "저장 위치",
        "스크립팅",
        "호환 프로그램",
      ],
    },
    commands: { title: "명령" },
    project: {
      title: "프로젝트",
      links: ["기여 방법", "행동 강령", "보안 정책", "서드파티 고지", "라이선스"],
    },
    source: {
      title: "소스",
      links: ["저장소", "이슈", "릴리스", "Wiki"],
    },
    license: "MIT 라이선스",
    build: "빌드 {sha}",
  },

  installChooser: {
    metaTitle: "omm 설치",
    metaDescription:
      "운영체제를 고르면 단계별 omm 설치 가이드로 이어집니다. 어떤 터미널 앱을 열어야 하는지, 정확한 명령은 무엇인지, 설치 스크립트가 무엇을 검증하는지, 오류 메시지마다 무슨 뜻인지까지 한 번에 설명합니다.",
    label: "설치",
    heading: "설치할 시스템을 고르세요.",
    lede: "각 가이드는 어떤 앱을 열어야 하는지부터 정확히 짚어 줍니다. 한 시스템의 설치 명령이 다른 시스템에서는 동작하지 않기 때문입니다. 이어서 명령, 설치 전에 검증하는 항목, 가장 먼저 해야 할 일, 그리고 설치 스크립트가 출력할 수 있는 모든 메시지와 그 대처법까지 다룹니다.",
    shortcut: [
      "터미널이 이미 익숙하다면 한 줄짜리 명령은 ",
      "랜딩 페이지",
      "에서 바로 볼 수 있습니다.",
    ],
  },

  guide: {
    sections: [
      "어떤 앱을 열어야 하나",
      "시작하기 전에",
      "설치",
      "설치 스크립트가 하는 일",
      "설치한 다음",
      "이 시스템의 러너",
      "저장 위치, 자동 완성, 제거",
      "문제가 생겼다면",
    ],
    breadcrumbAria: "탐색 경로",
    onThisPage: "이 페이지의 내용",
    notThisOne: "이 창은 아닙니다 — ",
    installCommandAria: "{os} 설치 명령",
    verificationBody:
      "한 줄짜리 설치 스크립트는 그냥 내려받아 실행하는 게 아닙니다. 세 단계를 순서대로 거치며, 가져온 코드가 omm이 서명한 코드와 다르면 두 번째 단계에서 곧바로 멈춥니다.",
    verificationNote:
      "커밋의 진위가 중요하다면 이 과정을 검증 없는 git clone과 pipx install로 대체하지 마세요.",
    scanReports: "omm scan이 출력하는 항목",
    runnersHeading: "{os}의 러너",
    linkingHeading: "이 시스템에서 omm이 모델을 노출하는 방식",
    storageHeading: "모델이 저장되는 위치",
    storageAria: "OMM_HOME 설정",
    completionHeading: "셸 자동 완성",
    completionAria: "셸 자동 완성 설치",
    uninstallHeading: "제거",
    uninstallAria: "omm 제거",
    troubleBody:
      "아래 메시지는 모두 설치 스크립트, 제거 스크립트, 셸이 실제로 출력하는 것들입니다. 해당하는 메시지를 찾아 원인을 읽고, 마지막 줄대로 하면 됩니다.",
    troubleWhy: "원인",
    troubleFix: "대처",
    troubleSource: "출처",
    stillStuck:
      "그래도 해결되지 않는다면, 화면에 뜬 메시지 그대로와 omm scan 출력을 함께 첨부해 이슈를 등록하세요.",
    elsewhere: "다른 문서",
    installOn: "{os}에 설치",
    repo: {
      title: "소스와 README",
      body: "github.com/omm-hippo/omm — 이슈, 릴리스, 그리고 이 페이지에서 인용한 설치 스크립트가 모두 여기에 있습니다.",
    },
    wiki: {
      title: "Wiki",
      body: "호환 프로그램 목록과 더 긴 형식의 문서.",
    },
  },

  commandsChooser: {
    metaTitle: "omm 명령어",
    metaDescription:
      "omm 명령어별 전체 레퍼런스 페이지: 모든 옵션, 초급부터 스크립팅까지 실제 예제, 실제 캡처한 실행 결과, 각 명령이 실제로 출력하는 에러까지 다룹니다.",
    label: "명령어",
    heading: "전체 레퍼런스를 볼 명령어를 고르세요.",
    lede: "각 페이지는 명령이 무엇을 위한 것이고 언제 쓰는지, 모든 옵션, 실제 예제 5개, 실제 캡처한 실행 결과, 그리고 실제로 출력되는 에러와 대처법까지 다룹니다.",
  },

  commands: {
    breadcrumbAria: "탐색 경로",
    onThisPage: "이 페이지의 내용",
    sections: [
      "개요",
      "옵션",
      "예제",
      "실제 실행 예시",
      "관련 명령어",
      "문제가 생겼다면",
    ],
    optionsIntro: "이 명령이 받는 모든 옵션과, 생략했을 때의 기본값입니다.",
    optionsColumns: { flag: "옵션", argument: "인자", default: "기본값" },
    examplesIntro: "기본 검색부터 스크립트에 넣을 만한 형태까지.",
    captureAria: "{command} 실행 녹화",
    troubleBody:
      "아래 메시지는 모두 이 명령이 실제로 출력하는 것들입니다. 해당하는 메시지를 찾아 원인을 읽고, 마지막 줄대로 하면 됩니다.",
    troubleWhy: "원인",
    troubleFix: "대처",
    troubleSource: "출처",
    stillStuck: "그래도 해결되지 않는다면, 화면에 뜬 메시지 그대로를 첨부해 이슈를 등록하세요.",
    elsewhere: "전체 명령어",
  },
} as const satisfies Dictionary;
