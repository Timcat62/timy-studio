"use client";

import { useEffect, useRef, useState } from "react";
import { LazyVideo } from "./LazyVideo";

export type BackdropItem =
  | { kind: "video"; name: string; position?: string }
  | { kind: "image"; name: string; widths: number[]; position?: string; alt: string };

/** Full-bleed backgrounds that cross-fade as the chapter changes (the section's data-step is set by ScrollEffects). */
export function ChapterBackdrop({ items }: { items: BackdropItem[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const section = root.current?.closest<HTMLElement>("[data-scroll]");
    if (!section) return;
    const read = () => setStep(Number(section.dataset.step ?? 0) || 0);
    read();
    const mo = new MutationObserver(read);
    mo.observe(section, { attributes: true, attributeFilter: ["data-step"] });
    return () => mo.disconnect();
  }, []);

  return (
    <div className="chapters__media" ref={root}>
      {items.map((item, i) => (
        <div key={item.name + i} className="backdrop__layer" data-on={i === step}>
          {item.kind === "video" ? (
            <LazyVideo name={item.name} active={i === step} position={item.position} />
          ) : (
            <img
              src={`/images/${item.name}-${item.widths[Math.min(1, item.widths.length - 1)]}.jpg`}
              srcSet={item.widths.map((w) => `/images/${item.name}-${w}.jpg ${w}w`).join(", ")}
              sizes="100vw"
              alt={item.alt}
              loading="lazy"
              decoding="async"
              style={item.position ? { objectPosition: item.position } : undefined}
            />
          )}
        </div>
      ))}
    </div>
  );
}
