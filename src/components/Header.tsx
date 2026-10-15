"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/config";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="site-header" data-scrolled={scrolled}>
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
          <Link href="/studio" className="nav__optional" aria-current={pathname === "/studio" ? "page" : undefined}>
            Studio
          </Link>
          <Link href="/about" aria-current={pathname === "/about" ? "page" : undefined}>
            About
          </Link>
          <Link href="/start" className="btn btn--primary btn--small">
            Start a project
          </Link>
        </nav>
      </div>
    </header>
  );
}
