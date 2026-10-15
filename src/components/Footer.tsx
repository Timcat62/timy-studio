import Link from "next/link";
import { site } from "@/lib/config";
import { SocialLinks } from "./SocialLinks";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="site-footer__grid">
          <p className="site-footer__tag">Automotive CGI and 3D animation.</p>
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
                <Link href="/studio">Studio</Link>
              </li>
              <li>
                <Link href="/about">About and music</Link>
              </li>
              <li>
                <Link href="/start">Start a project</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3>Elsewhere</h3>
            <SocialLinks />
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
