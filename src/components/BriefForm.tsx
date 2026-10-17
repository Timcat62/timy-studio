"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { budgets, projectTypes } from "@/lib/config";
import { formatSize } from "@/lib/format";
import { uploadInChunks } from "@/lib/upload-client";
import { Icon } from "./Icon";

interface Props {
  maxFiles: number;
  maxFileSizeMB: number;
  defaultType?: string;
  /** Signed-in client: name and email are filled in, and the brief is added to their account. */
  account?: { name: string; email: string } | null;
}

type Phase = "idle" | "sending" | "uploading";

export function BriefForm({ maxFiles, maxFileSizeMB, defaultType, account }: Props) {
  const router = useRouter();
  const startedAt = useRef(Date.now());
  const picker = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [partial, setPartial] = useState<{ token: string; failed: number } | null>(null);

  function addFiles(list: FileList | File[]) {
    setError("");
    const incoming = Array.from(list);
    const tooBig = incoming.find((f) => f.size > maxFileSizeMB * 1024 * 1024);
    if (tooBig) {
      setError(`"${tooBig.name}" is over ${formatSize(maxFileSizeMB * 1024 * 1024)}. Share it by link in your description instead.`);
      return;
    }
    const merged = [...files, ...incoming];
    if (merged.length > maxFiles) {
      setError(`You can attach up to ${maxFiles} files. Zip them together or share a link in your description.`);
      return;
    }
    setFiles(merged);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phase !== "idle") return;
    setError("");

    const form = new FormData(e.currentTarget);
    const text = (k: string) => String(form.get(k) ?? "").trim();

    if (text("description").length < 20) {
      setError("Please describe the project in at least a couple of sentences.");
      return;
    }

    setPhase("sending");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: text("name"),
          email: text("email"),
          projectType: text("projectType"),
          budget: text("budget"),
          description: text("description"),
          deadline: text("deadline"),
          links: text("links"),
          consent: form.get("consent") === "on",
          website: text("website"),
          elapsedMs: Date.now() - startedAt.current,
          files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
        }),
      });
      const data = (await res.json()) as { error?: string; token?: string };
      if (!res.ok || !data.token) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setPhase("idle");
        return;
      }

      // files go to the project folder on my server, in chunks, one after the other
      let failed = 0;
      if (files.length) {
        setPhase("uploading");
        const token = data.token;
        const total = files.reduce((n, f) => n + f.size, 0) || 1;
        let sent = 0;
        for (const file of files) {
          try {
            await uploadInChunks(
              file,
              { url: `/api/orders/${token}/files` },
              (id) => `/api/upload/order/${token}/${id}`,
              (f) => setProgress(Math.round(((sent + f * file.size) / total) * 100)),
            );
          } catch {
            failed += 1;
          }
          sent += file.size;
        }
      }

      if (failed > 0) {
        setPartial({ token: data.token, failed });
        setPhase("idle");
        return;
      }
      router.push(`/order/${data.token}`);
    } catch {
      setError("Network problem. Check your connection and try again.");
      setPhase("idle");
    }
  }

  if (partial) {
    return (
      <div className="stack narrow" style={{ maxWidth: "44rem" }}>
        <div className="notice">
          Your brief was sent, but {partial.failed} file{partial.failed > 1 ? "s" : ""} could not be uploaded. Open your
          project page and tell me in the chat, or send them by email.
        </div>
        <p>
          <Link href={`/order/${partial.token}`} className="btn btn--primary">
            Open my project page
          </Link>
        </p>
      </div>
    );
  }

  const busy = phase !== "idle";

  return (
    <form className="form" onSubmit={onSubmit} noValidate={false}>
      <div className="field-row">
        <div className="field">
          <label className="label" htmlFor="name">
            Your name
          </label>
          <input className="input" id="name" name="name" type="text" autoComplete="name" required maxLength={100} defaultValue={account?.name} />
        </div>
        <div className="field">
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            className="input"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={200}
            defaultValue={account?.email}
            readOnly={Boolean(account)}
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label className="label" htmlFor="projectType">
            What do you need?
          </label>
          <select className="select" id="projectType" name="projectType" required defaultValue={defaultType ?? projectTypes[0]}>
            {projectTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="label" htmlFor="budget">
            Budget
          </label>
          <select className="select" id="budget" name="budget" required defaultValue={budgets[budgets.length - 1]}>
            {budgets.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="description">
          Describe the project
        </label>
        <textarea
          className="textarea"
          id="description"
          name="description"
          required
          minLength={20}
          maxLength={6000}
          placeholder="The car, the setting, the mood, where it will be shown, anything that matters."
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label className="label" htmlFor="deadline">
            Deadline <span className="muted">(optional)</span>
          </label>
          <input className="input" id="deadline" name="deadline" type="text" maxLength={200} placeholder="A date, or &quot;flexible&quot;" />
        </div>
        <div className="field">
          <label className="label" htmlFor="links">
            Reference links <span className="muted">(optional)</span>
          </label>
          <input className="input" id="links" name="links" type="text" maxLength={2000} placeholder="Videos, moodboards, a Drive folder" />
        </div>
      </div>

      <div className="field">
        <span className="label" id="files-label">
          Files <span className="muted">(optional)</span>
        </span>
        <div
          className={`drop${dragging ? " drop--active" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
          }}
        >
          <p className="hint">
            Car models, logos, references, audio. Up to {maxFiles} files, {formatSize(maxFileSizeMB * 1024 * 1024)} each. You
            can send more later in the project chat.
          </p>
          <button type="button" className="btn btn--ghost btn--small drop__pick" onClick={() => picker.current?.click()} disabled={busy}>
            <Icon name="paperclip" /> Add files
          </button>
          <input
            ref={picker}
            type="file"
            multiple
            hidden
            aria-labelledby="files-label"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {files.length > 0 ? (
            <ul className="file-list">
              {files.map((f, i) => (
                <li key={`${f.name}-${i}`}>
                  <span className="file-list__name">{f.name}</span>
                  <span className="muted num" style={{ whiteSpace: "nowrap" }}>
                    {formatSize(f.size)}
                  </span>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Remove ${f.name}`}
                    onClick={() => setFiles(files.filter((_, j) => j !== i))}
                    disabled={busy}
                  >
                    <Icon name="close" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {/* Honeypot: real people never see or fill this */}
      <div className="hp" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="check">
        <input type="checkbox" name="consent" required />
        <span>
          I agree to the <Link href="/legal#terms">terms</Link> and to my brief, files and messages being stored to handle my
          request (<Link href="/legal#privacy">privacy</Link>).
        </span>
      </label>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      {phase === "uploading" ? (
        <div className="stack" aria-live="polite">
          <p className="hint">Uploading your files…</p>
          <div className="progress">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}

      <div>
        <button className="btn btn--primary" type="submit" disabled={busy}>
          {phase === "sending" ? "Sending…" : phase === "uploading" ? "Uploading…" : "Send brief"}
        </button>
      </div>
    </form>
  );
}
