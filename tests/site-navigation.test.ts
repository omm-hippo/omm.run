import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import NotionReading from '../src/components/NotionReading';
import { navigationGroup, primaryNavigation } from '../src/lib/site-navigation';
import { getNotionPublications, publicNotionUrl } from '../src/lib/notion-publications';
import { getUseCases, getSiteCopy } from '../src/i18n/site';

test('nested and translated destinations keep the correct primary section active', () => {
  for (const [path, group] of [
    ['/', 'intro'], ['/en', 'intro'], ['/en/use-cases/local-chat', 'use-cases'],
    ['/ko/models/qwen3-8b', 'models'], ['/arena', 'models'], ['/leaderboard', 'models'],
    ['/install/macos', 'docs'], ['/en/commands/setting#agent', 'docs'],
    ['/docs/faq', 'docs'], ['/assistant', 'docs'], ['/news', 'news'],
    ['/models-other', null], ['/documentation', null],
  ] as const) assert.equal(navigationGroup(path), group, path);
  for (const locale of ['ko', 'en'] as const) {
    assert.equal(primaryNavigation(locale).length, 5);
    assert.equal(new Set(primaryNavigation(locale).map((item) => item.href)).size, 5);
    assert.equal(getUseCases(locale).length, 5);
    for (const guide of getUseCases(locale)) {
      assert.ok(guide.requirement && guide.result && guide.steps.length);
      assert.ok(guide.href.startsWith('/commands/'));
    }
  }
  assert.deepEqual(Object.keys(getSiteCopy('ko').articles), Object.keys(getSiteCopy('en').articles));
});

test('missing Notion publication settings expose no empty or fabricated links', () => {
  assert.deepEqual(getNotionPublications(), { hubUrl: null, articles: [] });
  for (const locale of ['ko', 'en'] as const) {
    assert.equal(renderToStaticMarkup(createElement(NotionReading, { locale })), '');
  }
});

test('Notion link configuration accepts HTTPS publication hosts and rejects unsafe lookalikes', () => {
  for (const value of [null, '', '/news', 'javascript:alert(1)', 'http://omm.notion.site/page',
    'https://notion.site.evil.test/page', 'https://evilnotion.site/page',
    'https://user:secret@omm.notion.site/page', 'https://omm.notion.site:444/page']) {
    assert.equal(publicNotionUrl(value), null, String(value));
  }
  assert.equal(publicNotionUrl('https://omm-hippo.notion.site/example?pvs=4#section'), 'https://omm-hippo.notion.site/example#section');
  assert.deepEqual(getNotionPublications({ hubUrl: null, articles: [
    { id: 'why-omm', url: 'https://omm-hippo.notion.site/example' },
    { id: 'not-ready', url: null },
    { id: 'bad', url: 'https://evil.test' },
  ] }), { hubUrl: null, articles: [{ id: 'why-omm', url: 'https://omm-hippo.notion.site/example' }] });
});

test('configured reading links render localized titles only on the relevant guide', () => {
  const publications = getNotionPublications({ hubUrl: null, articles: [
    { id: 'document-search', url: 'https://omm-hippo.notion.site/search-example' },
    { id: 'why-omm', url: 'https://omm-hippo.notion.site/overview-example' },
    { id: 'unknown-id', url: 'https://omm-hippo.notion.site/unknown-example' },
  ] });
  const html = renderToStaticMarkup(createElement(NotionReading, { locale: 'ko', ids: ['document-search'], publications }));
  assert.match(html, /내 문서에서 답변의 근거 찾기/);
  assert.match(html, /href="https:\/\/omm-hippo.notion.site\/search-example"/);
  assert.doesNotMatch(html, /overview-example|unknown-example/);
  const empty = renderToStaticMarkup(createElement(NotionReading, { locale: 'en', ids: [], publications }));
  assert.equal(empty, '');
  const news = renderToStaticMarkup(createElement(NotionReading, { locale: 'en', publications }));
  assert.match(news, /What problems does OMM solve/);
  assert.doesNotMatch(news, /unknown-example/);
});
