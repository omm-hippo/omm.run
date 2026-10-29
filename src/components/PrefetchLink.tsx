"use client";

import Link, { useLinkStatus } from "next/link";
import { useEffect, useState, type ComponentProps } from "react";

/**
 * `next/link` that prefetches on intent instead of on sight.
 *
 * Viewport prefetch fired an RSC request for every visible link — nav, footer,
 * link lists — and multiplied Worker requests ~5-6x per visit, so every link
 * used to set `prefetch={false}`. That made each click wait out a full round
 * trip (Korean traffic is served from SJC, ~160ms RTT) with no feedback.
 *
 * Here the link starts with prefetch off and switches to the default once the
 * pointer enters it, a finger touches it or it takes keyboard focus — the
 * hover-to-click gap hides most of the round trip, and only links someone
 * reached for cost a request. See node_modules/next/dist/docs/01-app/02-guides/
 * prefetching.md, "Hover-triggered prefetch".
 *
 * While a click is still waiting on the server, `NavPending` marks `<html>` so
 * globals.css can draw the top progress bar.
 */

type Props = Omit<ComponentProps<typeof Link>, "prefetch">;

export default function PrefetchLink({
  children,
  onMouseEnter,
  onTouchStart,
  onFocus,
  ...props
}: Props) {
  const [intent, setIntent] = useState(false);

  return (
    <Link
      {...props}
      prefetch={intent ? null : false}
      onMouseEnter={(event) => {
        setIntent(true);
        onMouseEnter?.(event);
      }}
      onTouchStart={(event) => {
        setIntent(true);
        onTouchStart?.(event);
      }}
      onFocus={(event) => {
        setIntent(true);
        onFocus?.(event);
      }}
    >
      {children}
      <NavPending />
    </Link>
  );
}

const PENDING_ATTR = "data-nav-pending";

function NavPending() {
  const { pending } = useLinkStatus();

  useEffect(() => {
    if (!pending) return;
    const root = document.documentElement;
    root.setAttribute(PENDING_ATTR, "");
    return () => root.removeAttribute(PENDING_ATTR);
  }, [pending]);

  return null;
}
