import Link from "next/link";
import { ChapterBackdrop, type BackdropItem } from "@/components/ChapterBackdrop";
import { Faq } from "@/components/Faq";
import { Icon } from "@/components/Icon";
import { LazyVideo } from "@/components/LazyVideo";
import { LiteYouTube } from "@/components/LiteYouTube";
import { ScrollEffects } from "@/components/ScrollEffects";
import { Strip } from "@/components/Strip";
import { faq, links, services, site, steps } from "@/lib/config";
import { getWorks } from "@/lib/works";

const youtube = links.find((l) => l.label === "YouTube")?.href ?? "";
const tiktok = links.find((l) => l.label === "TikTok")?.href ?? `https://www.tiktok.com/@${site.handle}`;

const srcSet = (name: string, widths: number[]) => widths.map((w) => `/images/${name}-${w}.jpg ${w}w`).join(", ");

/** One background per service, in the same order as `services` in config. */
const backdrops: BackdropItem[] = [
  { kind: "video", name: "r35" }, // Car films
  {
    kind: "image",
    name: "space",
    widths: [1280, 1920, 2560],
    position: "30% 50%",
    alt: "A black sports car drifting in orbit above the Earth, among asteroids",
  }, // Stills
  { kind: "video", name: "nurburgring", position: "50% 60%" }, // Ads
  {
    kind: "image",
    name: "banner",
    widths: [1280, 1920],
    alt: "A grainy black and white head-on view of a car at night",
  }, // Spotify Canvas
  {
    kind: "image",
    name: "audi",
    widths: [1280, 1920, 2560],
    alt: "A silver estate car seen head-on at night, headlights lit",
  }, // And more
];

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

export default async function Home() {
  const works = await getWorks();

  return (
    <div className="story">
      <ScrollEffects />

      {/* 1. First screen: a video, the title, and what the studio makes */}
      <section className="pin pin--intro" data-scroll="pin">
        <div className="pin__stage intro__stage">
          <LazyVideo name="palegarden" className="intro__video" />
          <div className="intro__shade" aria-hidden="true" />
          <div className="intro__dim" aria-hidden="true" />
          <div className="intro__inner">
            <h1 className="display">Automotive CGI studio.</h1>
            <p>Photoreal car films, stills and ads, built in Blender.</p>
            <div className="intro__buttons">
              <Link href="/start" className="btn btn--primary">
                Start a project <Icon name="arrow" />
              </Link>
              <Link href="#work" className="btn btn--ghost">
                See the work
              </Link>
            </div>
          </div>
          <div className="intro__strip">
            <Strip items={services.map((s) => s.name)} />
          </div>
        </div>
      </section>

      {/* 2. A video that grows to fill the screen */}
      <section className="pin pin--expand" data-scroll="pin">
        <div className="pin__stage expand__stage">
          <p className="expand__lead">Rendered, not photographed.</p>
          <div className="expand__frame">
            <LazyVideo name="nurburgring" />
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
      <section id="services" className="pin pin--chapters" data-scroll="pin" data-steps={services.length}>
        <div className="pin__stage">
          <ChapterBackdrop items={backdrops} />
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

      {/* 5. Work */}
      <section id="work" className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="section-head__main">
              <h2 className="h2">Recent work</h2>
            </div>
            <p className="caps section-head__meta">Work</p>
          </div>

          {works.length > 0 ? (
            <>
              <div className="work-grid">
                {works.map((w, i) =>
                  w.kind === "youtube" ? (
                    <LiteYouTube key={w.id} id={w.id} title={w.title} url={w.url} index={i} />
                  ) : (
                    <a key={w.url} className="work-card" href={w.url} target="_blank" rel="noopener noreferrer">
                      <div className="work-card__media">
                        {w.thumb ? <img src={w.thumb} alt="" loading="lazy" referrerPolicy="no-referrer" /> : null}
                        <span className="work-card__play">
                          <Icon name="play" />
                        </span>
                      </div>
                      <div className="work-card__cap">
                        <p className="work-card__title">{w.title}</p>
                      </div>
                    </a>
                  ),
                )}
              </div>
              <p className="work-more">
                {youtube ? (
                  <a className="link-arrow" href={youtube} target="_blank" rel="noopener noreferrer">
                    More on YouTube <Icon name="arrow-up-right" />
                  </a>
                ) : null}
                <a className="link-arrow" href={tiktok} target="_blank" rel="noopener noreferrer" style={{ marginLeft: "1.5rem" }}>
                  and TikTok <Icon name="arrow-up-right" />
                </a>
              </p>
            </>
          ) : (
            <div className="work-empty">
              <p>New renders land on TikTok first. Follow @{site.handle} to see the latest.</p>
              <a className="btn btn--primary" href={tiktok} target="_blank" rel="noopener noreferrer">
                Watch on TikTok <Icon name="arrow-up-right" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* 6. How a project works */}
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

      {/* 7. Questions */}
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="section-head__main">
              <h2 className="h2">Questions</h2>
            </div>
            <p className="caps section-head__meta">Inquiries</p>
          </div>
          <Faq items={faq} />
        </div>
      </section>

      <section className="section section--tight">
        <div className="wrap split">
          <div>
            <h2 className="h2">I make music too.</h2>
            <p className="lede">
              Atmospheric, cinematic electronic and Brazilian funk, released as timy. The same visual world feeds both.
            </p>
          </div>
          <div className="split__actions">
            <Link href="/about" className="link-arrow">
              About and music <Icon name="arrow-up-right" />
            </Link>
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
            <h2 className="display">Got an idea?</h2>
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
