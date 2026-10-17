import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyBox } from "@/components/BuyBox";
import { ProductGallery } from "@/components/ProductGallery";
import { formatMoney, formatSize } from "@/lib/format";
import { findOwnPurchase, galleryUrls, getProduct, getProductFiles, thumbUrl } from "@/lib/shop";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct({ slug }).catch(() => null);
  if (!product?.published) return { title: "Shop" };
  const image = thumbUrl(product);
  return {
    title: product.title,
    description: product.summary || undefined,
    openGraph: image ? { images: [{ url: image }] } : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct({ slug });
  if (!product?.published) notFound();
  const [files, owned] = await Promise.all([getProductFiles(product.id, { completeOnly: true }), findOwnPurchase(product.id)]);
  const total = files.reduce((n, f) => n + f.size, 0);

  return (
    <div className="wrap product">
      <div className="page-head" style={{ paddingBottom: "1.5rem" }}>
        <p>
          <Link className="link-inline" href="/shop">
            Shop
          </Link>
        </p>
      </div>
      <div className="product__grid">
        <div className="product__media">
          <ProductGallery images={galleryUrls(product)} title={product.title} />
        </div>
        <div className="product__info">
          <h1 className="display product__title">{product.title}</h1>
          {product.summary ? <p className="lede">{product.summary}</p> : null}
          <p className="price">{product.price_cents === 0 ? "Free" : formatMoney(product.price_cents, product.currency)}</p>

          <BuyBox slug={product.slug} free={product.price_cents === 0} ownedToken={owned?.token ?? null} />

          {files.length > 0 ? (
            <section className="product__files" aria-labelledby="files-title">
              <h2 id="files-title">
                What you get <span className="muted">· {formatSize(total)}</span>
              </h2>
              <ul className="attach">
                {files.map((f) => (
                  <li key={f.id}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.filename}</span>
                    <span className="muted num">{formatSize(f.size)}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {product.description ? (
            <div className="prose product__description">
              {product.description
                .split(/\n{2,}/)
                .map((para) => para.trim())
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
