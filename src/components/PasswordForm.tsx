"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserAuth } from "@/lib/supabase-browser";

export function PasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = browserAuth();
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="field">
        <label className="label" htmlFor="new-pw">
          New password
        </label>
        <input
          id="new-pw"
          className="input"
          type="password"
          autoComplete="new-password"
          minLength={10}
          maxLength={72}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <p className="hint">At least 10 characters.</p>
      </div>
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
      <div>
        <button className="btn btn--primary" type="submit" disabled={busy || password.length < 10}>
          {busy ? "Saving…" : "Save password"}
        </button>
      </div>
    </form>
  );
}
