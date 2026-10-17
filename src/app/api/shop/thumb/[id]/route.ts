import { isAdmin } from "@/lib/admin-auth";
import { fileResponse } from "@/lib/disk";
import { getProduct } from "@/lib/shop";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** Cover image of a product, read from the disk. Drafts only show for me. */
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const product = await getProduct({ id });
  if (!product?.thumb_path || (!product.published && !(await isAdmin()))) {
    return new Response("Not found.", { status: 404 });
  }
  return fileResponse("shop", product.thumb_path, {
    inline: true,
    contentType: "image/webp",
    cache: product.published ? "public, max-age=86400" : "private, no-store",
  });
}
