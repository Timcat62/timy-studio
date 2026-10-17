"use client";

import { useState } from "react";
import { Icon } from "./Icon";

interface Props {
  id: string;
  title: string;
  url: string;
  index: number;
  /** A cover saved on this site; without it, YouTube's own thumbnail is used. */
  poster?: string;
}

/**
 * Click-to-play YouTube embed. Until a visitor presses play, only a thumbnail is loaded: no YouTube script,
 * no cookies. The player uses the privacy-enhanced domain (youtube-nocookie.com).
 */
export function LiteYouTube({ id, title, url, index, poster }: Props) {
  const [playing, setPlaying] = useState(false);
  const [thumb, setThumb] = useState(poster ?? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`);
  const fallback = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

  return (
    <div className="yt">
      <div className="yt__media">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button type="button" className="yt__play" onClick={() => setPlaying(true)} aria-label={`Play: ${title}`}>
            <img
              src={thumb}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => thumb !== fallback && setThumb(fallback)}
              onLoad={(e) => {
                // YouTube answers a missing max-resolution thumbnail with a tiny placeholder
                if (e.currentTarget.naturalWidth <= 120 && thumb !== fallback) setThumb(fallback);
              }}
            />
            <span className="yt__icon">
              <Icon name="play" />
            </span>
          </button>
        )}
      </div>
      <div className="yt__cap">
        <span className="yt__num">{String(index + 1).padStart(2, "0")}</span>
        <a className="yt__title" href={url} target="_blank" rel="noopener noreferrer" title="Open on YouTube">
          {title}
        </a>
      </div>
    </div>
  );
}
