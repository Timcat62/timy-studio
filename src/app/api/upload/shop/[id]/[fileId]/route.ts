import { isAdmin } from "@/lib/admin-auth";
import { ChunkOffsetError, writeChunk } from "@/lib/disk";
import { isUuid } from "@/lib/orders";
import { db } from "@/lib/supabase";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string; fileId: string }> };

/** One chunk of a product file, written straight to the shop folder on the disk. */
export async function PUT(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { id, fileId } = await params;
  if (!isUuid(id) || !isUuid(fileId)) return Response.json({ error: "Not found." }, { status: 404 });

  const { data: row } = await db()
    .from("product_files")
    .select("path,size,complete")
    .eq("id", fileId)
    .eq("product_id", id)
    .maybeSingle();
  if (!row) return Response.json({ error: "Not found." }, { status: 404 });
  if (row.complete) return Response.json({ size: row.size, done: true });

  const offset = Number(new URL(req.url).searchParams.get("offset"));
  if (!Number.isInteger(offset) || offset < 0 || !req.body) return Response.json({ error: "Invalid chunk." }, { status: 400 });

  let size: number;
  try {
    size = await writeChunk("shop", row.path, offset, req.body, row.size);
  } catch (err) {
    if (err instanceof ChunkOffsetError) return Response.json({ error: "Out of order.", size: err.size }, { status: 409 });
    console.error("Shop chunk write failed", err);
    return Response.json({ error: "Could not save the file on the server." }, { status: 500 });
  }
  const done = size >= row.size;
  if (done) await db().from("product_files").update({ complete: true }).eq("id", fileId);
  return Response.json({ size, done });
}
