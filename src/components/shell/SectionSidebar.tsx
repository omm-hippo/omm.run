"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { canonicalPath, localeHref, type Locale } from "@/i18n/config";
import type { SectionMenu } from "@/lib/section-menus";

/**
 * The section sidebar. A client component only because layouts do not
 * re-render on navigation, so the current link has to come from
 * `usePathname`. On narrow screens it folds behind a toggle; the open state
 * is tied to the path it was opened on, so following a link closes it.
 * The current link is scrolled into the sidebar's own view. In a
 * collapsible menu (commands) only one group is open: the one holding the
 * current page, or the one the reader last clicked on this page.
 */
export default function SectionSidebar({ locale, menu, toggleLabels }: {
  locale: Locale;
  menu: SectionMenu;
  toggleLabels: { open: string; close: string };
}) {
  const pathname = usePathname();
  const current = canonicalPath(pathname).replace(/\/$/u, "") || "/";
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const isCurrent = (href: string) => !href.includes("#") && current === href;
  const currentGroup = menu.groups.find((group) => group.links.some((link) => isCurrent(link.href)))?.title ?? null;
  const [picked, setPicked] = useState<{ path: string; group: string | null } | null>(null);
  const expanded = picked?.path === pathname ? picked.group : currentGroup;
  const asideRef = useRef<HTMLElement>(null);

  // Scroll only the sidebar, never the window, so anchors like #faq still land.
  useEffect(() => {
    const aside = asideRef.current;
    const link = aside?.querySelector('nav [aria-current="page"]');
    if (!aside || !link) return;
    const box = aside.getBoundingClientRect();
    const item = link.getBoundingClientRect();
    if (item.top < box.top || item.bottom > box.bottom) aside.scrollTop += item.top - box.top - box.height / 3;
  }, [pathname]);

  return (
    <aside ref={asideRef} className="section-sidebar">
      <button
        type="button"
        className="section-sidebar-toggle"
        aria-expanded={open}
        aria-controls="section-sidebar-nav"
        onClick={() => setOpenOn(open ? null : pathname)}
      >
        {menu.title} <span className="text-ink-3">· {open ? toggleLabels.close : toggleLabels.open}</span>
      </button>
      <nav id="section-sidebar-nav" aria-label={menu.title} data-open={open}>
        <Link
          className="section-sidebar-title"
          href={localeHref(menu.href, locale)}
          prefetch={false}
          aria-current={current === menu.href ? "page" : undefined}
        >
          {menu.title}
        </Link>
        {menu.groups.map((group, index) => {
          const key = group.title ?? String(index);
          const folded = menu.collapsible && group.title !== undefined && expanded !== group.title;
          return (
            <div key={key} className="section-sidebar-group">
              {menu.collapsible && group.title ? (
                <button
                  type="button"
                  aria-expanded={!folded}
                  aria-controls={`section-group-${index}`}
                  onClick={() => setPicked({ path: pathname, group: folded ? group.title! : null })}
                >
                  <span>{group.title}</span>
                  <span className="section-sidebar-count">{group.links.length}</span>
                </button>
              ) : group.title ? <p>{group.title}</p> : null}
              <div id={`section-group-${index}`} hidden={folded}>
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={localeHref(link.href, locale)}
                    prefetch={false}
                    className={link.mono ? "font-mono" : undefined}
                    aria-current={isCurrent(link.href) ? "page" : undefined}
                  >
                    {link.label}
                    {link.tag ? <span className="docs-menu-tag">{link.tag}</span> : null}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
