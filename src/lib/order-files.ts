import { randomUUID } from "node:crypto";
import { maxFileSizeMB } from "./config";
import { ChunkOffsetError, fileResponse, writeChunk } from "./disk";
import { safeFilename } from "./format";
import { BUCKET, db } from "./supabase";
import type { Sender } from "./types";

export const MAX_FILE_BYTES = maxFileSizeMB * 1024 * 1024;
const MAX_FILES_PER_PROJECT = 100;

type Fail = { error: string; status: number; size?: number };

interface Row {
  id: string;
  order_id: string;
  path: string;
  filename: string;
  size: number;
  content_type: string | null;
  sender: Sender;
  on_disk: boolean;
  complete: boolean;
  via_chat: boolean;
}

/** Name, size and type sent by the browser before an upload, checked. */
export function readFileMeta(input: unknown, maxBytes: number): { name: string; size: number; type: string | null } | Fail {
  const meta = input as { name?: unknown; size?: unknown; type?: unknown } | null;
  const name = typeof meta?.name === "string" ? meta.name.trim().slice(0, 255) : "";
  const size = typeof meta?.size === "number" ? Math.floor(meta.size) : 0;
  if (!name) return { error: "The file has no name.", status: 400 };
  if (size < 1) return { error: `"${name}" is empty.`, status: 400 };
  if (size > maxBytes) {
    return { error: `"${name}" is over ${Math.round(maxBytes / 1024 / 1024)} MB. Share it by link instead.`, status: 400 };
  }
  const type = typeof meta?.type === "string" && meta.type ? meta.type.slice(0, 200) : null;
  return { name, size, type };
}

/** Registers a file about to be uploaded to a project folder on the disk. */
export async function startOrderFile(orderId: string, sender: Sender, input: unknown): Promise<{ id: string } | Fail> {
  const meta = readFileMeta(input, MAX_FILE_BYTES);
  if ("error" in meta) return meta;

  const supabase = db();
  const { count } = await supabase.from("attachments").select("id", { count: "exact", head: true }).eq("order_id", orderId);
  if ((count ?? 0) >= MAX_FILES_PER_PROJECT) {
    return { error: "This project already has a lot of files. Share a link instead.", status: 400 };
  }
  if (sender === "client") {
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count: recent } = await supabase
      .from("attachments")
      .select("id", { count: "exact", head: true })
      .eq("order_id", orderId)
      .eq("sender", "client")
      .gte("created_at", since);
    if ((recent ?? 0) >= 30) return { error: "Too many files in a short time. Try again in a few minutes.", status: 429 };
  }

  const { data, error } = await supabase
    .from("attachments")
    .insert({
      order_id: orderId,
      path: `${orderId}/${randomUUID()}-${safeFilename(meta.name)}`,
      filename: meta.name,
      size: meta.size,
      content_type: meta.type,
      sender,
      on_disk: true,
      complete: false,
      via_chat: (input as { chat?: unknown } | null)?.chat === true,
    })
    .select("id")
    .single();
  if (error || !data) return { error: "Could not start the upload.", status: 500 };
  return { id: data.id };
}

type ChunkResult = Fail | { size: number; done: boolean; justCompleted: boolean; row: Row };

/**
 * Writes one chunk. When the last byte arrives the file is marked complete, and a file sent in the chat
 * gets its message. `justCompleted` tells the route to send the notification.
 */
export async function putOrderChunk(
  orderId: string,
  fileId: string,
  offsetParam: string | null,
  body: ReadableStream<Uint8Array> | null,
): Promise<ChunkResult> {
  const { data } = await db()
    .from("attachments")
    .select("id,order_id,path,filename,size,content_type,sender,on_disk,complete,via_chat")
    .eq("id", fileId)
    .eq("order_id", orderId)
    .maybeSingle();
  const row = data as Row | null;
  if (!row || !row.on_disk) return { error: "Not found.", status: 404 };
  if (row.complete) return { size: row.size, done: true, justCompleted: false, row };
  const offset = Number(offsetParam);
  if (!Number.isInteger(offset) || offset < 0 || !body) return { error: "Invalid chunk.", status: 400 };

  let size: number;
  try {
    size = await writeChunk("customers", row.path, offset, body, row.size);
  } catch (err) {
    if (err instanceof ChunkOffsetError) return { error: "Out of order.", status: 409, size: err.size };
    console.error("Chunk write failed", err);
    return { error: "Could not save the file on the server.", status: 500 };
  }
  if (size < row.size) return { size, done: false, justCompleted: false, row };

  await db().from("attachments").update({ complete: true }).eq("id", row.id);
  if (row.via_chat) {
    await db()
      .from("messages")
      .insert({ order_id: orderId, sender: row.sender, body: `Sent a file: ${row.filename}`, attachment_id: row.id });
  }
  return { size, done: true, justCompleted: true, row };
}

/** Download of a project file: from the disk, or from Supabase for files sent before the move. */
export async function orderFileResponse(orderId: string, fileId: string) {
  const { data } = await db()
    .from("attachments")
    .select("path,filename,content_type,on_disk,complete")
    .eq("id", fileId)
    .eq("order_id", orderId)
    .maybeSingle();
  if (!data || !data.complete) return new Response("Not found.", { status: 404 });
  if (data.on_disk) return fileResponse("customers", data.path, { filename: data.filename, contentType: data.content_type });
  const { data: signed } = await db().storage.from(BUCKET).createSignedUrl(data.path, 300, { download: data.filename });
  return signed?.signedUrl ? Response.redirect(signed.signedUrl, 302) : new Response("Not found.", { status: 404 });
}

/** JSON answer of a chunk route. */
export function chunkJson(result: ChunkResult) {
  if ("error" in result) {
    const { status, ...rest } = result;
    return Response.json(rest, { status });
  }
  return Response.json({ size: result.size, done: result.done });
}

export function failJson(result: Fail) {
  const { status, ...rest } = result;
  return Response.json(rest, { status });
}
