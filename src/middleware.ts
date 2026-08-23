import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";

/**
 * Locale routing.
 *
 * The app tree is `app/[locale]/…`, but English is published without a prefix,
 * so this file is the seam between the two:
 *
 *   `/install/windows`     → rewritten to `/en/install/windows` (URL unchanged)
 *   `/en/install/windows`  → 308 to `/install/windows` (one canonical URL)
 *   `/ko/install/windows`  → served as-is
 *
 * English is the default for every first visit regardless of the browser's
 * `Accept-Language`; Korean is reached only through the language toggle or a
 * `/ko` link. (An automatic header-based redirect used to live here and was
 * removed on purpose - a Korean-locale browser should still land on the
 * canonical English site.) The `omm_locale` cookie set by the toggle is left in
 * place for the toggle itself.
 */

export const config = {
  /* Everything except Next's internals, API routes and files with an
     extension (favicon.ico, /public assets): a rewrite or redirect on those
     would break the asset rather than translate it. */
  matcher: ["/((?!_next/|api/|.*\\.[^/]*$).*)"],
};

function withPrefix(pathname: string, locale: Locale): string {
  return pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
}

export function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  if (hostname === "www.omm.run") {
    const url = request.nextUrl.clone();
    url.hostname = "omm.run";
    return NextResponse.redirect(url, 308);
  }

  const first = pathname.split("/")[1] ?? "";

  if (first === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    const rest = pathname.slice(`/${DEFAULT_LOCALE}`.length);
    url.pathname = rest === "" ? "/" : rest;
    return NextResponse.redirect(url, 308);
  }

  if (isLocale(first)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = withPrefix(pathname, DEFAULT_LOCALE);
  return NextResponse.rewrite(url);
}
