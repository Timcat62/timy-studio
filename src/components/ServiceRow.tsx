"use client";

import Link from "next/link";
import { useRef } from "react";
import { Icon } from "./Icon";

interface Props {
  index: number;
  name: string;
  text: string;
  delivery: string;
  type: string;
  media?: string;
}

const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src);

/** One numbered service. If it has a video, it plays while the row is hovered or focused. */
export function ServiceRow({ index, name, text, delivery, type, media }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const play = () => void video.current?.play().catch(() => undefined);
  const stop = () => video.current?.pause();

  return (
    <li>
      <Link
        className="service"
        href={`/start?type=${encodeURIComponent(type)}`}
        onMouseEnter={play}
        onMouseLeave={stop}
        onFocus={play}
        onBlur={stop}
      >
        <span className="service__num">{String(index + 1).padStart(2, "0")}</span>
        <span className="service__title">{name}</span>
        <span className="service__text">
          {text}
          <small>{delivery}</small>
        </span>
        <span className="service__aside">
          {media ? (
            <span className="service__media" aria-hidden="true">
              {isVideo(media) ? (
                <video ref={video} src={media} muted loop playsInline preload="none" />
              ) : (
                <img src={media} alt="" loading="lazy" />
              )}
            </span>
          ) : null}
          <span className="service__arrow">
            <Icon name="arrow-up-right" />
          </span>
        </span>
      </Link>
    </li>
  );
}
