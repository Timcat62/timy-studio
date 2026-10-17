import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { LiteYouTube } from "@/components/LiteYouTube";
import { links } from "@/lib/config";
import { getPortfolio } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "A selection of my 3D car animations, made in Blender.",
};

const youtube = links.find((l) => l.label === "YouTube")?.href ?? "";

export default function Portfolio() {
  const items = getPortfolio();

  return (
    <>
      <div className="wrap page-head">
        <h1 className="display">Portfolio</h1>
        <p className="lede">A selection of my favourite pieces. Press play to watch them right here.</p>
      </div>
      <section className="section section--tight" style={{ borderTop: 0, paddingTop: 0 }}>
        <div className="wrap">
          <div className="work-grid" style={{ marginTop: 0 }}>
            {items.map((w, i) => (
              <LiteYouTube key={w.id} id={w.id} title={w.title} url={w.url} index={i} poster={w.poster} />
            ))}
          </div>
          <p className="work-more">
            {youtube ? (
              <a className="link-arrow" href={youtube} target="_blank" rel="noopener noreferrer" style={{ marginRight: "1.5rem" }}>
                More on YouTube <Icon name="arrow-up-right" />
              </a>
            ) : null}
            <Link href="/start" className="link-arrow">
              Work with me <Icon name="arrow" />
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
