import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Disclosure from '../src/components/Disclosure';
import ResourceLinks from '../src/components/ResourceLinks';
import { documentParagraphs } from '../src/lib/document-text';
import { getExperience } from '../src/i18n/experience';

test('disclosures preserve semantic summary, default state and their actual content', () => {
  const closed = renderToStaticMarkup(createElement(Disclosure, { id: 'memory', title: '메모리 확인' }, createElement('p', null, '실제 조건과 확인 방법')));
  assert.match(closed, /<details[^>]*id="memory"/);
  assert.match(closed, /<summary>/);
  assert.match(closed, /실제 조건과 확인 방법/);
  assert.doesNotMatch(closed, / open=""/);
  const open = renderToStaticMarkup(createElement(Disclosure, { title: 'Guide', defaultOpen: true }, 'Read the guide'));
  assert.match(open, / open=""/);
});

test('reading paragraphs preserve technical strings, sentence order and language content', () => {
  for (const [locale, source] of [
    ['ko', 'Ollama 0.14.0 이상이 필요합니다. 주소는 http://127.0.0.1:11434입니다. 4.37 GB와 4.07 GiB는 서로 다른 단위입니다. '.repeat(5)],
    ['en', 'Use Ollama 0.14.0 at http://127.0.0.1:11434. Keep the 32,768-token configuration. A 4.37 GB file is not 4.37 GiB. '.repeat(5)],
  ] as const) {
    const blocks = documentParagraphs(source, locale);
    assert.ok(blocks.length > 1);
    assert.equal(blocks.join('').replace(/\s/gu, ''), source.replace(/\s/gu, ''));
  }
});

test('all advertised reference downloads exist and are readable in both locales', async () => {
  for (const locale of ['ko', 'en'] as const) {
    const html = renderToStaticMarkup(createElement(ResourceLinks, { locale }));
    for (const name of [`omm-first-steps-${locale}.txt`, `omm-model-checklist-${locale}.md`]) {
      assert.ok(html.includes(`/resources/${name}`));
      const text = await readFile(new URL(`../public/resources/${name}`, import.meta.url), 'utf8');
      assert.ok(text.length > 300);
      assert.ok(text.includes('omm'));
    }
    assert.ok(html.includes(`omm-models-${locale}.json`));
    assert.equal(getExperience(locale).tabs.length, 3);
    assert.equal(getExperience(locale).questions.length, 5);
  }
});
