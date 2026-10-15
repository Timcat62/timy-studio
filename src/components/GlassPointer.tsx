"use client";

import { useEffect } from "react";

/** Moves the specular highlight of glass buttons and logo buttons toward the pointer. */
export function GlassPointer() {
  useEffect(() => {
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest?.(".btn, .social") as HTMLElement | null;
      if (!target) return;
      const { clientX, clientY } = e;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = target.getBoundingClientRect();
        target.style.setProperty("--mx", `${(((clientX - r.left) / r.width) * 100).toFixed(1)}%`);
        target.style.setProperty("--my", `${(((clientY - r.top) / r.height) * 100).toFixed(1)}%`);
      });
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
    };
  }, []);
  return null;
}
