import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, canonicalPath, isLocale, type Locale } from "@/i18n/config";

/**
 * Korean-default routing, independent of browser language and old cookies.
 *
 *   `/install/windows`     → rewritten to `/ko/install/windows` (URL unchanged)
 *   `/en/install/windows`  → served in English
 *   `/ko/install/windows`  → 308 to `/install/windows`
 */

export const config = {
  /* Everything except Next's internals, API routes and files with an
     extension (favicon.ico, /public assets): a rewrite or redirect on those
     would break the asset rather than translate it. */
  matcher: ["/((?!_next/|api/|.*\\.[^/]*$).*)"],
};

/**
 * Next.js runs Middleware again for an internal rewrite. Mark the rewritten
 * request so `/commands` can reach `/ko/commands` without the legacy-prefix
 * redirect sending it back to `/commands` forever.
 */
const INTERNAL_LOCALE_REWRITE = "x-omm-internal-locale-rewrite";

function withPrefix(pathname: string, locale: Locale): string {
  return pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    request.headers.get(INTERNAL_LOCALE_REWRITE) === "1" &&
    (pathname === `/${DEFAULT_LOCALE}` || pathname.startsWith(`/${DEFAULT_LOCALE}/`))
  ) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.delete(INTERNAL_LOCALE_REWRITE);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const first = pathname.split("/")[1] ?? "";
  if (first === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = canonicalPath(pathname);
    return NextResponse.redirect(url, 308);
  }

  if (isLocale(first)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = withPrefix(pathname, DEFAULT_LOCALE);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(INTERNAL_LOCALE_REWRITE, "1");
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}
