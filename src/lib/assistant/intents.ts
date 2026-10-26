import type { CommandId } from './catalog';

/** Small domain intent priors. These rank documented commands; they never emit code. */
export function taskIntentScores(question: string): ReadonlyMap<CommandId, number> {
  const q = question.normalize('NFKC').toLowerCase().replace(/[’']/gu, '').replace(/\s+/gu, ' ').replace(/추천\s*말고|추천하지\s*말고|\b(?:dont|do not)\s+recommend\b/gu, '');
  const scores = new Map<CommandId, number>();
  const add = (id: CommandId, score: number) => scores.set(id, Math.max(scores.get(id) ?? 0, score));
  const model = /\b(?:models?|gguf|llama|qwen|gemma)\b|모델/u.test(q);
  const hardware = /\b(?:laptop|hardware|computer|ram|vram|memory)\b|컴퓨터|노트북|사양|메모리|램/u.test(q);
  const download = /\b(?:download|install)\b|다운로드|내려받|받아서|받고 싶|설치해|설치하|설치돼|설치되|깔아|안 깔/u.test(q);
  const runtime = /ollama|lm\s*studio|올라마|엘엠\s*스튜디오|러너/u.test(q);
  const diagnostic = /not detect|not recognized|missing runner|인식.*(?:못|안)|찾지 못|못 찾|감지.*(?:안|못)/u.test(q);

  if (/bug.{0,8}report|support.{0,8}(?:report|bundle)|버그.{0,5}(?:리포트|보고)|지원.{0,5}보고/u.test(q)) add('bug-report', 250);
  if (/\b(?:mcp|rag|collections?|embedding)\b|컬렉션|임베딩|문서.{0,20}(?:검색|질문|근거|공유|색인)|(?:검색|질문|공유).{0,12}문서/u.test(q)) add('rag', 240);
  if (/\bcluster\b|\b(?:multiple|two|three|several)\b.{0,15}\bmacs?\b|클러스터|맥.{0,12}(?:여러|묶|분산)|(?:여러|묶).{0,12}맥/u.test(q)) add('cluster', 230);
  if (/(?:codex|claude|\bpi\b|코덱스|클로드).{0,35}(?:local|ollama|로컬|올라마)|(?:local|로컬|올라마).{0,35}(?:codex|claude|코덱스|클로드)/u.test(q)) add('setting', 210);
  if (model && /which.{0,10}do i have|models?.{0,20}(?:i have|installed list)|list.{0,15}models?|(?:깔려|설치된|설치한).{0,15}모델.{0,12}(?:목록|뭐|보여)|내 모델.{0,8}목록/u.test(q)) add('list', 230);
  if (model && /recommend|추천|what model should i use|which model.{0,15}(?:choose|use)/u.test(q)) add('recommend', 235);
  if (model && /\b(?:find|search|looking for)\b|찾아|검색/u.test(q) && !diagnostic) add(hardware ? 'recommend' : 'search', 215);
  if (model && download && !diagnostic) add('install', 205);
  if (runtime && download && !model && !diagnostic) add('engine', 245);
  if (/\b(?:restore|rollback|revert)\b|go back.{0,20}(?:old|previous)|되돌|이전.{0,10}(?:버전|모델).{0,10}복/u.test(q)) add('rollback', 270);
  if (/already.{0,25}(?:gguf|files).{0,50}(?:take.{0,5}over|adopt|import)|from another app|(?:다른 앱|기존).{0,20}(?:gguf|모델|파일).{0,20}(?:가져|등록|편입)/u.test(q)) add('import', 235);
  if (/\bexport\b|내보내|복사본.{0,10}저장/u.test(q)) add('export', 220);
  if (/remove.{0,35}only.{0,20}keep|disconnect|unlink|연결만.{0,8}(?:해제|끊)|(?:파일|모델).{0,10}(?:남기|보존).{0,20}연결/u.test(q)) add('unlink', 280);
  if (/actually.{0,20}(?:produce|generat).{0,12}text|(?:check|verify).{0,25}(?:generation|response)|(?:응답|생성|답변).{0,15}(?:확인|되는지|되는 지)|실제.{0,10}(?:로드|생성)/u.test(q)) add('verify', 220);
  if (/tokens? per second|tok\/?s|(?:measure|benchmark).{0,15}speed|초당.{0,10}토큰|속도.{0,12}(?:측정|재고)|몇.{0,5}토큰/u.test(q)) add('benchmark', 230);
  if (/quantizations?.{0,30}(?:next to|side by side)|compare.{0,15}(?:specs|packages)|사양.{0,10}비교|(?:두|여러).{0,10}모델.{0,10}(?:정보|나란히)/u.test(q)) add('info', 230);
  if (/other people.{0,20}(?:rate|rank)|blind.{0,10}(?:battle|comparison)|leaderboard|리더보드|블라인드|투표/u.test(q)) add('arena', 220);
  if (/unpin|고정.{0,4}해제/u.test(q)) add('unpin', 240);
  else if (/\bpin\b|고정|업데이트.{0,10}(?:막|제외)|업그레이드.{0,10}제외/u.test(q)) add('pin', 215);
  if (/models?.{0,25}(?:newer upload|update|upgrade)|모델.{0,15}(?:새 버전|업데이트|업그레이드)/u.test(q)) add('upgrade', 220);
  if ((!model && /omm.{0,25}(?:update|latest|최신|업데이트)|(?:update|upgrade).{0,15}omm/u.test(q)) || /omm.{0,4}자체.{0,20}(?:최신|업데이트|올리)/u.test(q)) add('update', 245);
  if (model && hardware && /too big|enough|fit|돌아갈|돌릴 수|감당|맞는지|충분/u.test(q) && !/추천|recommend/u.test(q)) add('fit', 215);
  if (/(?:latest|newest).{0,25}omm|omm.{0,20}itself/u.test(q)) add('update', 245);
  if (/what did omm|command history|recent commands|yesterday.{0,20}fail|(?:실행|명령).{0,10}기록|어제.{0,10}(?:실패|작업)|로그/u.test(q)) add('log', 230);
  if (model && /usb|external drive|removable|이동식|외장/u.test(q)) add('export', 245);
  if (/lost.{0,20}models?.{0,25}(?:moved|folders)|모델.{0,10}(?:사라|안 보).{0,20}(?:폴더|옮)/u.test(q)) add('link', 250);
  return scores;
}
