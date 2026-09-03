import assert from "node:assert/strict";
import test from "node:test";

import { POST } from "../src/app/api/assistant/route";
import { inspectInput } from "../src/lib/assistant/security";
import { answerAssistantQuestion } from "../src/lib/assistant/service";
import type { AssistantStore } from "../src/lib/assistant/budget";
import { DEFAULT_WORKERS_AI_MODEL, selectWithWorkersAi } from "../src/lib/assistant/workers-ai";

test("common pasted credentials stop before any model or store call", async () => {
  // Deliberately synthetic, nonworking credentials; never use real keys here.
  const credentials = [
    `github_pat_${"a".repeat(70)}`,
    `sk-proj-${"b".repeat(60)}`,
    `sk-${"c".repeat(40)}`,
    `hf_${"d".repeat(34)}`,
  ];
  let calls = 0;
  const store: AssistantStore = {
    async consume() { calls += 1; return true; },
    async getSelection() { calls += 1; return null; },
    async putSelection() { calls += 1; },
  };
  for (const credential of credentials) {
    const question = `I need to install a model ${credential}`;
    assert.equal(inspectInput(question), "sensitive");
    const result = await answerAssistantQuestion(
      { locale: "en", question, turnCount: 0 },
      {
        clientIdentity: "test-client",
        hashSalt: "synthetic-test-salt",
        store,
        ai: { async run() { calls += 1; return {}; } },
      },
    );
    assert.equal(result.reason, "sensitive_input");
  }
  assert.equal(calls, 0);
});

function streamingRequest(body: ReadableStream<Uint8Array>): Request {
  return new Request("http://localhost/api/assistant", {
    method: "POST", body, duplex: "half",
  } as RequestInit & { duplex: "half" });
}

test("oversized chunked bodies are cancelled before the entire upload is read", async () => {
  let pulls = 0;
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      pulls += 1;
      controller.enqueue(new Uint8Array(9_000));
      if (pulls === 20) controller.close();
    },
    cancel() { cancelled = true; },
  });
  const response = await POST(streamingRequest(stream));
  assert.equal(response.status, 400);
  assert.equal((await response.json()).reason, "invalid_request");
  assert.equal(cancelled, true);
  assert.ok(pulls <= 2, `read ${pulls} chunks before rejecting`);
});

test("interrupted request streams return the invalid request contract", async () => {
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) { controller.error(new Error("upload interrupted")); },
  });
  const response = await POST(streamingRequest(stream));
  assert.equal(response.status, 400);
  assert.equal((await response.json()).reason, "invalid_request");
});

test("a Unicode request split inside a UTF-8 character reaches the route intact", async () => {
  const bytes = new TextEncoder().encode(JSON.stringify({
    locale: "ko", question: "가나다 omm help", turnCount: 0,
  }));
  let index = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index === bytes.length) controller.close();
      else controller.enqueue(bytes.slice(index, ++index));
    },
  });
  const response = await POST(streamingRequest(stream));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).commandId, "help");
});

test("a synchronous binding failure falls back once instead of rejecting the route", async () => {
  let calls = 0;
  const result = await selectWithWorkersAi(
    { run() { calls += 1; throw new Error("binding unavailable"); } },
    DEFAULT_WORKERS_AI_MODEL,
    "en",
    "install a model",
    [],
  );
  assert.deepEqual(result, { ok: false, reason: "provider_unavailable" });
  assert.equal(calls, 1);
});
