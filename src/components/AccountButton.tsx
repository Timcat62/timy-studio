"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";

/** A round glass button in the corner of every page that leads to the client's account. */
export function AccountButton() {
  const pathname = usePathname() ?? "";
  // on the homepage's first screen the main buttons are already there, and the button would cover the services line
  const [atTop, setAtTop] = useState(pathname === "/");
  useEffect(() => {
    if (pathname !== "/") {
      setAtTop(false);
      return;
    }
    const onScroll = () => setAtTop(window.scrollY < window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (pathname.startsWith("/account") || pathname === "/login" || pathname.startsWith("/admin")) return null;
  return (
    <Link
      href="/account"
      className="social account-fab"
      data-hidden={atTop}
      aria-label="Your account"
      title="Your account"
      tabIndex={atTop ? -1 : undefined}
    >
      <Icon name="user" />
    </Link>
  );
}
