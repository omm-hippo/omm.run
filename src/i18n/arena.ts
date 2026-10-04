import type { Locale } from "./config";

const en = {
  title: "Local model leaderboard", eyebrow: "OMM ARENA", lede: "Quality tiers from blind comparisons. Efficiency stays a separate measure, comparable only inside the same tier and comparison group.",
  search: "Find a model", group: "Efficiency comparison group", all: "All groups", provisionalToggle: "Show models with insufficient samples", provisional: "Insufficient samples",
  quality: "Quality tier", model: "Model / checkpoint", efficiency: "Efficiency", votes: "Effective battles", groupName: "Group", unmeasured: "Not measured", warning: "Frequent both-bad votes", bothBad: "Both bad",
  updated: "Updated", verified: "Signature verified", example: "Example data for verification", empty: "No models match these filters.", loading: "Reading the signed leaderboard…",
  unavailable: "The leaderboard is being prepared.", unavailableNote: "A ranking will appear after sufficient comparison data passes the publication checks. No placeholder rankings are shown.",
  invalid: "The leaderboard could not be verified.", invalidNote: "The signature or data contract did not match. Unverified rankings are not displayed.", error: "The leaderboard is unavailable right now.", errorNote: "The published artifact could not be read. Try again later.",
  methodology: "How to read this table", notes: "Quality is grouped by overlapping comparison intervals. Higher efficiency breaks ties only within a tier and comparison group. Different groups are not comparable. Models with insufficient effective battles remain provisional; a missing measurement is not zero.",
  source: "Scoring method and source", participate: "Arena command reference", stale: "This snapshot is more than seven days old.", interval: "Log-strength interval", reference: "Reference tok/s per GiB", json: "Verified JSON",
};
const ko: typeof en = {
  title: "로컬 모델 리더보드", eyebrow: "OMM ARENA", lede: "블라인드 비교에서 얻은 품질 티어를 보여줍니다. 효율은 별도로 표시하며, 같은 티어와 비교 그룹 안에서만 비교할 수 있습니다.",
  search: "모델 찾기", group: "효율 비교 그룹", all: "모든 그룹", provisionalToggle: "표본 부족 모델도 표시", provisional: "표본 부족",
  quality: "품질 티어", model: "모델 / 체크포인트", efficiency: "효율", votes: "유효 대결 수", groupName: "그룹", unmeasured: "미측정", warning: "둘 다 나쁨 투표가 잦음", bothBad: "둘 다 나쁨",
  updated: "갱신", verified: "서명 확인됨", example: "검증용 예시 데이터", empty: "조건에 맞는 모델이 없습니다.", loading: "서명된 리더보드를 읽고 있습니다…",
  unavailable: "리더보드를 준비하고 있습니다.", unavailableNote: "충분한 비교 자료가 모이고 발행 기준을 통과하면 순위를 공개합니다. 임시 순위는 표시하지 않습니다.",
  invalid: "리더보드를 검증하지 못했습니다.", invalidNote: "서명이나 데이터 형식이 일치하지 않아 검증되지 않은 순위는 표시하지 않습니다.", error: "리더보드를 불러오지 못했습니다.", errorNote: "공개된 자료를 읽지 못했습니다. 잠시 후 다시 확인해 주세요.",
  methodology: "표를 읽는 방법", notes: "비교 결과의 구간이 겹치는 모델을 같은 품질 티어로 묶습니다. 효율은 같은 티어와 비교 그룹 안에서만 순서를 가릅니다. 서로 다른 그룹의 효율은 비교할 수 없습니다. 유효 대결 수가 부족한 모델은 순위에 포함하지 않으며, 미측정은 0점이 아닙니다.",
  source: "계산 방법과 출처", participate: "아레나 명령어 보기", stale: "이 자료는 갱신된 지 7일이 넘었습니다.", interval: "로그 강도 구간", reference: "참고 tok/s / GiB", json: "검증된 JSON",
};
export function arenaDictionary(locale: Locale) { return locale === "ko" ? ko : en; }
