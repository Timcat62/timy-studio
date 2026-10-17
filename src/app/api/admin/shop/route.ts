import { randomBytes } from "node:crypto";
import { isAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/supabase";

export const runtime = "nodejs";

/** Creates an empty draft product, then I fill it in on its edit page. */
export async function POST() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { data, error } = await db()
    .from("products")
    .insert({ title: "New product", slug: `draft-${randomBytes(4).toString("hex")}` })
    .select("id")
    .single();
  if (error || !data) return Response.json({ error: "Could not create the product." }, { status: 500 });
  return Response.json({ id: data.id });
}
