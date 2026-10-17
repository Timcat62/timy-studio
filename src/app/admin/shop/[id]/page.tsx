import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { ProductEditor } from "@/components/ProductEditor";
import { isAdmin } from "@/lib/admin-auth";
import { getProduct, getProductFiles, thumbUrl } from "@/lib/shop";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit product", robots: { index: false, follow: false } };

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin");
  const { id } = await params;
  const product = await getProduct({ id });
  if (!product) notFound();
  const files = await getProductFiles(id, { completeOnly: false });

  return (
    <div className="wrap" style={{ paddingBottom: "6rem" }}>
      <AdminNav current="shop" />
      <p style={{ marginBottom: "1.5rem" }}>
        <Link className="link-inline" href="/admin/shop">
          All products
        </Link>
      </p>
      <ProductEditor product={product} files={files} thumb={thumbUrl(product)} />
    </div>
  );
}
