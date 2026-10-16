import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { links, site } from "@/lib/config";
import { getPortfolio } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "A selection of my 3D car animations, made in Blender.",
};

const instagram = links.find((l) => l.label === "Instagram")?.href ?? `https://www.instagram.com/${site.handle}`;

export default function Portfolio() {
  const items = getPortfolio();

  return (
    <>
      <div className="wrap page-head">
        <h1 className="display">Portfolio</h1>
        <p className="lede">
          A selection of my favourite pieces. Each one opens on Instagram, where I post new work first.
        </p>
      </div>
      <section className="section section--tight" style={{ borderTop: 0, paddingTop: 0 }}>
        <div className="wrap">
          <div className="work-grid" style={{ marginTop: 0 }}>
            {items.map((w) => (
              <a key={w.url} className="work-card" href={w.url} target="_blank" rel="noopener noreferrer">
                <div className="work-card__media">
                  {/* Instagram covers already carry a play button */}
                  {w.thumb ? (
                    <img src={w.thumb} alt="" loading="lazy" decoding="async" width={360} height={640} />
                  ) : (
                    <span className="work-card__play">
                      <Icon name="play" />
                    </span>
                  )}
                </div>
                <div className="work-card__cap">
                  <p className="work-card__title">{w.title}</p>
                </div>
              </a>
            ))}
          </div>
          <p className="work-more">
            <a className="link-arrow" href={instagram} target="_blank" rel="noopener noreferrer">
              Follow @{site.handle} on Instagram <Icon name="arrow-up-right" />
            </a>
            <Link href="/start" className="link-arrow" style={{ marginLeft: "1.5rem" }}>
              Work with me <Icon name="arrow" />
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
