import { NextResponse } from "next/server";
import { authClient, claimOrders, safeNext } from "@/lib/auth";
import { siteUrl } from "@/lib/format";

export const runtime = "nodejs";

/** Google sends people back here with a one-time code, swapped for a session cookie. */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const code = params.get("code");
  const next = safeNext(params.get("next"));
  const base = siteUrl();
  if (code) {
    const { data, error } = await (await authClient()).auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      await claimOrders(data.user);
      return NextResponse.redirect(`${base}${next}`);
    }
  }
  return NextResponse.redirect(`${base}/login?error=link`);
}
