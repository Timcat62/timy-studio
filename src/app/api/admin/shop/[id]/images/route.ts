import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { removeStored, writeWhole } from "@/lib/disk";
import { MAX_GALLERY_IMAGES, getProduct } from "@/lib/shop";
import { db } from "@/lib/supabase";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const saved = async (id: string, images: string[]) => {
  await db().from("products").update({ images, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/shop");
};

/** Adds a preview image after the cover: up to 2400 px wide, any ratio, saved as WebP on the disk. */
export async function POST(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const product = await getProduct({ id });
  if (!product) return Response.json({ error: "Not found." }, { status: 404 });
  if (product.images.length >= MAX_GALLERY_IMAGES) {
    return Response.json({ error: `Up to ${MAX_GALLERY_IMAGES} images.` }, { status: 400 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Choose an image." }, { status: 400 });
  if (file.size > 15 * 1024 * 1024) return Response.json({ error: "The image is over 15 MB." }, { status: 400 });

  let image: Buffer;
  try {
    image = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 120_000_000 })
      .rotate()
      .resize(2400, 2400, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer();
  } catch {
    return Response.json({ error: "This file isn't an image I can read." }, { status: 400 });
  }

  const path = `${id}/gallery-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.webp`;
  await writeWhole("shop", path, image);
  // read again: another upload may have finished meanwhile
  const fresh = await getProduct({ id });
  await saved(id, [...(fresh?.images ?? product.images), path]);
  return Response.json({ ok: true });
}

/** New order of the images, or a smaller list to remove some: only paths the product already has are accepted. */
export async function PUT(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const product = await getProduct({ id });
  if (!product) return Response.json({ error: "Not found." }, { status: 404 });
  const parsed = z.object({ images: z.array(z.string()).max(MAX_GALLERY_IMAGES) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid input." }, { status: 400 });

  const next = [...new Set(parsed.data.images)].filter((p) => product.images.includes(p));
  await saved(id, next);
  for (const p of product.images) if (!next.includes(p)) await removeStored("shop", p);
  return Response.json({ ok: true });
}
