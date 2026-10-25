import { isLocale } from '@/i18n/config';
import { getAssistantCards } from '@/lib/assistant/cards';

/** Static documentation only; opening the dock never invokes inference. */
export function GET(request: Request): Response {
  const locale = new URL(request.url).searchParams.get('locale') ?? 'ko';
  if (!isLocale(locale)) return Response.json({ error: 'invalid_locale' }, { status: 400 });
  return Response.json({ cards: getAssistantCards(locale) }, { headers: { 'cache-control': 'public, max-age=300', 'x-content-type-options': 'nosniff' } });
}
