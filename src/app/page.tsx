import Link from "next/link";
import { Icon } from "@/components/Icon";
import { heroReel, links, services, site } from "@/lib/config";
import { getWorks } from "@/lib/tiktok";

const tiktok = links.find((l) => l.label === "TikTok")?.href ?? `https://www.tiktok.com/@${site.handle}`;

const steps = [
  { title: "Send a brief", text: "Describe the project, your budget and any files or references. It takes about five minutes." },
  { title: "Talk it through", text: "We chat on a private page made for your project. I ask questions, you adjust the idea." },
  {
    title: "Agree a price, then pay",
    text: "I propose a final price. You only pay once you accept it, securely through Stripe.",
  },
  { title: "Receive your files", text: "I produce the work and send the final files through your project page." },
];

export default async function Home() {
  const works = await getWorks();

  return (
    <>
      <section className="hero">
        {heroReel ? <video className="hero__reel" src={heroReel} autoPlay muted loop playsInline aria-hidden="true" /> : null}
        <div className="hero__light" aria-hidden="true" />
        <div className="wrap">
          <h1 className="display">Cars in places they've never been.</h1>
          <p className="hero__sub">
            Automotive CGI and 3D animation, built in Blender. Photoreal car films, social cuts and stills for brands,
            creators and artists.
          </p>
          <div className="hero__actions">
            <Link href="/start" className="btn btn--primary">
              Start a project
            </Link>
            <Link href="#work" className="btn btn--ghost">
              See the work
            </Link>
          </div>
        </div>
      </section>

      <section id="work" className="section">
        <div className="wrap">
          <h2 className="h2">Recent work</h2>
          <p className="lede">Each piece opens the original video on TikTok.</p>

          {works.length > 0 ? (
            <>
              <div className="work-grid">
                {works.map((w) => (
                  <a key={w.url} className="work-card" href={w.url} target="_blank" rel="noopener noreferrer">
                    <div className="work-card__media">
                      {w.thumb ? <img src={w.thumb} alt="" loading="lazy" referrerPolicy="no-referrer" /> : null}
                      <span className="work-card__play">
                        <Icon name="play" />
                      </span>
                    </div>
                    <p className="work-card__title">{w.title}</p>
                  </a>
                ))}
              </div>
              <p className="work-more">
                <a className="btn btn--ghost" href={tiktok} target="_blank" rel="noopener noreferrer">
                  More on TikTok <Icon name="external" />
                </a>
              </p>
            </>
          ) : (
            <div className="work-empty">
              <p style={{ maxWidth: "42ch" }}>New renders land on TikTok first. Follow @{site.handle} to see the latest.</p>
              <a className="btn btn--primary" href={tiktok} target="_blank" rel="noopener noreferrer">
                Watch on TikTok <Icon name="external" />
              </a>
            </div>
          )}
        </div>
      </section>

      <section id="services" className="section">
        <div className="wrap">
          <h2 className="h2">What I make</h2>
          <ul className="services">
            {services.map((s) => (
              <li key={s.name} className="service">
                <h3>{s.name}</h3>
                <p>{s.text}</p>
                <p className="service__delivery">{s.delivery}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="h2">How a project works</h2>
          <p className="lede">You are never asked to pay before we have agreed on a price together.</p>
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

      <section className="section section--tight">
        <div className="wrap split">
          <div>
            <h2 className="h2">I make music too.</h2>
            <p className="lede">
              Atmospheric, cinematic electronic and Brazilian funk, released as timy. The same visual world feeds both.
            </p>
          </div>
          <div className="split__actions">
            <Link href="/about" className="btn btn--ghost">
              About and music
            </Link>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <h2 className="display">Got a car and an idea?</h2>
          <p>Send a brief. There's nothing to pay now: we talk first and agree on a price together.</p>
          <Link href="/start" className="btn btn--light">
            Start a project
          </Link>
        </div>
      </section>
    </>
  );
}
