import Link from "next/link";
import { site } from "@/lib/config";

export function Header() {
  return (
    <header className="site-header">
      <div className="wrap site-header__row">
        <Link href="/" className="wordmark" aria-label={`${site.name} home`}>
          {site.name}
        </Link>
        <nav className="nav" aria-label="Main">
          <Link href="/#work" className="nav__optional">
            Work
          </Link>
          <Link href="/#services" className="nav__optional">
            Services
          </Link>
          <Link href="/about">About and music</Link>
          <Link href="/start" className="btn btn--primary btn--small">
            Start a project
          </Link>
        </nav>
      </div>
    </header>
  );
}
