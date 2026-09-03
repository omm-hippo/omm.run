import assert from "node:assert/strict";
import test from "node:test";

import { buildCommitSha, publishedVersion } from "../src/lib/site-metadata";

test("version badge accepts published OMM metadata without a guessed fallback", () => {
  assert.equal(publishedVersion({ info: { name: "omm-model", version: "0.3.41" } }), "v0.3.41");
  for (const data of [null, {}, { info: null }, { info: { name: "other", version: "0.3.41" } },
    { info: { name: "omm-model", version: 341 } }, { info: { name: "omm-model", version: "main" } }]) {
    assert.equal(publishedVersion(data), null);
  }
});

test("Cloudflare's build commit takes precedence without invoking git", () => {
  const cloudflare = "a".repeat(40);
  const sha = buildCommitSha({ WORKERS_CI_COMMIT_SHA: cloudflare, VERCEL_GIT_COMMIT_SHA: "b".repeat(40) }, () => {
    assert.fail("git should not run when the CI commit is present");
  });
  assert.equal(sha, cloudflare);
});

test("build commit handles Pages, GitHub, local checkout and source archives", () => {
  const sha = "c".repeat(40);
  assert.equal(buildCommitSha({ CF_PAGES_COMMIT_SHA: sha }, () => ""), sha);
  assert.equal(buildCommitSha({ GITHUB_SHA: sha }, () => ""), sha);
  assert.equal(buildCommitSha({ WORKERS_CI_COMMIT_SHA: "unknown" }, () => `${sha}\n`), sha);
  assert.equal(buildCommitSha({}, () => "not-a-commit"), "");
  assert.equal(buildCommitSha({}, () => { throw new Error("git unavailable"); }), "");
});
