import Link from "next/link";
import { linktreeUrl, links, site } from "@/lib/config";

export function Footer() {
  const social = links.filter((l) => l.group === "social" && l.href);
  const listen = links.filter((l) => l.group === "listen" && l.href);

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="site-footer__grid">
          <p className="site-footer__tag">Cars in places they've never been.</p>
          <div>
            <h3>Studio</h3>
            <ul>
              <li>
                <Link href="/#work">Work</Link>
              </li>
              <li>
                <Link href="/#services">Services</Link>
              </li>
              <li>
                <Link href="/about">About and music</Link>
              </li>
              <li>
                <Link href="/start">Start a project</Link>
              </li>
              <li>
                <a href={`mailto:${site.email}`}>Email</a>
              </li>
            </ul>
          </div>
          <div>
            <h3>Elsewhere</h3>
            <ul>
              {[...social, ...listen].map((l) => (
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
            </ul>
          </div>
        </div>
        <div className="site-footer__small">
          <span>© {new Date().getFullYear()} {site.name}</span>
          <Link href="/legal">Legal and terms</Link>
        </div>
      </div>
      <span className="site-footer__mark" aria-hidden="true">
        timy.
      </span>
    </footer>
  );
}
