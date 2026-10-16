import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { SocialLinks } from "@/components/SocialLinks";
import { links } from "@/lib/config";
import { getReleases } from "@/lib/releases";

export const revalidate = 3600; // re-check releases hourly

export const metadata: Metadata = {
  title: "About and music",
  description: "Independent producer and 3D artist. Music releases, links and the story behind the cars.",
};

const groups: { key: string; title: string }[] = [
  { key: "social", title: "Follow" },
  { key: "listen", title: "Listen" },
  { key: "community", title: "Community" },
  { key: "tools", title: "Tools I use" },
];

export default async function About() {
  const releases = await getReleases();

  return (
    <>
      <div className="about-hero">
        <img
          className="about-hero__img"
          src="/images/banner-1920.jpg"
          srcSet="/images/banner-1280.jpg 1280w, /images/banner-1920.jpg 1920w"
          sizes="100vw"
          alt=""
          fetchPriority="high"
          decoding="async"
        />
        <div className="about-hero__shade" aria-hidden="true" />
        <div className="wrap about-hero__body">
          <h1 className="display">About and music</h1>
        </div>
      </div>

      <section className="section section--tight" style={{ borderTop: 0 }}>
        <div className="wrap about-cols">
          <p className="lead">
            I'm timy., an independent producer and 3D artist from France. Music and pictures come from the same desk.
          </p>
          <div className="prose">
            <p>
              I write atmospheric, cinematic electronic music and Brazilian funk, and I release it myself.
            </p>
            <p>
              Every release gets its own visuals, made in Blender: cars in places they were never meant to be.
              That is the look people know from my TikTok and Instagram, and I now make the same kind of videos for clients.
            </p>
            <p>
              <Link href="/start" className="link-arrow" style={{ color: "var(--text)" }}>
                Start a project <Icon name="arrow-up-right" />
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="section section--tight" id="releases">
        <div className="wrap">
          <h2 className="quiet-h">Releases</h2>
          {releases.length > 0 ? (
            <ul className="releases">
              {releases.map((r) => (
                <li key={r.title}>
                  <a className="release" href={r.href} target="_blank" rel="noopener noreferrer" title={`${r.title}: listen on Spotify`}>
                    {r.art ? (
                      <img className="release__art" src={r.art} alt="" loading="lazy" width={300} height={300} />
                    ) : (
                      <div className="release__art" />
                    )}
                    <p className="release__title">{r.title}</p>
                    {r.year ? <p className="release__year">{r.year}</p> : null}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted" style={{ marginTop: "1rem" }}>
              Releases will show up here.
            </p>
          )}
        </div>
      </section>

      <section className="section section--tight" id="links">
        <div className="wrap">
          <h2 className="quiet-h">Elsewhere</h2>
          <div style={{ marginTop: "1.25rem" }}>
            <SocialLinks />
          </div>
          {links.some((l) => l.group === "tools" && l.href) ? (
            <p className="muted" style={{ marginTop: "1.75rem", fontSize: "0.92rem" }}>
              Tools I use:{" "}
              {links
                .filter((l) => l.group === "tools" && l.href)
                .map((l) => (
                  <a key={l.label} className="link-inline" href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label}
                  </a>
                ))}
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}
