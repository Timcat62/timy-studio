import { adminEmail, adminOrderLink, notifyDiscord, sendEmail } from "@/lib/notify";
import { getOrderForViewer, isUuid } from "@/lib/orders";
import { chunkJson, putOrderChunk } from "@/lib/order-files";
import { db } from "@/lib/supabase";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ token: string; fileId: string }> };

/** One chunk of a client's file. Lives under /api/upload so the proxy never buffers the body. */
export async function PUT(req: Request, { params }: Ctx) {
  const { token, fileId } = await params;
  if (!isUuid(fileId)) return Response.json({ error: "Not found." }, { status: 404 });
  const access = await getOrderForViewer(token);
  if (access.status !== "ok") return Response.json({ error: "Not found." }, { status: 404 });
  const { order } = access;

  const result = await putOrderChunk(order.id, fileId, new URL(req.url).searchParams.get("offset"), req.body);
  if (!("error" in result) && result.justCompleted && result.row.via_chat) {
    await db().from("orders").update({ last_client_message_at: new Date().toISOString() }).eq("id", order.id);
    const { data: contact } = await db().from("orders").select("email").eq("id", order.id).maybeSingle();
    const link = adminOrderLink(order.id);
    await Promise.all([
      notifyDiscord(`${order.name} sent a file on their ${order.project_type} order: ${result.row.filename}\n${link}`),
      sendEmail(
        adminEmail(),
        `New file from ${order.name}`,
        `${order.name} sent a file on their ${order.project_type} project: ${result.row.filename}\n\nOpen it on the site: ${link}`,
        contact?.email ?? undefined,
      ),
    ]);
  }
  return chunkJson(result);
}
