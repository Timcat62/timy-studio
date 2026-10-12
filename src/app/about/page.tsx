import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { linktreeUrl, links } from "@/lib/config";
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
      <div className="wrap page-head">
        <h1 className="display">The music and the pictures, from one desk.</h1>
      </div>

      <section className="section section--tight" style={{ borderTop: 0 }}>
        <div className="wrap prose">
          <p>
            I'm timy., an independent producer and 3D artist from France. I write atmospheric, cinematic electronic
            music and Brazilian funk, and I release it myself.
          </p>
          <p>
            Every release gets its own visuals, built in Blender: photoreal cars in places they were never meant to be.
            That is the look people know from my TikTok, and it is the same craft I now put into client projects.
          </p>
          <p>
            <Link href="/start" className="link-inline">
              Start a project
            </Link>{" "}
            if you want that world for your own car, brand or release.
          </p>
        </div>
      </section>

      <section className="section" id="releases">
        <div className="wrap">
          <h2 className="h2">Releases</h2>
          {releases.length > 0 ? (
            <ul className="releases">
              {releases.map((r) => {
                const inner = (
                  <>
                    {r.art ? (
                      <img className="release__art" src={r.art} alt="" loading="lazy" width={600} height={600} />
                    ) : (
                      <div className="release__art" />
                    )}
                    <p className="release__title">{r.title}</p>
                    {r.year ? <p className="release__year">{r.year}</p> : null}
                  </>
                );
                return (
                  <li key={r.title}>
                    {r.href ? (
                      <a className="release" href={r.href} target="_blank" rel="noopener noreferrer">
                        {inner}
                      </a>
                    ) : (
                      <div className="release">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="lede">Releases will show up here. In the meantime, you can find everything on the platforms below.</p>
          )}
        </div>
      </section>

      <section className="section" id="links">
        <div className="wrap">
          <h2 className="h2">Everywhere else</h2>
          <div className="link-groups">
            {groups.map((g) => {
              const items = links.filter((l) => l.group === g.key && l.href);
              if (!items.length) return null;
              return (
                <div key={g.key}>
                  <h3>{g.title}</h3>
                  <ul className="link-list">
                    {items.map((l) => (
                      <li key={l.label}>
                        <a href={l.href} target="_blank" rel="noopener noreferrer">
                          {l.label}
                          <Icon name="external" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <p className="muted" style={{ marginTop: "2rem" }}>
            Prefer one page?{" "}
            <a className="link-inline" href={linktreeUrl} target="_blank" rel="noopener noreferrer">
              Open my Linktree
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
