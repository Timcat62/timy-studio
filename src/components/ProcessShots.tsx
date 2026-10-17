"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Screenshots of the project page next to "How working with me works". The phone stays in the middle of the
 * screen, and shows the step being read: the last one whose top has passed the middle of the screen.
 */
export function ProcessShots({ shots }: { shots: { src: string; alt: string }[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const items = Array.from(root.current?.parentElement?.querySelectorAll<HTMLElement>(".process__list > li") ?? []);
    if (!items.length) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      const line = window.innerHeight * 0.55;
      let i = 0;
      items.forEach((el, j) => {
        if (el.getBoundingClientRect().top < line) i = j;
      });
      setActive(Math.min(shots.length - 1, i));
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
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
