import type { Metadata } from "next";
import Link from "next/link";
import { formatMoney } from "@/lib/format";
import { listProducts, thumbUrl } from "@/lib/shop";

// the grid is the same for everyone: built once, refreshed when I edit a product or after a minute at most
export const revalidate = 60;
export const metadata: Metadata = {
  title: "Shop",
  description: "Blender project files, car models and more, ready to download.",
};

export default async function Shop() {
  const products = await listProducts({ publishedOnly: true }).catch(() => []);

  return (
    <>
      <div className="wrap page-head">
        <h1 className="display">Shop</h1>
        <p className="lede">Blender project files, models and other things I make, ready to download.</p>
      </div>
      <section className="section section--tight" style={{ borderTop: 0, paddingTop: 0 }}>
        <div className="wrap">
          {products.length === 0 ? (
            <p className="notice">Nothing here yet. The first files are on their way.</p>
          ) : (
            <ul className="shop-grid">
              {products.map((p) => {
                const thumb = thumbUrl(p);
                return (
                  <li key={p.id}>
                    <Link href={`/shop/${p.slug}`} className="product-card">
                      <div className="product-card__media">
                        {thumb ? <img src={thumb} alt="" loading="lazy" decoding="async" /> : null}
                      </div>
                      <div className="product-card__body">
                        <p className="product-card__title">{p.title}</p>
                        {p.summary ? <p className="product-card__summary">{p.summary}</p> : null}
                        <p className="product-card__price">
                          {p.price_cents === 0 ? "Free" : formatMoney(p.price_cents, p.currency)}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
