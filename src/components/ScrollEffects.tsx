"use client";

import { useEffect } from "react";

/**
 * Drives the scroll story. For every element with data-scroll it writes a CSS variable --p (0 to 1):
 *  - data-scroll="pin":  progress through a tall wrapper that holds a sticky stage
 *  - data-scroll="view": progress of an element crossing the screen
 * With data-steps="n" it also sets data-step (0 to n-1) so CSS can switch chapters.
 * With reduced motion enabled, everything is set to its finished state and nothing listens to scroll.
 */
export function ScrollEffects() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll]"));
    const clamp = (v: number) => Math.min(1, Math.max(0, v));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.style.setProperty("--p", "1"));
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) continue; // far away: nothing to update
        const p =
          el.dataset.scroll === "pin"
            ? clamp(-r.top / Math.max(1, r.height - vh))
            : clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3));
        el.style.setProperty("--p", p.toFixed(4));
        const n = Number(el.dataset.steps);
        if (n) el.dataset.step = String(Math.min(n - 1, Math.floor(p * n)));
      }
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, []);

  return null;
}
