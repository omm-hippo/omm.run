import type { Locale } from "./config";

const ko = {
  metaTitle: "모델 위키 — omm",
  metaDescription: "오픈 웨이트 LLM의 추천 용도, 특징, 한계, 공식 출처를 비교하세요. 사용자와 애플리케이션을 위한 모델 선택 자료입니다.",
  eyebrow: "MODEL WIKI", heading: "어떤 모델을 쓸지, 특징부터 비교하세요.",
  lede: "코딩, 에이전트, 추론, 이미지 이해. 각 체크포인트가 어떤 작업을 목표로 하는지, 무엇을 확인해야 하는지 근거와 함께 정리했습니다.",
  mobileLede: "모델별 용도·특징·한계를 공식 출처와 함께 비교합니다.",
  checkpoints: "체크포인트", reviewed: "출처 확인", taskHeading: "어떤 작업에 쓰나요?", all: "전체 모델",
  tasks: { agents: "에이전트·도구 사용", coding: "코딩", reasoning: "추론·수학", vision: "이미지 이해", multilingual: "다국어", compact: "소형 모델" },
  search: "모델 검색", searchPlaceholder: "모델명, 개발사, 용도 검색…", publisher: "개발사", allPublishers: "전체 개발사",
  visionOnly: "이미지 입력 지원만", result: "개 모델 표시", clear: "필터 초기화", empty: "조건에 맞는 모델이 없습니다.",
  emptyHint: "모델명을 짧게 입력하거나 필터를 초기화해 보세요.",
  model: "모델 / 체크포인트", bestFor: "이럴 때 검토하세요", specs: "크기 / 컨텍스트", details: "자세히 보기", compare: "비교",
  selected: "개 선택", compareHint: "최대 3개 체크포인트를 선택해 비교할 수 있습니다.", compareMax: "3개를 선택했습니다. 하나를 해제하면 더 선택할 수 있습니다.",
  comparison: "체크포인트 비교", closeComparison: "비교 닫기", compareSelected: "선택한 모델 비교", clearSelected: "선택 해제",
  chooseWhen: "이럴 때 검토하세요", strengths: "공개된 특징", cautions: "한계와 선택 시 유의점", runtime: "실행 전에 확인할 것",
  architecture: "아키텍처", dense: "Dense", moe: "Mixture of experts", active: "활성", total: "전체", context: "컨텍스트 길이",
  native: "기본", configured: "설정 파일 기준", extended: "별도 설정으로 확장", input: "입력", inputs: { text: "텍스트", image: "이미지", video: "영상" },
  tools: "도구 호출", documented: "공식 문서에 명시", unconfirmed: "미확인", license: "라이선스 / 이용약관",
  officialSources: "공식 출처", publisherClaim: "개발사 설명", editorial: "OMM 편집 의견", lastReviewed: "마지막 출처 확인",
  evaluation: "OMM 실측", notMeasured: "아직 OMM에서 실측하지 않음", back: "전체 모델", repository: "공식 모델 카드",
  evidenceTitle: "특징과 실측 결과를 구분합니다.",
  evidenceNote: "추천 용도는 선택을 돕는 편집 의견입니다. 공개된 특징은 개발사 설명이며 OMM 실측 결과가 아닙니다. 로컬 속도, 한국어 품질, 도구 호출 신뢰도는 사용할 러너와 양자화에서 확인해야 합니다.",
  openWeightsNote: "오픈 웨이트 모델을 포함합니다. 가중치 공개와 오픈소스 라이선스는 다를 수 있으므로 모델별 이용 조건을 확인하세요.",
  sizeNote: "크기는 체크포인트의 공개 표기를 따릅니다. MoE의 활성 파라미터는 전체 가중치 크기가 아니며, 컨텍스트 토큰 수는 RAM 요구량이 아닙니다.",
  handoffHeading: "내 환경에서 확인하고 선택하세요.",
  handoffBody: "호환되는 모델 파일을 찾고, 메모리 적합성을 확인한 뒤 정확한 모델과 러너로 측정하세요. 위키 등록만으로 OMM에서 내려받아 실행할 수 있음이 입증되지는 않습니다.",
  searchCommand: "OMM으로 검색", fitCommand: "메모리 적합성 확인", benchmarkCommand: "성능 측정",
  json: "모델 데이터 (JSON)", contribution: "내용 수정 제안", contributionBody: "정확한 체크포인트, 공식 출처, 수정할 내용을 함께 알려주세요.",
};

export function getModelDictionary(locale: Locale) {
  const dictionaries = { ko };
  return dictionaries[locale];
}
