import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/format";
import { getOrderForViewer } from "@/lib/orders";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/supabase";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ token: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { token } = await params;
  const access = await getOrderForViewer(token);
  if (access.status !== "ok") return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = (await req.json().catch(() => null)) as { accept?: boolean } | null;
  if (!body?.accept) {
    return NextResponse.json({ error: "Please accept the terms to continue." }, { status: 400 });
  }

  const { data: order } = await db()
    .from("orders")
    .select("id,email,project_type,status,quote_amount,quote_currency,quote_note")
    .eq("id", access.order.id)
    .maybeSingle();
  if (!order) return NextResponse.json({ error: "Not found." }, { status: 404 });

  // Payment is only possible once the price has been set by timy.
  if (order.status !== "quoted" || !order.quote_amount || order.quote_amount < 50) {
    return NextResponse.json({ error: "There is no price to pay yet." }, { status: 400 });
  }

  const base = siteUrl();
  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: order.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: order.quote_currency || "eur",
            unit_amount: order.quote_amount,
            product_data: {
              name: `timy. | ${order.project_type}`,
              description: order.quote_note?.slice(0, 300) || "Custom CGI project, price agreed in the project chat.",
            },
          },
        },
      ],
      invoice_creation: { enabled: true },
      metadata: { order_id: order.id },
      payment_intent_data: { metadata: { order_id: order.id } },
      success_url: `${base}/order/${token}?paid=1`,
      cancel_url: `${base}/order/${token}`,
    });
    await db().from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout failed", err);
    return NextResponse.json({ error: "Could not start the payment. Please try again or message me." }, { status: 500 });
  }
}
