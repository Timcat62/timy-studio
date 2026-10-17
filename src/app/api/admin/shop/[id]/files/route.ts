import { randomUUID } from "node:crypto";
import { isAdmin } from "@/lib/admin-auth";
import { safeFilename } from "@/lib/format";
import { failJson, readFileMeta } from "@/lib/order-files";
import { MAX_SHOP_FILE_BYTES, getProduct } from "@/lib/shop";
import { db } from "@/lib/supabase";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** Registers a product file before its chunks are sent to /api/upload/shop. */
export async function POST(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  if (!(await getProduct({ id }))) return Response.json({ error: "Not found." }, { status: 404 });

  const meta = readFileMeta(await req.json().catch(() => null), MAX_SHOP_FILE_BYTES);
  if ("error" in meta) return failJson(meta);
  const { data, error } = await db()
    .from("product_files")
    .insert({
      product_id: id,
      filename: meta.name,
      path: `${id}/files/${randomUUID()}-${safeFilename(meta.name)}`,
      size: meta.size,
      content_type: meta.type,
      complete: false,
    })
    .select("id")
    .single();
  if (error || !data) return Response.json({ error: "Could not start the upload." }, { status: 500 });
  return Response.json({ id: data.id });
}
