import { isAdmin } from "@/lib/admin-auth";
import { fileResponse } from "@/lib/disk";
import { getProduct } from "@/lib/shop";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** Cover or preview image of a product, read from the disk. Drafts only show for me. */
export async function GET(req: Request, { params }: Ctx) {
  const { id } = await params;
  const product = await getProduct({ id });
  // ?img=2 is the third preview image; without it, the cover
  const img = new URL(req.url).searchParams.get("img");
  const path = img === null ? product?.thumb_path : product?.images?.[Number(img)];
  if (!product || !path || (!product.published && !(await isAdmin()))) {
    return new Response("Not found.", { status: 404 });
  }
  return fileResponse("shop", path, {
    inline: true,
    contentType: "image/webp",
    cache: product.published ? "public, max-age=86400" : "private, no-store",
  });
}
