"use client";

import { useEffect, useRef } from "react";

/** Calls `tick` every `ms` while the tab is visible, and once more when the tab becomes visible again. */
export function usePolling(tick: () => void | Promise<void>, ms: number) {
  const saved = useRef(tick);
  useEffect(() => {
    saved.current = tick;
  }, [tick]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      stop();
      timer = setInterval(() => void saved.current(), ms);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void saved.current();
        start();
      } else stop();
    };
    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ms]);
}
