import { createReadStream, createWriteStream, promises as fs } from "node:fs";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";

/**
 * Files kept on the server's own disk instead of Supabase:
 *  - "customers": files sent by clients (brief and chat) and the files I deliver, one folder per project
 *  - "shop": product files and thumbnails, one folder per product
 * The folders come from STORAGE_CUSTOMERS_DIR and STORAGE_SHOP_DIR (absolute paths on the big disk).
 * Without them (on a dev machine), they live in ./.data, which git ignores.
 */
export type Area = "customers" | "shop";

export function areaRoot(area: Area) {
  const configured = area === "shop" ? process.env.STORAGE_SHOP_DIR : process.env.STORAGE_CUSTOMERS_DIR;
  return path.resolve(configured || path.join(process.cwd(), ".data", area));
}

/** Absolute path of a stored file. Refuses anything that would leave the area's folder. */
export function resolveIn(area: Area, rel: string) {
  const root = areaRoot(area);
  const abs = path.resolve(root, rel);
  if (!abs.startsWith(root + path.sep)) throw new Error("Path outside the storage folder.");
  return abs;
}

export class ChunkOffsetError extends Error {
  constructor(public readonly size: number) {
    super("Chunk offset does not match the file on disk.");
  }
}

/**
 * Appends one chunk of an upload. Chunks must arrive in order: `offset` has to equal the bytes already
 * on disk (otherwise ChunkOffsetError tells the browser where to resume). Returns the new file size.
 */
export async function writeChunk(area: Area, rel: string, offset: number, body: ReadableStream<Uint8Array>, maxTotal: number) {
  const abs = resolveIn(area, rel);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  const current = await fs.stat(abs).then((s) => s.size).catch(() => 0);
  if (current !== offset) throw new ChunkOffsetError(current);

  let written = 0;
  const limit = new Transform({
    transform(chunk: Buffer, _enc, done) {
      written += chunk.length;
      if (offset + written > maxTotal) done(new Error("File is larger than announced."));
      else done(null, chunk);
    },
  });
  await pipeline(
    Readable.fromWeb(body as import("node:stream/web").ReadableStream<Uint8Array>),
    limit,
    createWriteStream(abs, { flags: offset === 0 ? "w" : "a" }),
  );
  return offset + written;
}

/** Saves a small file (a thumbnail) in one go. */
export async function writeWhole(area: Area, rel: string, data: Buffer) {
  const abs = resolveIn(area, rel);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, data);
}

export async function removeStored(area: Area, rel: string) {
  await fs.rm(resolveIn(area, rel), { force: true });
}

export async function removeFolder(area: Area, rel: string) {
  await fs.rm(resolveIn(area, rel), { recursive: true, force: true });
}

/** Streams a stored file to the browser, as a download unless `inline`. */
export async function fileResponse(
  area: Area,
  rel: string,
  opts: { filename?: string; contentType?: string | null; inline?: boolean; cache?: string } = {},
) {
  const abs = resolveIn(area, rel);
  const stat = await fs.stat(abs).catch(() => null);
  if (!stat?.isFile()) return new Response("Not found.", { status: 404 });
  const headers = new Headers({
    "Content-Length": String(stat.size),
    "Content-Type": opts.contentType || "application/octet-stream",
    "Cache-Control": opts.cache ?? "private, no-store",
    "X-Content-Type-Options": "nosniff",
  });
  if (!opts.inline) {
    const name = opts.filename || path.basename(abs);
    const ascii = name.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
    headers.set("Content-Disposition", `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`);
  }
  const stream = Readable.toWeb(createReadStream(abs)) as ReadableStream<Uint8Array>;
  return new Response(stream, { headers });
}
