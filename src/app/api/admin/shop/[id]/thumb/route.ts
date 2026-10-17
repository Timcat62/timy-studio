import sharp from "sharp";
import { isAdmin } from "@/lib/admin-auth";
import { removeStored, writeWhole } from "@/lib/disk";
import { getProduct } from "@/lib/shop";
import { db } from "@/lib/supabase";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** Sets a product's cover: cropped to 4:3 at 1600 px wide, saved as WebP on the disk. */
export async function POST(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const product = await getProduct({ id });
  if (!product) return Response.json({ error: "Not found." }, { status: 404 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Choose an image." }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return Response.json({ error: "The image is over 8 MB." }, { status: 400 });

  let image: Buffer;
  try {
    image = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 80_000_000 })
      .rotate()
      .resize(1600, 1200, { fit: "cover" })
      .webp({ quality: 84 })
      .toBuffer();
  } catch {
    return Response.json({ error: "This file isn't an image I can read." }, { status: 400 });
  }

  const path = `${id}/thumb-${Date.now()}.webp`;
  await writeWhole("shop", path, image);
  await db().from("products").update({ thumb_path: path, updated_at: new Date().toISOString() }).eq("id", id);
  if (product.thumb_path) await removeStored("shop", product.thumb_path);
  return Response.json({ ok: true });
}
