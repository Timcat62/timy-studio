"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Screenshots of the project page next to "How working with me works". The one shown follows the step
 * being read: it reads the --p progress that ScrollEffects writes on the .process list next to it.
 */
export function ProcessShots({ shots }: { shots: { src: string; alt: string }[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const list = root.current?.parentElement?.querySelector<HTMLElement>(".process");
    if (!list) return;
    const read = () => {
      const p = parseFloat(list.style.getPropertyValue("--p") || "0");
      // same pace as the steps' fade-in in CSS: step i is fully lit once p * 4.6 passes i + 0.78
      setActive(Math.max(0, Math.min(shots.length - 1, Math.floor(p * 4.6 - 0.78))));
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(list, { attributes: true, attributeFilter: ["style"] });
    return () => mo.disconnect();
  }, [shots.length]);

  return (
    <div className="process-shots" ref={root}>
      <div className="process-shots__screen">
        {shots.map((s, i) => (
          <img key={s.src} src={s.src} alt={s.alt} data-on={i === active} loading="lazy" decoding="async" width={600} height={1140} />
        ))}
      </div>
      <div className="process-shots__dots" aria-hidden="true">
        {shots.map((s, i) => (
          <span key={s.src} data-on={i === active} />
        ))}
      </div>
    </div>
  );
}
