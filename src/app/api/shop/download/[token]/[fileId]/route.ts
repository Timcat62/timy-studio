import { fileResponse } from "@/lib/disk";
import { isUuid } from "@/lib/orders";
import { getPurchaseForViewer } from "@/lib/shop";
import { db } from "@/lib/supabase";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ token: string; fileId: string }> };

/** A bought file, streamed from the disk to its buyer. */
export async function GET(_req: Request, { params }: Ctx) {
  const { token, fileId } = await params;
  if (!isUuid(fileId)) return new Response("Not found.", { status: 404 });
  const access = await getPurchaseForViewer(token);
  if (access.status !== "ok" || !access.purchase.product_id) return new Response("Not found.", { status: 404 });

  const { data } = await db()
    .from("product_files")
    .select("path,filename,content_type,complete")
    .eq("id", fileId)
    .eq("product_id", access.purchase.product_id)
    .maybeSingle();
  if (!data?.complete) return new Response("Not found.", { status: 404 });
  return fileResponse("shop", data.path, { filename: data.filename, contentType: data.content_type });
}
