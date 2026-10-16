import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { authClient, claimOrders, safeNext } from "@/lib/auth";
import { siteUrl } from "@/lib/format";

export const runtime = "nodejs";

const TYPES: EmailOtpType[] = ["signup", "email", "recovery", "email_change", "invite", "magiclink"];

/** Links in the account emails (confirm address, reset password) land here. Works on any device. */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const base = siteUrl();
  const next = safeNext(params.get("next"), type === "recovery" ? "/account/password" : "/account");
  if (tokenHash && type && TYPES.includes(type)) {
    const { data, error } = await (await authClient()).auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error && data.user) {
      await claimOrders(data.user);
      return NextResponse.redirect(`${base}${next}`);
    }
  }
  return NextResponse.redirect(`${base}/login?error=link`);
}
