import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Icon } from "@/components/Icon";
import { formatDate, formatSize } from "@/lib/format";
import { getProduct, getProductFiles, getPurchaseForViewer, thumbUrl } from "@/lib/shop";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your download", robots: { index: false, follow: false } };

export default async function Download({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const access = await getPurchaseForViewer(token);
  if (access.status === "login") redirect(`/login?next=${encodeURIComponent(`/shop/download/${token}`)}`);
  if (access.status !== "ok" || !access.purchase.product_id) notFound();
  const product = await getProduct({ id: access.purchase.product_id });
  if (!product) notFound();
  const files = await getProductFiles(product.id, { completeOnly: true });
  const thumb = thumbUrl(product);

  return (
    <div className="wrap" style={{ paddingBottom: "6rem" }}>
      <div className="page-head download-head">
        {thumb ? <img className="download-head__thumb" src={thumb} alt="" /> : null}
        <div>
          <h1 className="display" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
            {product.title}
          </h1>
          <p className="muted" suppressHydrationWarning>
            Yours since {formatDate(access.purchase.created_at)}. Thank you!
          </p>
        </div>
      </div>
      {files.length === 0 ? (
        <p className="notice">The files are being updated. Come back in a moment or write to me.</p>
      ) : (
        <ul className="download-list">
          {files.map((f) => (
            <li key={f.id}>
              <a className="download-item" href={`/api/shop/download/${token}/${f.id}`}>
                <Icon name="arrow-down" />
                <span className="download-item__name">{f.filename}</span>
                <span className="muted num">{formatSize(f.size)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <p className="hint" style={{ marginTop: "1.5rem" }}>
        Keep this page: you can come back and download the files again at any time.{" "}
        <Link href="/account" className="link-inline">
          Your account
        </Link>{" "}
        lists everything you got.
      </p>
    </div>
  );
}
