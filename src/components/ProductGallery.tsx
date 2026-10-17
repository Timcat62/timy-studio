"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

/** The cover and preview images of a product: swipe on touch screens, arrows and keys everywhere. */
export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    const next = (i + images.length) % images.length;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  };

  if (images.length === 0) return null;
  const many = images.length > 1;

  return (
    <div
      className="gallery"
      role="region"
      aria-roledescription="carousel"
      aria-label={`Images of ${title}`}
      tabIndex={many ? 0 : undefined}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div className="gallery__track" ref={track}>
        {images.map((src, i) => (
          <div className="gallery__slide" key={src} aria-label={`${i + 1} of ${images.length}`} role="group">
            <img src={src} alt={i === 0 ? title : ""} loading={i === 0 ? "eager" : "lazy"} decoding="async" draggable={false} />
          </div>
        ))}
      </div>
      {many ? (
        <>
          <button type="button" className="social gallery__arrow gallery__arrow--prev" aria-label="Previous image" onClick={() => go(index - 1)}>
            <Icon name="chevron" />
          </button>
          <button type="button" className="social gallery__arrow gallery__arrow--next" aria-label="Next image" onClick={() => go(index + 1)}>
            <Icon name="chevron" />
          </button>
          <div className="gallery__dots" aria-hidden="true">
            {images.map((src, i) => (
              <span key={src} data-on={i === index} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
