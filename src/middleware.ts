import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, canonicalPath, isLocale, type Locale } from "@/i18n/config";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  detectLocale,
  isCrawler,
} from "@/i18n/detect";

/**
 * Korean-default routing. An unprefixed path goes to English only when the
 * visitor's saved choice, browser languages or region point away from Korean
 * (see `detectLocale`); crawlers and non-GET requests always get Korean.
 *
 *   `/install/windows`     → rewritten to `/ko/install/windows` (URL unchanged)
 *                            or 307 to `/en/install/windows` for non-Korean visitors
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
    const response = NextResponse.redirect(url, 308);
    /* An explicit /ko link is a choice: keep auto-detection from undoing it. */
    response.cookies.set(LOCALE_COOKIE, DEFAULT_LOCALE, {
      path: "/",
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: "lax",
    });
    return response;
  }

  if (isLocale(first)) return NextResponse.next();

  const locale =
    request.method === "GET" && !isCrawler(request.headers.get("user-agent"))
      ? detectLocale({
          cookie: request.cookies.get(LOCALE_COOKIE)?.value,
          acceptLanguage: request.headers.get("accept-language"),
          country: request.headers.get("cf-ipcountry"),
        })
      : DEFAULT_LOCALE;

  if (locale !== DEFAULT_LOCALE) {
    const target = request.nextUrl.clone();
    target.pathname = withPrefix(pathname, locale);
    const response = NextResponse.redirect(target, 307);
    response.headers.set("cache-control", "private, no-store");
    response.headers.append("vary", "accept-language, cookie");
    return response;
  }

  const url = request.nextUrl.clone();
  url.pathname = withPrefix(pathname, DEFAULT_LOCALE);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(INTERNAL_LOCALE_REWRITE, "1");
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}
