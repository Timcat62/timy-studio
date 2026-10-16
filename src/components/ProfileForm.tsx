"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Profile } from "@/lib/profile";

export function Avatar({ profile, size = 64 }: { profile: Profile; size?: number }) {
  const initial = (profile.name || profile.email || "?").trim().charAt(0).toUpperCase();
  return profile.avatar ? (
    <img className="avatar" src={profile.avatar} alt="" width={size} height={size} referrerPolicy="no-referrer" />
  ) : (
    <span className="avatar avatar--empty" style={{ width: size, height: size }} aria-hidden="true">
      {initial}
    </span>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const picker = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(profile.name);
  const [busy, setBusy] = useState<"" | "photo" | "name">("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function readError(res: Response, fallback: string) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return data.error ?? fallback;
  }

  async function uploadPhoto(file: File) {
    setBusy("photo");
    setError("");
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/account/avatar", { method: "POST", body });
    if (!res.ok) setError(await readError(res, "Could not upload the photo."));
    setBusy("");
    router.refresh();
  }

  async function removePhoto() {
    setBusy("photo");
    setError("");
    const res = await fetch("/api/account/avatar", { method: "DELETE" });
    if (!res.ok) setError(await readError(res, "Could not remove the photo."));
    setBusy("");
    router.refresh();
  }

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setBusy("name");
    setError("");
    setSaved(false);
    const res = await fetch("/api/account/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) setSaved(true);
    else setError(await readError(res, "Could not save your name."));
    setBusy("");
    router.refresh();
  }

  return (
    <section className="panel profile" aria-labelledby="profile-title">
      <h2 id="profile-title">Profile</h2>

      <div className="profile__photo">
        <Avatar profile={profile} size={72} />
        <div className="profile__photo-actions">
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => picker.current?.click()}
            disabled={busy !== ""}
          >
            {busy === "photo" ? "Uploading…" : profile.avatar ? "Change photo" : "Add a photo"}
          </button>
          {profile.avatar ? (
            <button type="button" className="link-inline profile__remove" onClick={removePhoto} disabled={busy !== ""}>
              Remove
            </button>
          ) : null}
          <input
            ref={picker}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) uploadPhoto(file);
            }}
          />
        </div>
      </div>
      <p className="hint">JPG, PNG or WebP, up to 5 MB. It is cropped to a square.</p>

      <form className="profile__name" onSubmit={saveName}>
        <div className="field">
          <label className="label" htmlFor="profile-name">
            Your name
          </label>
          <input
            id="profile-name"
            className="input"
            type="text"
            autoComplete="name"
            maxLength={80}
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
          />
        </div>
        <button
          className="btn btn--ghost btn--small"
          type="submit"
          disabled={busy !== "" || !name.trim() || name.trim() === profile.name}
        >
          {busy === "name" ? "Saving…" : saved ? "Saved" : "Save name"}
        </button>
      </form>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
