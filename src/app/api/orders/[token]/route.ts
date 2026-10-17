import { NextResponse } from "next/server";
import { z } from "zod";
import { adminEmail, adminOrderLink, notifyDiscord, sendEmail } from "@/lib/notify";
import { addMessage, getOrderForViewer, loadClientState } from "@/lib/orders";
import { db } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { token } = await params;
  const access = await getOrderForViewer(token);
  if (access.status === "login") return NextResponse.json({ error: "Sign in to see this project." }, { status: 401 });
  if (access.status !== "ok") return NextResponse.json({ error: "Not found." }, { status: 404 });
  const { order } = access;
  return NextResponse.json(await loadClientState(order, token));
}

const messageSchema = z.object({ body: z.string().trim().min(1).max(4000) });

export async function POST(req: Request, { params }: Ctx) {
  const { token } = await params;
  const access = await getOrderForViewer(token);
  if (access.status === "login") return NextResponse.json({ error: "Sign in to see this project." }, { status: 401 });
  if (access.status !== "ok") return NextResponse.json({ error: "Not found." }, { status: 404 });
  const { order } = access;

  const parsed = messageSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Write a message first." }, { status: 400 });

  // Throttle: 20 client messages per 10 minutes per order.
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await db()
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("order_id", order.id)
    .eq("sender", "client")
    .gte("created_at", since);
  if ((count ?? 0) >= 20) {
    return NextResponse.json({ error: "Slow down a little. Try again in a few minutes." }, { status: 429 });
  }

  await addMessage(order.id, "client", parsed.data.body);
  await db().from("orders").update({ last_client_message_at: new Date().toISOString() }).eq("id", order.id);

  // Tell the owner: Discord ping plus an email with the message itself. Replying to the email reaches the client.
  const { data: contact } = await db().from("orders").select("email").eq("id", order.id).maybeSingle();
  const link = adminOrderLink(order.id);
  await Promise.all([
    notifyDiscord(`${order.name} wrote on their ${order.project_type} order:\n${parsed.data.body.slice(0, 600)}\n${link}`),
    sendEmail(
      adminEmail(),
      `New message from ${order.name}`,
      `${order.name} (${contact?.email ?? "no email"}) wrote on their ${order.project_type} project:\n\n${parsed.data.body}\n\nAnswer on the site: ${link}`,
      contact?.email ?? undefined,
    ),
  ]);
  return NextResponse.json({ ok: true });
}
