import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { formatMoney } from "@/lib/format";
import { notifyDiscord, orderLink, sendEmail } from "@/lib/notify";
import { addMessage, isUuid, loadAdminState } from "@/lib/orders";
import { db } from "@/lib/supabase";
import type { OrderStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const state = await loadAdminState(id);
  if (!state) return NextResponse.json({ error: "Not found." }, { status: 404 });
  await db().from("orders").update({ admin_seen_at: new Date().toISOString() }).eq("id", id);
  return NextResponse.json(state);
}

const statuses = ["new", "discussing", "quoted", "paid", "in_production", "delivered", "cancelled"] as const;

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("message"), body: z.string().trim().min(1).max(4000) }),
  z.object({
    action: z.literal("quote"),
    amount: z.number().min(1).max(100000),
    note: z.string().trim().max(500).optional().default(""),
  }),
  z.object({ action: z.literal("status"), status: z.enum(statuses) }),
]);

const systemNotes: Partial<Record<OrderStatus, string>> = {
  paid: "Payment marked as received.",
  in_production: "Production has started.",
  delivered: "Your project has been delivered. Thank you!",
  cancelled: "This project was cancelled.",
};

export async function POST(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const parsed = actionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  const input = parsed.data;

  const { data: order } = await db()
    .from("orders")
    .select("id,token,name,email,status,quote_currency,client_notified_at,paid_at")
    .eq("id", id)
    .maybeSingle();
  if (!order) return NextResponse.json({ error: "Not found." }, { status: 404 });

  if (input.action === "message") {
    await addMessage(id, "admin", input.body);
    const update: Record<string, unknown> = {};
    if (order.status === "new") update.status = "discussing";

    // Email the client about a new reply, at most once every 10 minutes.
    const last = order.client_notified_at ? Date.parse(order.client_notified_at) : 0;
    if (Date.now() - last > 10 * 60 * 1000) {
      const sent = await sendEmail(
        order.email,
        "New message from timy.",
        `Hi ${order.name},\n\nI replied to your project. Read and answer here:\n\n${orderLink(order.token)}\n\ntimy.`,
      );
      if (sent) update.client_notified_at = new Date().toISOString();
    }
    if (Object.keys(update).length) await db().from("orders").update(update).eq("id", id);
    return NextResponse.json({ ok: true });
  }

  if (input.action === "quote") {
    if (order.status === "paid" || order.status === "in_production" || order.status === "delivered") {
      return NextResponse.json({ error: "This order is already paid." }, { status: 400 });
    }
    const cents = Math.round(input.amount * 100);
    await db()
      .from("orders")
      .update({
        quote_amount: cents,
        quote_note: input.note || null,
        quoted_at: new Date().toISOString(),
        status: "quoted",
      })
      .eq("id", id);
    const money = formatMoney(cents, order.quote_currency);
    await addMessage(
      id,
      "system",
      `Final price proposed: ${money}${input.note ? ` (${input.note})` : ""}. If it works for you, you can pay securely from the box above.`,
    );
    await sendEmail(
      order.email,
      `Your price: ${money}`,
      `Hi ${order.name},\n\nHere is the final price we discussed: ${money}.\nYou can review it and pay securely here:\n\n${orderLink(order.token)}\n\ntimy.`,
    );
    return NextResponse.json({ ok: true });
  }

  // status
  const update: Record<string, unknown> = { status: input.status };
  if (input.status === "paid" && !order.paid_at) update.paid_at = new Date().toISOString();
  await db().from("orders").update(update).eq("id", id);
  const note = systemNotes[input.status];
  if (note) await addMessage(id, "system", note);
  if (input.status === "delivered") {
    await notifyDiscord(`Delivered: ${order.name}`);
    await sendEmail(
      order.email,
      "Your project is delivered",
      `Hi ${order.name},\n\nYour project is marked as delivered. Details are on your page:\n\n${orderLink(order.token)}\n\ntimy.`,
    );
  }
  return NextResponse.json({ ok: true });
}
