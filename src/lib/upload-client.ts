"use client";

/** Bytes per request: small enough for the Next.js proxy (10 MB) and Cloudflare (100 MB). */
const CHUNK = 8 * 1024 * 1024;

/**
 * Sends a file in chunks to one of the site's upload routes: `start` registers the file and returns its id,
 * then each chunk is PUT to `chunkUrl(id)?offset=…`. A failed chunk is retried, resuming where the server is.
 */
export async function uploadInChunks(
  file: File,
  start: { url: string; body?: Record<string, unknown> },
  chunkUrl: (id: string) => string,
  onProgress?: (fraction: number) => void,
): Promise<{ id: string }> {
  const res = await fetch(start.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, size: file.size, type: file.type, ...start.body }),
  });
  const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
  if (!res.ok || !data.id) throw new Error(data.error ?? "Could not start the upload.");

  let offset = 0;
  let failures = 0;
  onProgress?.(0);
  while (offset < file.size) {
    const part = file.slice(offset, offset + CHUNK);
    try {
      const put = await fetch(`${chunkUrl(data.id)}?offset=${offset}`, { method: "PUT", body: part });
      const out = (await put.json().catch(() => ({}))) as { size?: number; error?: string };
      if (put.status === 409 && typeof out.size === "number") {
        offset = out.size; // the server already has more (or less) than we thought: resume from there
        continue;
      }
      if (!put.ok) throw new Error(out.error ?? "Upload failed.");
      offset = out.size ?? offset + part.size;
      failures = 0;
      onProgress?.(offset / file.size);
    } catch (err) {
      if (++failures >= 4) throw err instanceof Error ? err : new Error("Upload failed.");
      await new Promise((r) => setTimeout(r, 1000 * failures));
    }
  }
  return { id: data.id };
}
