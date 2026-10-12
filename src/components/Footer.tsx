import Link from "next/link";
import { linktreeUrl, links, site } from "@/lib/config";

export function Footer() {
  const social = links.filter((l) => l.group === "social" && l.href);
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="site-footer__grid">
          <div>
            <p className="wordmark" style={{ color: "var(--text)" }}>
              {site.name}
            </p>
            <p style={{ marginTop: "0.75rem", maxWidth: "36ch" }}>
              Automotive CGI and 3D animation, plus the music that goes with it.
            </p>
          </div>
          <ul className="site-footer__links">
            {social.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a href={linktreeUrl} target="_blank" rel="noopener noreferrer">
                All links
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`}>Email</a>
            </li>
          </ul>
        </div>
        <div className="site-footer__small">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <Link href="/legal">Legal and terms</Link>
        </div>
      </div>
    </footer>
  );
}
