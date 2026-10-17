import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAdmin } from "@/lib/admin-auth";
import { removeFolder } from "@/lib/disk";
import { isUuid } from "@/lib/orders";
import { slugify } from "@/lib/shop";
import { db } from "@/lib/supabase";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** Words already used by shop routes, so they can't be product addresses. */
const RESERVED = new Set(["success", "download", "thumb", "new"]);

const schema = z.object({
  title: z.string().trim().min(1).max(120),
  slug: z.string().trim().max(60).optional().default(""),
  summary: z.string().trim().max(240).optional().default(""),
  description: z.string().trim().max(10000).optional().default(""),
  price: z.number().min(0).max(10000),
  published: z.boolean(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  if (!isUuid(id)) return Response.json({ error: "Not found." }, { status: 404 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Check the fields." }, { status: 400 });
  const input = parsed.data;

  const cents = Math.round(input.price * 100);
  if (cents > 0 && cents < 50) return Response.json({ error: "A paid product costs at least 0.50 EUR (Stripe minimum)." }, { status: 400 });
  const slug = slugify(input.slug || input.title);
  if (RESERVED.has(slug)) return Response.json({ error: `"${slug}" can't be used as an address.` }, { status: 400 });

  const { data: taken } = await db().from("products").select("id").eq("slug", slug).neq("id", id).maybeSingle();
  if (taken) return Response.json({ error: "Another product already uses this address." }, { status: 400 });

  if (input.published) {
    const { count } = await db()
      .from("product_files")
      .select("id", { count: "exact", head: true })
      .eq("product_id", id)
      .eq("complete", true);
    if (!count) return Response.json({ error: "Add at least one file before publishing." }, { status: 400 });
  }

  const { error } = await db()
    .from("products")
    .update({
      title: input.title,
      slug,
      summary: input.summary,
      description: input.description,
      price_cents: cents,
      published: input.published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return Response.json({ error: "Could not save." }, { status: 500 });
  revalidatePath("/shop");
  return Response.json({ ok: true, slug });
}

/** Deletes a product and its folder on the disk. Buyers keep their purchase record, but the files are gone. */
export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  if (!isUuid(id)) return Response.json({ error: "Not found." }, { status: 404 });
  await db().from("products").delete().eq("id", id);
  await removeFolder("shop", id);
  revalidatePath("/shop");
  return Response.json({ ok: true });
}
