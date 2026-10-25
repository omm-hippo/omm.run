import type { Locale } from '@/i18n/config';
import { getSiteCopy } from '@/i18n/site';
import { getNotionPublications } from '@/lib/notion-publications';

export default function NotionReading({ locale, ids, publications = getNotionPublications() }: {
  locale: Locale;
  ids?: readonly string[];
  publications?: ReturnType<typeof getNotionPublications>;
}) {
  const t = getSiteCopy(locale);
  const { hubUrl, articles } = publications;
  const visible = articles.filter((article) => (!ids || ids.includes(article.id)) && Object.hasOwn(t.articles, article.id));
  if (!hubUrl && !visible.length) return null;
  return <section className="notion-reading" aria-labelledby="further-reading">
    <h2 id="further-reading">{t.readingTitle}</h2>
    <p>{t.readingIntro}</p>
    <ul className="document-link-list">
      {visible.map((article) => <li key={article.id}><a href={article.url} target="_blank" rel="noreferrer">{t.articles[article.id as keyof typeof t.articles]} <span aria-hidden>↗</span></a></li>)}
      {hubUrl ? <li><a href={hubUrl} target="_blank" rel="noreferrer">{t.notionHub} <span aria-hidden>↗</span></a></li> : null}
    </ul>
  </section>;
}
