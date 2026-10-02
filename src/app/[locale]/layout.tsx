import type { Metadata } from "next";
import { Archivo, Noto_Sans_KR } from "next/font/google";
import localFont from "next/font/local";
import { notFound } from "next/navigation";

import {
  HTML_LANG,
  LOCALES,
  OG_LOCALE,
  alternatesFor,
  isLocale,
} from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import "../globals.css";

// Variable Archivo: wght 100–900 plus the wdth axis (62–125) so `.text-display`
// can set `font-variation-settings: "wdth" 90`. Weights actually used: 400–700.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

// Archivo has no Hangul. Noto Sans KR is the Hangul fallback only: it sits
// *after* Archivo in `--font-sans` and after JetBrains Mono in `--font-mono`,
// so Latin text, digits and box-drawing glyphs keep their original fonts.
// DIRECTION.md §3 records the font pairing.
const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

// Self-hosted full-glyph build (OFL, src/fonts/OFL.txt): the Google-served
// latin subset lacks the box-drawing block (U+2500–257F), so the terminal
// tables fell back to a different-width mono and their rules misaligned.
const jetbrainsMono = localFont({
  variable: "--font-jetbrains",
  src: [
    { path: "../../fonts/JetBrainsMono-Regular.woff2", weight: "400" },
    { path: "../../fonts/JetBrainsMono-Medium.woff2", weight: "500" },
    { path: "../../fonts/JetBrainsMono-Bold.woff2", weight: "700" },
  ],
  display: "swap",
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/** Validate locales in the layout instead of disabling fallback for every
 * nested dynamic route. Otherwise an unknown model id can throw
 * NoFallbackError before notFound(), then repeat the locale rewrite. */

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);

  return {
    metadataBase: new URL("https://www.omm.run"),
    title: dictionary.meta.title,
    description: dictionary.meta.description,
    applicationName: "omm",
    alternates: alternatesFor("/"),
    openGraph: {
      type: "website",
      siteName: "omm",
      url: alternatesFor("/").canonical,
      locale: OG_LOCALE[locale],
      title: dictionary.meta.title,
      description: dictionary.meta.description,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html
      lang={HTML_LANG[locale]}
      className={`${archivo.variable} ${jetbrainsMono.variable} ${notoSansKr.variable} h-full antialiased`}
    >
      <body className="grain min-h-full flex flex-col">{children}</body>
    </html>
  );
}
