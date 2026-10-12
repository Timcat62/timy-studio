import { NextResponse } from "next/server";
import { createAdminSession, passwordMatches } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { password?: string } | null;
  if (!body?.password || !passwordMatches(body.password)) {
    await new Promise((r) => setTimeout(r, 700)); // slow down guessing
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  await createAdminSession();
  return NextResponse.json({ ok: true });
}
