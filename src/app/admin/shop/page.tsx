import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { NewProductButton } from "@/components/ProductEditor";
import { isAdmin } from "@/lib/admin-auth";
import { formatDate, formatMoney } from "@/lib/format";
import { listProducts, thumbUrl } from "@/lib/shop";
import { db } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Shop admin", robots: { index: false, follow: false } };

export default async function AdminShop() {
  if (!(await isAdmin())) redirect("/admin");
  const products = await listProducts({ publishedOnly: false });
  const { data: sales } = await db().from("purchases").select("product_id,amount");
  const stats = new Map<string, { count: number; total: number }>();
  for (const s of (sales ?? []) as { product_id: string | null; amount: number }[]) {
    if (!s.product_id) continue;
    const cur = stats.get(s.product_id) ?? { count: 0, total: 0 };
    stats.set(s.product_id, { count: cur.count + 1, total: cur.total + s.amount });
  }

  return (
    <div className="wrap" style={{ paddingBottom: "6rem" }}>
      <AdminNav current="shop" />
      <div className="admin-bar" style={{ marginBottom: "1.5rem" }}>
        <p className="muted">Each product is a post with a cover, a price and files to download.</p>
        <NewProductButton />
      </div>
      {products.length === 0 ? (
        <p className="notice">No products yet. Create the first one.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Status</th>
                <th>Sales</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const s = stats.get(p.id);
                const thumb = thumbUrl(p);
                return (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/admin/shop/${p.id}`} className="admin-product">
                        {thumb ? <img src={thumb} alt="" /> : <span className="admin-product__empty" />}
                        {p.title}
                      </Link>
                    </td>
                    <td className="num">{p.price_cents ? formatMoney(p.price_cents, p.currency) : "Free"}</td>
                    <td>
                      <span className={`badge${p.published ? " badge--paid" : ""}`}>{p.published ? "Published" : "Draft"}</span>
                    </td>
                    <td className="num">
                      {s ? `${s.count}${s.total ? ` · ${formatMoney(s.total, p.currency)}` : ""}` : "—"}
                    </td>
                    <td className="num" suppressHydrationWarning>
                      {formatDate(p.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
