"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { browserAuth } from "@/lib/supabase-browser";

type Mode = "signin" | "signup" | "forgot";

const titles: Record<Mode, string> = {
  signin: "Sign in",
  signup: "Create an account",
  forgot: "Reset your password",
};

/** Supabase answers in English already, but a few common ones read better rephrased. */
function explain(message: string) {
  if (/invalid login credentials/i.test(message)) return "Wrong email or password.";
  if (/email not confirmed/i.test(message)) return "Confirm your email first: open the link we sent you.";
  if (/already registered/i.test(message)) return "There's already an account with this email. Sign in instead.";
  if (/rate limit/i.test(message)) return "Too many attempts. Wait a few minutes and try again.";
  return message;
}

export function AuthForm({ next, initialError }: { next: string; initialError?: string }) {
  const router = useRouter();
  const supabase = useMemo(() => browserAuth(), []);
  const [mode, setMode] = useState<Mode>("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError ?? "");
  const [info, setInfo] = useState("");

  const callback = (path: string) =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(path)}`;

  function switchTo(m: Mode) {
    setMode(m);
    setError("");
    setInfo("");
  }

  async function google() {
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback(next) },
    });
    if (err) {
      setError(explain(err.message));
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase || busy) return;
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    setBusy(true);
    setError("");
    setInfo("");

    if (mode === "signin") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) {
        setError(explain(err.message));
        setBusy(false);
        return;
      }
      router.push(next);
      router.refresh();
      return;
    }

    if (mode === "signup") {
      const name = String(form.get("name") ?? "").trim();
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name }, emailRedirectTo: callback(next) },
      });
      setBusy(false);
      if (err) {
        setError(explain(err.message));
        return;
      }
      if (data.session) {
        router.push(next);
        router.refresh();
        return;
      }
      setInfo(`Almost there: we sent a link to ${email}. Open it to confirm your address, then you're in.`);
      return;
    }

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callback("/account/password"),
    });
    setBusy(false);
    if (err) setError(explain(err.message));
    else setInfo(`If an account exists for ${email}, a link to choose a new password is on its way.`);
  }

  if (!supabase) {
    return <p className="notice">Accounts aren't available right now. Please try again later.</p>;
  }

  return (
    <div className="auth stack">
      <h1 className="display auth__title">{titles[mode]}</h1>

      {mode !== "forgot" ? (
        <>
          <button type="button" className="btn btn--ghost auth__google" onClick={google} disabled={busy}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
              <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
              <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z" />
              <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
            </svg>
            Continue with Google
          </button>
          <p className="auth__or">
            <span>or with your email</span>
          </p>
        </>
      ) : (
        <p className="muted">Enter the email of your account and we'll send you a link to choose a new password.</p>
      )}

      <form className="form" onSubmit={submit}>
        {mode === "signup" ? (
          <div className="field">
            <label className="label" htmlFor="auth-name">
              Your name
            </label>
            <input className="input" id="auth-name" name="name" type="text" autoComplete="name" required maxLength={100} />
          </div>
        ) : null}
        <div className="field">
          <label className="label" htmlFor="auth-email">
            Email
          </label>
          <input className="input" id="auth-email" name="email" type="email" autoComplete="email" required maxLength={200} />
        </div>
        {mode !== "forgot" ? (
          <div className="field">
            <label className="label" htmlFor="auth-password">
              Password
            </label>
            <input
              className="input"
              id="auth-password"
              name="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              minLength={mode === "signup" ? 10 : 1}
              maxLength={72}
            />
            {mode === "signup" ? <p className="hint">At least 10 characters.</p> : null}
          </div>
        ) : null}

        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
        {info ? (
          <p className="notice" role="status">
            {info}
          </p>
        ) : null}

        <div>
          <button className="btn btn--primary" type="submit" disabled={busy}>
            {busy ? "One moment…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create my account" : "Send the link"}
          </button>
        </div>
      </form>

      <p className="auth__switch muted">
        {mode === "signin" ? (
          <>
            No account yet?{" "}
            <button type="button" className="link-inline" onClick={() => switchTo("signup")}>
              Create one
            </button>
            {" · "}
            <button type="button" className="link-inline" onClick={() => switchTo("forgot")}>
              Forgot your password?
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button type="button" className="link-inline" onClick={() => switchTo("signin")}>
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}
