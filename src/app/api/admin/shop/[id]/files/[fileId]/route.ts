import { isAdmin } from "@/lib/admin-auth";
import { removeStored } from "@/lib/disk";
import { isUuid } from "@/lib/orders";
import { db } from "@/lib/supabase";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string; fileId: string }> };

/** Removes a file from a product (and from the disk). */
export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { id, fileId } = await params;
  if (!isUuid(id) || !isUuid(fileId)) return Response.json({ error: "Not found." }, { status: 404 });
  const { data } = await db().from("product_files").select("path").eq("id", fileId).eq("product_id", id).maybeSingle();
  if (!data) return Response.json({ error: "Not found." }, { status: 404 });
  await db().from("product_files").delete().eq("id", fileId);
  await removeStored("shop", data.path);
  return Response.json({ ok: true });
}
