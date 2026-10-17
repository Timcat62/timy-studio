import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { recordShopSession } from "@/lib/shop";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thank you", robots: { index: false, follow: false } };

/** Stripe sends buyers here. The payment is checked with Stripe itself, then they go straight to their files. */
export default async function ShopSuccess({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  let token: string | null = null;
  if (session_id && /^cs_[\w]+$/.test(session_id)) {
    try {
      const session = await stripe().checkout.sessions.retrieve(session_id);
      token = await recordShopSession(session);
    } catch (err) {
      console.error("Shop success check failed", err);
    }
  }
  if (token) redirect(`/shop/download/${token}`);

  return (
    <div className="wrap page-head" style={{ paddingBottom: "6rem" }}>
      <h1 className="display" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
        Confirming your payment…
      </h1>
      <p className="lede" style={{ marginTop: "1rem" }}>
        It can take a minute. Your download link is also on its way by email. If it doesn't arrive, write to me and I'll
        sort it out.
      </p>
      <p style={{ marginTop: "1.5rem" }}>
        <Link className="btn btn--ghost" href="/shop">
          Back to the shop
        </Link>
      </p>
    </div>
  );
}
