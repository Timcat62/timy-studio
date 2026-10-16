"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  /** File base name in /public/video, e.g. "nurburgring" (expects -1280.mp4, -1920.mp4 and -poster.jpg). */
  name: string;
  className?: string;
  /** Pause when false, even if on screen. */
  active?: boolean;
  position?: string;
}

/**
 * A muted looping background video that only downloads when it is near the screen, plays only while visible,
 * uses a lighter file on small screens, and stays a still poster for visitors who asked for reduced motion
 * or turned on data saving.
 */
export function LazyVideo({ name, className, active = true, position }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string>();
  const [visible, setVisible] = useState(false);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saver = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (reduce || saver) {
      setStill(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (visible && !src && !still) setSrc(`/video/${name}-${window.innerWidth <= 800 ? 1280 : 1920}.mp4`);
  }, [visible, src, still, name]);

  useEffect(() => {
    const v = ref.current;
    if (!v || !src) return;
    if (visible && active) void v.play().catch(() => undefined);
    else v.pause();
  }, [visible, active, src]);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={`/video/${name}-poster.jpg`}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      style={position ? { objectPosition: position } : undefined}
    />
  );
}
