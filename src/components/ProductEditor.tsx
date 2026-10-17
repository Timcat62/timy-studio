"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { formatSize } from "@/lib/format";
import type { Product, ProductFile } from "@/lib/shop";
import { uploadInChunks } from "@/lib/upload-client";
import { Icon } from "./Icon";

export function NewProductButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="btn btn--primary btn--small"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const res = await fetch("/api/admin/shop", { method: "POST" });
        const data = (await res.json().catch(() => ({}))) as { id?: string };
        if (data.id) router.push(`/admin/shop/${data.id}`);
        else setBusy(false);
      }}
    >
      {busy ? "Creating…" : "New product"}
    </button>
  );
}

interface Props {
  product: Product;
  files: ProductFile[];
  thumb: string | null;
}

/** Everything about one shop post: cover, text, price, files, published or not. */
export function ProductEditor({ product, files, thumb }: Props) {
  const router = useRouter();
  const coverPicker = useRef<HTMLInputElement>(null);
  const filePicker = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(product.title);
  const [slug, setSlug] = useState(product.slug.startsWith("draft-") ? "" : product.slug);
  const [summary, setSummary] = useState(product.summary);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price_cents ? String(product.price_cents / 100) : "0");
  const [published, setPublished] = useState(product.published);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [uploads, setUploads] = useState<{ name: string; percent: number; error?: string }[]>([]);

  async function save(nextPublished = published) {
    setBusy("save");
    setError("");
    setNotice("");
    const value = Number(price.replace(",", "."));
    const res = await fetch(`/api/admin/shop/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug,
        summary,
        description,
        price: Number.isFinite(value) ? value : -1,
        published: nextPublished,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; slug?: string };
    setBusy("");
    if (!res.ok) {
      setError(data.error ?? "Could not save.");
      return;
    }
    setPublished(nextPublished);
    if (data.slug) setSlug(data.slug);
    setNotice(nextPublished ? "Saved and published." : "Saved as a draft.");
    router.refresh();
  }

  async function setCover(file: File) {
    setBusy("cover");
    setError("");
    const body = new FormData();
    body.append("file", file);
    const res = await fetch(`/api/admin/shop/${product.id}/thumb`, { method: "POST", body });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy("");
    if (!res.ok) setError(data.error ?? "Could not upload the cover.");
    router.refresh();
  }

  async function addFiles(list: FileList | null) {
    if (!list?.length) return;
    const picked = Array.from(list);
    setUploads(picked.map((f) => ({ name: f.name, percent: 0 })));
    setBusy("files");
    for (const [i, file] of picked.entries()) {
      const update = (patch: { percent?: number; error?: string }) =>
        setUploads((u) => u.map((x, j) => (j === i ? { ...x, ...patch } : x)));
      try {
        await uploadInChunks(
          file,
          { url: `/api/admin/shop/${product.id}/files` },
          (id) => `/api/upload/shop/${product.id}/${id}`,
          (f) => update({ percent: Math.round(f * 100) }),
        );
      } catch (err) {
        update({ error: err instanceof Error ? err.message : "Upload failed." });
      }
    }
    setBusy("");
    router.refresh();
  }

  async function removeFile(id: string, name: string) {
    if (!window.confirm(`Remove "${name}" from this product?`)) return;
    await fetch(`/api/admin/shop/${product.id}/files/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function removeProduct() {
    if (!window.confirm(`Delete "${product.title}" and all its files? Buyers will lose access.`)) return;
    await fetch(`/api/admin/shop/${product.id}`, { method: "DELETE" });
    router.push("/admin/shop");
    router.refresh();
  }

  const uploading = busy === "files";

  return (
    <div className="editor">
      <div className="editor__main stack">
        <div className="field">
          <label className="label" htmlFor="p-title">
            Title
          </label>
          <input id="p-title" className="input" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="field-row">
          <div className="field">
            <label className="label" htmlFor="p-price">
              Price (EUR) <span className="muted">· 0 = free with an account</span>
            </label>
            <input id="p-price" className="input num" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="field">
            <label className="label" htmlFor="p-slug">
              Address <span className="muted">· timy.studio/shop/…</span>
            </label>
            <input
              id="p-slug"
              className="input"
              value={slug}
              maxLength={60}
              placeholder="made from the title"
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="p-summary">
            Short line <span className="muted">· shown on the shop grid</span>
          </label>
          <input id="p-summary" className="input" value={summary} maxLength={240} onChange={(e) => setSummary(e.target.value)} />
        </div>
        <div className="field">
          <label className="label" htmlFor="p-desc">
            Description <span className="muted">· a blank line starts a new paragraph</span>
          </label>
          <textarea
            id="p-desc"
            className="textarea"
            style={{ minHeight: "14rem" }}
            value={description}
            maxLength={10000}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="notice" role="status">
            {notice}
          </p>
        ) : null}

        <div className="editor__actions">
          <button className="btn btn--ghost" onClick={() => save(false)} disabled={busy !== ""}>
            {published ? "Unpublish" : "Save draft"}
          </button>
          <button className="btn btn--primary" onClick={() => save(true)} disabled={busy !== ""}>
            {busy === "save" ? "Saving…" : published ? "Save" : "Publish"}
          </button>
          {published ? (
            <Link href={`/shop/${slug}`} className="link-arrow" target="_blank">
              View in the shop <Icon name="arrow-up-right" />
            </Link>
          ) : null}
        </div>
      </div>

      <aside className="editor__side stack">
        <section className="panel">
          <h2>Cover</h2>
          <div className="editor__cover">{thumb ? <img src={thumb} alt="" /> : <span>No cover yet</span>}</div>
          <button className="btn btn--ghost btn--small" onClick={() => coverPicker.current?.click()} disabled={busy !== ""}>
            {busy === "cover" ? "Uploading…" : thumb ? "Change cover" : "Add a cover"}
          </button>
          <p className="hint">Cropped to 4:3. JPG, PNG or WebP up to 8 MB.</p>
          <input
            ref={coverPicker}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void setCover(f);
            }}
          />
        </section>

        <section className="panel">
          <h2>Files</h2>
          {files.length === 0 ? <p className="muted">No files yet.</p> : null}
          <ul className="attach">
            {files.map((f) => (
              <li key={f.id}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {f.filename}
                  {f.complete ? "" : " (incomplete)"}
                </span>
                <span className="muted num">{formatSize(f.size)}</span>
                <button type="button" className="icon-btn" aria-label={`Remove ${f.filename}`} onClick={() => removeFile(f.id, f.filename)}>
                  <Icon name="close" />
                </button>
              </li>
            ))}
          </ul>
          {uploads.length > 0 ? (
            <ul className="editor__uploads" aria-live="polite">
              {uploads.map((u, i) => (
                <li key={`${u.name}-${i}`}>
                  <span className="hint">
                    {u.name} · {u.error ? u.error : `${u.percent}%`}
                  </span>
                  <div className="progress">
                    <span style={{ width: `${u.percent}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
          <button className="btn btn--ghost btn--small" onClick={() => filePicker.current?.click()} disabled={busy !== ""}>
            <Icon name="paperclip" /> {uploading ? "Uploading…" : "Add files"}
          </button>
          <p className="hint">Any type, up to 20 GB each. Saved on the server's disk. Keep this page open while it uploads.</p>
          <input
            ref={filePicker}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </section>

        <button className="link-inline editor__delete" onClick={removeProduct}>
          Delete this product
        </button>
      </aside>
    </div>
  );
}
