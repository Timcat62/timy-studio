import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { ScrollEffects } from "@/components/ScrollEffects";
import { services, steps } from "@/lib/config";

export const metadata: Metadata = {
  title: "Studio",
  description: "How timy. studio builds photoreal automotive CGI, told as you scroll.",
};

const srcSet = (name: string, widths: number[]) => widths.map((w) => `/images/${name}-${w}.jpg ${w}w`).join(", ");

const statement = [
  { w: "Photoreal" },
  { w: "cars" },
  { w: "in" },
  { w: "impossible", gold: true },
  { w: "places.", gold: true },
  { w: "Built" },
  { w: "frame" },
  { w: "by" },
  { w: "frame" },
  { w: "in" },
  { w: "Blender," },
  { w: "for" },
  { w: "brands," },
  { w: "creators" },
  { w: "and" },
  { w: "artists." },
];

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

export default function Studio() {
  return (
    <div className="story">
      <ScrollEffects />

      {/* 1. Intro */}
      <section className="pin pin--intro" data-scroll="pin">
        <div className="pin__stage intro__stage">
          <div className="intro__inner">
            <h1 className="display">Automotive CGI.</h1>
            <p>Photoreal cars, built in Blender.</p>
          </div>
          <div className="intro__hint">
            <span className="scroll-hint">
              Scroll <Icon name="arrow-down" />
            </span>
          </div>
        </div>
      </section>

      {/* 2. The image grows to fill the screen */}
      <section className="pin pin--expand" data-scroll="pin">
        <div className="pin__stage expand__stage">
          <p className="expand__lead">Rendered, not photographed.</p>
          <div className="expand__frame">
            <img
              src="/images/audi-1920.jpg"
              srcSet={srcSet("audi", [1280, 1920, 2560])}
              sizes="100vw"
              alt="A silver estate car seen head-on at night, headlights lit, in a blocky stone environment"
              loading="lazy"
              decoding="async"
            />
            <div className="expand__shade" aria-hidden="true" />
          </div>
          <div className="expand__caption">
            <div className="wrap">
              <h2 className="display">Every frame, built from scratch.</h2>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Statement, lit word by word */}
      <section className="pin pin--statement" data-scroll="pin">
        <div className="pin__stage">
          <p className="statement__text display" style={{ "--n": statement.length } as Vars}>
            {statement.map((item, i) => (
              <span key={i} className={item.gold ? "is-gold" : undefined} style={{ "--i": i } as Vars}>
                {item.w}{" "}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* 4. What the studio makes, one chapter at a time */}
      <section className="pin pin--chapters" data-scroll="pin" data-steps={services.length}>
        <div className="pin__stage">
          <img
            className="chapters__img"
            src="/images/space-1920.jpg"
            srcSet={srcSet("space", [1280, 1920, 2560])}
            sizes="100vw"
            alt="A black sports car drifting in orbit above the Earth, among asteroids"
            loading="lazy"
            decoding="async"
          />
          <div className="chapters__shade" aria-hidden="true" />
          <div className="wrap chapters__body">
            <ol className="chapters__list">
              {services.map((s, i) => (
                <li key={s.name} className="chapter" data-i={i}>
                  <span className="chapter__num">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="display">{s.name}</h2>
                  <p>{s.text}</p>
                  <small>{s.delivery}</small>
                  <Link href={`/start?type=${encodeURIComponent(s.type)}`} className="btn btn--ghost">
                    Start with this <Icon name="arrow" />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
          <div className="chapters__dots" aria-hidden="true">
            {services.map((s) => (
              <span key={s.name} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. How a project works */}
      <section className="section">
        <div className="wrap">
          <h2 className="h2">How a project works</h2>
          <p className="lede">You are never asked to pay before we have agreed on a price together.</p>
          <div className="process" data-scroll="view">
            <span className="process__line" aria-hidden="true" />
            <ol className="process__list">
              {steps.map((s, i) => (
                <li key={s.title} style={{ "--i": i } as Vars}>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="cta">
        <img
          className="cta__img"
          src="/images/space-1920.jpg"
          srcSet={srcSet("space", [1280, 1920, 2560])}
          sizes="100vw"
          alt=""
          loading="lazy"
          decoding="async"
        />
        <div className="cta__shade" aria-hidden="true" />
        <div className="wrap cta__body">
          <div className="cta__text">
            <h2 className="display">Got a car and an idea?</h2>
            <p>Send a brief. There's nothing to pay now: we talk first and agree on a price together.</p>
            <Link href="/start" className="btn btn--primary">
              Start a project <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
