import { isAdmin } from "@/lib/admin-auth";
import { orderLink, sendEmail } from "@/lib/notify";
import { isUuid } from "@/lib/orders";
import { chunkJson, putOrderChunk } from "@/lib/order-files";
import { site } from "@/lib/config";
import { db } from "@/lib/supabase";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string; fileId: string }> };

/** One chunk of a file I send in a project's chat. The client gets an email once it is complete. */
export async function PUT(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { id, fileId } = await params;
  if (!isUuid(id) || !isUuid(fileId)) return Response.json({ error: "Not found." }, { status: 404 });

  const result = await putOrderChunk(id, fileId, new URL(req.url).searchParams.get("offset"), req.body);
  if (!("error" in result) && result.justCompleted) {
    const { data: order } = await db().from("orders").select("name,email,token,status").eq("id", id).maybeSingle();
    if (order) {
      if (order.status === "new") await db().from("orders").update({ status: "discussing" }).eq("id", id);
      await sendEmail(
        order.email,
        "New file from timy.",
        `Hi ${order.name},\n\nI sent you a file: ${result.row.filename}\n\nDownload it from your project page: ${orderLink(order.token)}\n\ntimy.`,
        site.email,
      );
    }
  }
  return chunkJson(result);
}
