"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * A thin gold bar at the top of the screen from the click on a link until the next page shows,
 * so a page that takes a moment never looks like a click that didn't work.
 */
export function NavProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
      // same page (an anchor further down, or this very page): nothing to wait for
      if (url.pathname === location.pathname && url.search === location.search) return;
      clearTimeout(timer.current);
      setState("loading");
      // never leave the bar stuck, whatever happens
      timer.current = setTimeout(() => setState("idle"), 15000);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    setState((s) => (s === "loading" ? "done" : s));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 450);
  }, [pathname]);

  return <div className="nav-progress" data-state={state} aria-hidden="true" />;
}
