import type Stripe from "stripe";
import { currentUser } from "./auth";
import { siteUrl } from "./format";
import { notifyDiscord, sendEmail } from "./notify";
import { isUuid } from "./orders";
import { db } from "./supabase";

/** Shop files can be big (project files, models): up to 20 GB each, sent in chunks. */
export const MAX_SHOP_FILE_BYTES = 20 * 1024 * 1024 * 1024;

export interface Product {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  price_cents: number;
  currency: string;
  thumb_path: string | null;
  images: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductFile {
  id: string;
  filename: string;
  size: number;
  content_type: string | null;
  complete: boolean;
}

export interface Purchase {
  id: string;
  token: string;
  product_id: string | null;
  email: string;
  user_id: string | null;
  amount: number;
  currency: string;
  created_at: string;
}

const PRODUCT_COLUMNS = "id,slug,title,summary,description,price_cents,currency,thumb_path,images,published,created_at,updated_at";

/** Public URL of a product's cover, with the edit date so a new cover is not hidden by the cache. */
export function thumbUrl(p: Pick<Product, "id" | "thumb_path" | "updated_at">) {
  return p.thumb_path ? `/api/shop/thumb/${p.id}?v=${Date.parse(p.updated_at) || 0}` : null;
}

export const MAX_GALLERY_IMAGES = 12;

/** Every image of a product, the cover first, then the preview images. */
export function galleryUrls(p: Pick<Product, "id" | "thumb_path" | "images" | "updated_at">) {
  const v = Date.parse(p.updated_at) || 0;
  const cover = thumbUrl(p);
  const rest = (p.images ?? []).map((_, i) => `/api/shop/thumb/${p.id}?img=${i}&v=${v}`);
  return cover ? [cover, ...rest] : rest;
}

export function slugify(text: string) {
  return (
    text
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "product"
  );
}

export async function listProducts(opts: { publishedOnly: boolean }) {
  let q = db().from("products").select(PRODUCT_COLUMNS).order("created_at", { ascending: false }).limit(200);
  if (opts.publishedOnly) q = q.eq("published", true);
  const { data } = await q;
  return (data as Product[] | null) ?? [];
}

export async function getProduct(by: { slug?: string; id?: string }) {
  if (by.id && !isUuid(by.id)) return null;
  let q = db().from("products").select(PRODUCT_COLUMNS);
  q = by.id ? q.eq("id", by.id) : q.eq("slug", by.slug ?? "");
  const { data } = await q.maybeSingle();
  return (data as Product | null) ?? null;
}

export async function getProductFiles(productId: string, opts: { completeOnly: boolean }) {
  let q = db()
    .from("product_files")
    .select("id,filename,size,content_type,complete")
    .eq("product_id", productId)
    .order("created_at", { ascending: true });
  if (opts.completeOnly) q = q.eq("complete", true);
  const { data } = await q;
  return (data as ProductFile[] | null) ?? [];
}

const PURCHASE_COLUMNS = "id,token,product_id,email,user_id,amount,currency,created_at";

/** A purchase opened from its download link. Like projects, one tied to an account only opens for that account. */
export async function getPurchaseForViewer(token: string): Promise<{ status: "ok"; purchase: Purchase } | { status: "login" | "missing" }> {
  if (!isUuid(token)) return { status: "missing" };
  const { data } = await db().from("purchases").select(PURCHASE_COLUMNS).eq("token", token).maybeSingle();
  const purchase = data as Purchase | null;
  if (!purchase) return { status: "missing" };
  if (!purchase.user_id) return { status: "ok", purchase };
  const user = await currentUser();
  if (!user) return { status: "login" };
  return user.id === purchase.user_id ? { status: "ok", purchase } : { status: "missing" };
}

/** The signed-in visitor's purchase of a product, if any (to show "Download" instead of "Buy"). */
export async function findOwnPurchase(productId: string) {
  const user = await currentUser();
  if (!user) return null;
  const { data } = await db()
    .from("purchases")
    .select("token")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  return (data as { token: string } | null) ?? null;
}

export function downloadLink(token: string) {
  return `${siteUrl()}/shop/download/${token}`;
}

/** Creates the purchase once (free product or paid Stripe session) and emails the download link. */
export async function createPurchase(input: {
  product: Pick<Product, "id" | "title">;
  email: string;
  userId: string | null;
  amount: number;
  currency: string;
  sessionId: string | null;
}) {
  const supabase = db();
  if (input.sessionId) {
    const { data: existing } = await supabase.from("purchases").select("token").eq("stripe_session_id", input.sessionId).maybeSingle();
    if (existing) return existing.token as string;
  }
  const { data, error } = await supabase
    .from("purchases")
    .insert({
      product_id: input.product.id,
      email: input.email,
      user_id: input.userId,
      amount: input.amount,
      currency: input.currency,
      stripe_session_id: input.sessionId,
    })
    .select("token")
    .single();
  if (error || !data) {
    // the webhook and the success page can race: the other one already saved it
    if (input.sessionId) {
      const { data: again } = await supabase.from("purchases").select("token").eq("stripe_session_id", input.sessionId).maybeSingle();
      if (again) return again.token as string;
    }
    throw new Error(error?.message ?? "Could not save the purchase.");
  }

  const link = downloadLink(data.token);
  await Promise.all([
    sendEmail(
      input.email,
      `Your download: ${input.product.title}`,
      `Hi,\n\nThanks for getting "${input.product.title}". Your files are here:\n\n${link}\n\n` +
        (input.userId ? "They're also in your account on timy.studio.\n\n" : "Keep this link private.\n\n") +
        "timy.",
    ),
    input.amount > 0 ? notifyDiscord(`Shop sale: ${input.product.title} (${(input.amount / 100).toFixed(2)} ${input.currency.toUpperCase()})`) : null,
  ]);
  return data.token as string;
}

/** Records a paid Stripe Checkout session for a shop product. Safe to call twice. */
export async function recordShopSession(session: Stripe.Checkout.Session) {
  if (session.metadata?.kind !== "shop" || session.payment_status !== "paid") return null;
  const product = await getProduct({ id: session.metadata.product_id ?? "" });
  const email = session.customer_details?.email || session.customer_email;
  if (!product || !email) return null;
  const userId = session.metadata.user_id && isUuid(session.metadata.user_id) ? session.metadata.user_id : null;
  return createPurchase({
    product,
    email,
    userId,
    amount: session.amount_total ?? product.price_cents,
    currency: session.currency ?? product.currency,
    sessionId: session.id,
  });
}
