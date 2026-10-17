import type { Metadata } from "next";
import { updates } from "@/lib/updates";

export const metadata: Metadata = {
  title: "Updates",
  description: "What changed on timy.studio, and when.",
};

const formatDay = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

export default function Updates() {
  return (
    <>
      <div className="wrap page-head">
        <h1 className="display">Updates</h1>
        <p className="lede">What changed on the site, newest first.</p>
      </div>
      <section className="section section--tight" style={{ borderTop: 0, paddingTop: 0 }}>
        <div className="wrap">
          <ol className="releases-log">
            {updates.map((u) => (
              <li key={u.version} className="releases-log__item">
                <div className="releases-log__meta">
                  <span className="releases-log__version">v{u.version}</span>
                  <time dateTime={u.date}>{formatDay(u.date)}</time>
                </div>
                <div>
                  <h2>{u.title}</h2>
                  <ul>
                    {u.changes.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
