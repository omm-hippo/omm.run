/**
 * Korean copy for the command doc pages. Translation of the English page —
 * commands, flags, file paths and verbatim printed messages stay in English,
 * per design/FACTS.md's "Korean locale" section.
 */

import type { CommandTextSet } from "@/i18n/commands/shape";

export const COMMANDS_KO: CommandTextSet = {
  search: {
    metaTitle: "omm search — 모델 찾기",
    metaDescription:
      "omm search 전체 레퍼런스: 모든 옵션, 초급부터 스크립팅까지 실제 예제 5개, 실제 캡처한 실행 결과, 그리고 실제로 출력되는 에러 3가지.",
    heading: "omm search",
    lede: "omm의 큐레이션 카탈로그, 캐시된 후보, HuggingFace, ModelScope를 한 번의 검색으로 조회합니다.",
    summary: "큐레이션 카탈로그, HuggingFace, ModelScope에서 모델을 한 번에 찾습니다.",

    overviewBody:
      "install 전에 먼저 쓰는 명령입니다. install이 받는 정확한 저장소 참조나 번호를 여기서 찾습니다. 결과는 모델 계열별로 묶여 터미널에 번호가 매겨지고, 이 하드웨어에서 못 돌아갈 걸로 예측되는 모델은 감춰지는 대신 빨간색으로 표시됩니다 — --skip-unfit을 주면 그때는 아예 제외됩니다. search가 매긴 번호는 그 명령을 실행한 터미널 안에서만 유효합니다: 다음 search나 list를 실행하면 번호가 다시 매겨집니다.",

    optionDescriptions: [
      "검색할 텍스트. 큐레이션/캐시 카탈로그를 먼저 매칭한 다음 HuggingFace, ModelScope 순으로 찾습니다.",
      "이 하드웨어에서 못 돌아갈 걸로 예측되는 모델을 빨간색으로 보여주는 대신 결과에서 아예 뺍니다.",
      "결과를 이 개수까지만 보여줍니다.",
      "이 출처의 결과만 보여줍니다: curated(실제 호스트가 아닌 omm 내장/캐시 카탈로그), huggingface, modelscope 중 하나.",
      "ModelScope는 조회하지 않습니다. ModelScope 결과는 후보 저장소마다 네트워크 요청이 하나씩 더 필요해서 검색이 눈에 띄게 느려질 수 있습니다.",
      "정돈된 목록 대신 구조화된 JSON을 표준출력으로 찍습니다 — search가 표준출력에 쓰는 유일한 것이라 파이프로 안전하게 연결할 수 있습니다.",
    ],

    exampleCaptions: [
      "기본 검색 — 계열별로 묶여 번호가 매겨집니다. 이 번호를 install에 그대로 넘길 수 있습니다.",
      "결과 개수를 제한합니다.",
      "이 머신에서 못 돌아갈 걸로 예측되는 모델은 빨간색 표시 대신 아예 뺍니다.",
      "큐레이션 카탈로그와 ModelScope는 건너뛰고 HuggingFace 결과만 봅니다.",
      "JSON 출력을 jq로 연결합니다 — search가 표준출력에 쓰는 게 --json뿐이라 안전합니다.",
    ],

    captureFootnote:
      "2026-08-24, 이 개발 머신에서 실제로 실행한 omm search qwen --limit 5 캡처입니다. HuggingFace·ModelScope 순위는 계속 바뀌므로 다시 실행하면 다른 저장소가 나옵니다.",

    trouble: [
      {
        why: "--provider는 세 값 중 하나만 받는데, 이번 실행에서는 다른 값을 줬습니다.",
        fix: "curated, huggingface, modelscope 중 하나를 쓰세요.",
      },
      {
        why: "--skip-ms는 ModelScope를 조회하지 말라는 뜻이고, --provider modelscope는 ModelScope 결과만 보여달라는 뜻입니다. 서로 상쇄됩니다.",
        fix: "--skip-ms를 빼거나, --provider를 curated나 huggingface로 바꾸세요.",
      },
      {
        why: "큐레이션 카탈로그, 캐시된 후보, HuggingFace, ModelScope 어디에도 이 검색어와 일치하는 게 없었습니다.",
        fix: "더 짧거나 다르게 쓴 검색어를 시도하세요 — search는 정확한 저장소 ID가 아니라 이름으로 매칭합니다.",
      },
    ],

    relatedBlurbs: [
      "search가 방금 출력한 번호나 저장소 참조로 설치합니다.",
      "뭘 찾아야 할지 모르겠다면, recommend가 이 머신에 맞는 모델을 대신 골라줍니다.",
    ],
  },
};
