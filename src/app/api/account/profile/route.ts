import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/supabase";

export const runtime = "nodejs";

const schema = z.object({ name: z.string().trim().min(1).max(80) });

/** Changes the display name of the signed-in account. */
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a name (80 characters max)." }, { status: 400 });

  const { error } = await db().auth.admin.updateUserById(user.id, {
    user_metadata: { profile_name: parsed.data.name },
  });
  if (error) return NextResponse.json({ error: "Could not save your name." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
