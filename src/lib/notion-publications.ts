import publications from '../data/notion-publications.json';

/** Public links only. No account connection, API token or runtime fetch. */
export function publicNotionUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value);
    const host = url.hostname;
    const notionHost = ['notion.site', 'notion.so'].some((domain) => host === domain || host.endsWith(`.${domain}`));
    if (url.protocol !== 'https:' || !notionHost || url.username || url.password || url.port) return null;
    // Publish URLs should never carry login/redirect/tracking parameters.
    url.search = '';
    return url.href;
  } catch { return null; }
}

export function getNotionPublications(source: { hubUrl: unknown; articles: readonly { id: string; url: unknown }[] } = publications) {
  return {
    hubUrl: publicNotionUrl(source.hubUrl),
    articles: source.articles.flatMap((article) => {
      const url = publicNotionUrl(article.url);
      return url ? [{ id: article.id, url }] : [];
    }),
  };
}
