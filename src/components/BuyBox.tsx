"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "./Icon";

/** Buy (or get for free) a shop product. Already bought: a link to the downloads instead. */
export function BuyBox({ slug, free, ownedToken }: { slug: string; free: boolean; ownedToken: string | null }) {
  const [accept, setAccept] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [login, setLogin] = useState("");

  if (ownedToken) {
    return (
      <div className="buy">
        <Link href={`/shop/download/${ownedToken}`} className="btn btn--primary">
          Download your files <Icon name="arrow" />
        </Link>
      </div>
    );
  }

  async function go() {
    setBusy(true);
    setError("");
    setLogin("");
    try {
      const res = await fetch(`/api/shop/${slug}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept }),
      });
      const data = (await res.json()) as { url?: string; error?: string; login?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Something went wrong.");
        if (data.login) setLogin(data.login);
        setBusy(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network problem. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="buy stack">
      {!free ? (
        <label className="check">
          <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
          <span>
            I accept the <Link href="/legal#shop" target="_blank">terms</Link> and want the files right away: I understand
            that I then lose my 14-day right of withdrawal.
          </span>
        </label>
      ) : null}
      {error ? (
        <p className="error" role="alert">
          {error} {login ? <Link href={login} className="link-inline">Sign in</Link> : null}
        </p>
      ) : null}
      <div>
        <button className="btn btn--primary" onClick={go} disabled={busy || (!free && !accept)}>
          {free ? (busy ? "One moment…" : "Get it free") : busy ? "Opening secure checkout…" : (
            <>
              <Icon name="lock" /> Buy now
            </>
          )}
        </button>
      </div>
      <p className="hint">
        {free ? "Free with an account. " : "Secure payment with Stripe. "}The download link is also emailed to you.
      </p>
    </div>
  );
}
