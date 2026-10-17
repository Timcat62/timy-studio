import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { siteUrl } from "@/lib/format";
import { createPurchase, getProduct, thumbUrl } from "@/lib/shop";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

/**
 * Paid product: opens Stripe Checkout (the purchase is saved by the webhook or the success page).
 * Free product: saved right away for the signed-in visitor.
 */
export async function POST(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const product = await getProduct({ slug });
  if (!product || !product.published) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const body = (await req.json().catch(() => null)) as { accept?: boolean } | null;
  const user = await currentUser();

  if (product.price_cents === 0) {
    if (!user?.email) {
      return NextResponse.json({ error: "Sign in to get it.", login: `/login?next=/shop/${slug}` }, { status: 401 });
    }
    const token = await createPurchase({ product, email: user.email, userId: user.id, amount: 0, currency: product.currency, sessionId: null });
    return NextResponse.json({ url: `/shop/download/${token}` });
  }

  if (!body?.accept) {
    return NextResponse.json({ error: "Please accept the terms to continue." }, { status: 400 });
  }

  const base = siteUrl();
  const image = thumbUrl(product);
  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: user?.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: product.currency,
            unit_amount: product.price_cents,
            product_data: {
              name: product.title,
              description: product.summary.slice(0, 300) || undefined,
              images: image ? [`${base}${image}`] : undefined,
            },
          },
        },
      ],
      invoice_creation: { enabled: true },
      metadata: { kind: "shop", product_id: product.id, user_id: user?.id ?? "" },
      success_url: `${base}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/shop/${product.slug}`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Shop checkout failed", err);
    return NextResponse.json({ error: "Could not start the payment. Please try again." }, { status: 500 });
  }
}
