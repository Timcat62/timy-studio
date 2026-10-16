"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type PageVisit = {
  path: string;
  startedAt: number;
  sent: boolean;
};

function getDevice(): string {
  const ua = navigator.userAgent;

  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) {
    return "Tablet";
  }

  if (/Android/i.test(ua) && !/Mobile/i.test(ua)) {
    return "Tablet";
  }

  if (/Mobi|iPhone|Android/i.test(ua)) {
    return "Mobile";
  }

  return "Desktop";
}

function sendVisit(visit: PageVisit) {
  if (visit.sent) return;
  visit.sent = true;

  const duration = Math.max(
    0,
    Math.round((Date.now() - visit.startedAt) / 1000)
  );

  const payload = JSON.stringify({
    path: visit.path,
    duration,
    device: getDevice(),
  });

  navigator.sendBeacon(
    "/api/page-view",
    new Blob([payload], { type: "application/json" })
  );
}

export function PageViewTracker() {
  const pathname = usePathname();
  const visitRef = useRef<PageVisit | null>(null);

  useEffect(() => {
    if (!pathname) return;

    if (visitRef.current?.path !== pathname) {
      if (visitRef.current) {
        sendVisit(visitRef.current);
      }

      visitRef.current = {
        path: pathname,
        startedAt: Date.now(),
        sent: false,
      };
    }

    const handlePageHide = () => {
      if (visitRef.current) {
        sendVisit(visitRef.current);
      }
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [pathname]);

  return null;
}
