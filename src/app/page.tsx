import Link from "next/link";
import { Faq } from "@/components/Faq";
import { Icon } from "@/components/Icon";
import { LiteYouTube } from "@/components/LiteYouTube";
import { ServiceRow } from "@/components/ServiceRow";
import { Ticker } from "@/components/Ticker";
import { faq, heroReel, links, services, site } from "@/lib/config";
import { getWorks } from "@/lib/works";

const tiktok = links.find((l) => l.label === "TikTok")?.href ?? `https://www.tiktok.com/@${site.handle}`;
const youtube = links.find((l) => l.label === "YouTube")?.href ?? "";

const srcSet = (name: string, widths: number[]) => widths.map((w) => `/images/${name}-${w}.jpg ${w}w`).join(", ");

const steps = [
  { title: "Send a brief", text: "Describe the project, your budget and any files or references. It takes about five minutes." },
  { title: "Talk it through", text: "We chat on a private page made for your project. I ask questions, you adjust the idea." },
  { title: "Agree a price, then pay", text: "I propose a final price. You only pay once you accept it, securely through Stripe." },
  { title: "Receive your files", text: "I produce the work and send the final files through your project page." },
];

export default async function Home() {
  const works = await getWorks();

  return (
    <>
      <section className="hero">
        <div className="hero__stage" aria-hidden="true" />
        <img
          className="hero__img"
          src="/images/audi-1920.jpg"
          srcSet={srcSet("audi", [1280, 1920, 2560])}
          sizes="100vw"
          alt=""
          fetchPriority="high"
          decoding="async"
        />
        {heroReel ? (
          <video className="hero__reel" src={heroReel} autoPlay muted loop playsInline aria-hidden="true" />
        ) : null}
        <div className="hero__shade" aria-hidden="true" />
        <div className="hero__light" aria-hidden="true" />
        <div className="wrap">
          <div className="hero__body">
            <h1 className="display">Cars in places they've never been.</h1>
            <div className="hero__side">
              <p className="hero__sub">
                Automotive CGI and 3D animation, built in Blender. Photoreal car films, social cuts and stills for brands,
                creators and artists.
              </p>
              <Link href="/start" className="btn btn--primary">
                Start a project <Icon name="arrow" />
              </Link>
            </div>
          </div>
          <div className="hero__meta">
            <span className="caps">Automotive CGI / 3D animation</span>
            <span className="caps">@{site.handle}</span>
          </div>
        </div>
      </section>

      <Ticker items={[...services.map((s) => s.name), "Built in Blender"]} />

      <section id="work" className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="section-head__main">
              <h2 className="h2">Recent work</h2>
              <p className="lede">Press play to watch here. Nothing loads from YouTube until you do.</p>
            </div>
            <p className="caps section-head__meta">01 / Work</p>
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
                ) : null}{" "}
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

      <section id="services" className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="section-head__main">
              <h2 className="h2">What I make</h2>
              <p className="lede">Pick the closest one and the brief form opens with it already selected.</p>
            </div>
            <p className="caps section-head__meta">02 / Services</p>
          </div>
          <ul className="services">
            {services.map((s, i) => (
              <ServiceRow key={s.name} index={i} {...s} />
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="section-head__main">
              <h2 className="h2">How a project works</h2>
              <p className="lede">You are never asked to pay before we have agreed on a price together.</p>
            </div>
            <p className="caps section-head__meta">03 / Process</p>
          </div>
          <ol className="steps">
            {steps.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div className="section-head__main">
              <h2 className="h2">Questions</h2>
            </div>
            <p className="caps section-head__meta">04 / Inquiries</p>
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
            <h2 className="display">Got a car and an idea?</h2>
            <p>Send a brief. There's nothing to pay now: we talk first and agree on a price together.</p>
            <Link href="/start" className="btn btn--primary">
              Start a project <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
