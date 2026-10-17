"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/config";
import { Icon } from "./Icon";

const links = [
  { href: "/#services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname() ?? "";
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the phone menu when a link is followed
  useEffect(() => setMenu(false), [pathname]);

  const current = (href: string) => (href !== "/#services" && pathname.startsWith(href) ? "page" : undefined);
  const onAccount = pathname.startsWith("/account") || pathname === "/login";

  return (
    <header className="site-header" data-scrolled={scrolled}>
      <div className="site-header__bar">
        <div className="site-header__row">
          <Link href="/" className="wordmark" aria-label={`${site.name} home`}>
            {site.name}
          </Link>
          <nav className="nav" aria-label="Main">
            <div className="nav__links">
              {links.map((l) => (
                <Link key={l.href} href={l.href} aria-current={current(l.href)}>
                  {l.label}
                </Link>
              ))}
            </div>
            <button
              type="button"
              className="nav__menu-btn"
              aria-expanded={menu}
              aria-controls="phone-menu"
              aria-label={menu ? "Close the menu" : "Open the menu"}
              onClick={() => setMenu((m) => !m)}
            >
              <span aria-hidden="true" data-open={menu} />
            </button>
            <Link href="/start" className="btn btn--primary btn--small">
              Start a project
            </Link>
          </nav>
        </div>

        {/* the account sits in its own bubble, right next to the bar */}
        <div className="account-bubble">
          <Link
            href="/account"
            className="social account-bubble__btn"
            aria-label="Your account"
            aria-current={onAccount ? "page" : undefined}
          >
            <Icon name="user" />
          </Link>
          <span className="account-bubble__tip" aria-hidden="true">
            Your account
          </span>
        </div>
      </div>

      <div id="phone-menu" className="phone-menu" data-open={menu} aria-hidden={!menu}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} aria-current={current(l.href)} onClick={() => setMenu(false)}>
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
