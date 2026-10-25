import assert from 'node:assert/strict';
import test from 'node:test';
import { GET } from '../src/app/api/assistant/catalog/route';
import { getAssistantCards } from '../src/lib/assistant/cards';
import { COMMAND_IDS } from '../src/lib/assistant/catalog';
import { narrowCandidates } from '../src/lib/assistant/knowledge';
import { parseAssistantRequestText } from '../src/lib/assistant/request';
import { answerAssistantQuestion } from '../src/lib/assistant/service';

const CASES = [
  ['ko','PDF 문서를 컬렉션에 등록하고 질문하고 싶다','rag'],
  ['en','Register document search as an MCP tool in Codex','rag'],
  ['ko','맥 여러 대로 더 큰 모델을 서비스하려고 해','cluster'],
  ['en','Have a cluster of Mac minis serve a bigger model','cluster'],
  ['ko','클로드 코드를 올라마 로컬 모델로 연결','setting'],
  ['en','Point Codex at local Ollama','setting'],
  ['ko','파일은 남기고 LM Studio 연결만 끊어','unlink'],
  ['en','Unlink one runtime while leaving weights in the hub','unlink'],
  ['ko','초당 토큰 수를 측정하고 싶다','benchmark'],
  ['en','Measure throughput in tok/s','benchmark'],
  ['ko','기존 GGUF 파일을 허브로 가져와','import'],
  ['en','Collect a support bundle without uploading it','bug-report'],
  ['ko','추천 말고 이 모델이 내 메모리에 돌아갈지 궁금해','fit'],
  ['en','Do not recommend another model, tell me if this fits in RAM','fit'],
  ['ko','이전 버전 모델로 되돌리고 싶어','rollback'],
  ['en','Keep this model out of upgrades with a pin','pin'],
] as const;

test('task paraphrases and counterexamples reach a relevant documented candidate', () => {
  for (const [locale, question, expected] of CASES) {
    const ids = narrowCandidates(question, locale).slice(0, 3).map((value) => value.id);
    assert.ok(ids.includes(expected), `${question}: ${ids.join(', ')}`);
  }
});

test('catalog API exposes the same static projection and rejects unknown locales', async () => {
  for (const locale of ['ko','en'] as const) {
    const response = GET(new Request(`https://example.test/api/assistant/catalog?locale=${locale}`));
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.deepEqual(data.cards, getAssistantCards(locale));
    assert.deepEqual(data.cards.map((card: {id:string}) => card.id).sort(), [...COMMAND_IDS].sort());
  }
  assert.equal(GET(new Request('https://example.test/api/assistant/catalog?locale=xx')).status, 400);
});

test('page context is a validated command ID and cannot be a URL or a hidden command', () => {
  for (const contextCommand of ['not-a-command','_bg-version-check','https://example.test']) {
    assert.equal(parseAssistantRequestText(JSON.stringify({locale:'ko',question:'이 명령어는 뭐야?',contextCommand})).ok, false);
  }
  assert.equal(parseAssistantRequestText(JSON.stringify({locale:'ko',question:'이 명령어는 어떻게 쓰나요?',contextCommand:'install'})).ok, true);
});

test('deictic page help uses static documentation without spending inference', async () => {
  let calls=0;
  const dependencies={clientIdentity:'test',ai:{async run(){calls++;return {}}}};
  const result=await answerAssistantQuestion({locale:'ko',question:'이 명령어는 어떻게 쓰나요?',turnCount:0,contextCommand:'install'},dependencies);
  assert.equal(result.commandId,'install');assert.equal(calls,0);
  const secret=await answerAssistantQuestion({locale:'en',question:'explain this https://example.test/private',turnCount:0,contextCommand:'install'},dependencies);
  assert.equal(secret.reason,'unsafe_input');assert.equal(calls,0);
  const unrelated=await answerAssistantQuestion({locale:'en',question:'what is this recipe for ramen',turnCount:0,contextCommand:'install'},dependencies);
  assert.notEqual(unrelated.commandId,'install');
});

test('group guidance uses safe help entry points and concise localized summaries', () => {
  const cards=getAssistantCards('ko');
  for(const id of ['engine','setting','rag','cluster']) {
    const card=cards.find((value)=>value.id===id)!;
    assert.equal(card.name,`omm ${id}`);
    assert.equal(card.example,`omm ${id} --help`);
    assert.ok(/[가-힣]/u.test(card.summary));
  }
  assert.equal(cards.find((value)=>value.id==='rag')!.risk,'high-impact');
});
