import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { formatMoney } from "@/lib/format";
import { adminOrderLink, notifyDiscord, orderLink, sendEmail } from "@/lib/notify";
import { addMessage } from "@/lib/orders";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Not configured." }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(raw, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    if (orderId && session.payment_status === "paid") {
      const { data: order } = await db()
        .from("orders")
        .select("id,token,name,email,status,quote_amount,quote_currency")
        .eq("id", orderId)
        .maybeSingle();

      if (order && order.status !== "paid" && order.status !== "in_production" && order.status !== "delivered") {
        const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
        await db()
          .from("orders")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            stripe_session_id: session.id,
            stripe_payment_intent: paymentIntent ?? null,
          })
          .eq("id", order.id);

        const amount = formatMoney(session.amount_total ?? order.quote_amount ?? 0, session.currency ?? order.quote_currency);
        await addMessage(order.id, "system", `Payment of ${amount} received. Thank you! I'll start production now.`);
        await Promise.all([
          notifyDiscord(`Payment received: ${amount} from ${order.name}\n${adminOrderLink(order.id)}`),
          sendEmail(
            order.email,
            "Payment received",
            `Hi ${order.name},\n\nYour payment of ${amount} went through. Stripe sends your receipt separately. I'm starting production, and you can follow everything here:\n\n${orderLink(order.token)}\n\ntimy.`,
          ),
        ]);
      }
    }
  }

  return NextResponse.json({ received: true });
}
