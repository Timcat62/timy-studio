import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { db } from "./supabase";

/**
 * Client accounts run on Supabase Auth (email + password, or Google). The session lives in httpOnly-capable
 * cookies set by @supabase/ssr. Orders are still only read with the service-role client (see supabase.ts):
 * this file just tells the server who is signed in.
 */
export async function authClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase is not configured.");
  const jar = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {
          // called from a server component, where cookies are read-only: the proxy refreshes them instead
        }
      },
    },
  });
}

/** The signed-in client, checked against Supabase (never trusted from the cookie alone), or null. */
export async function currentUser(): Promise<User | null> {
  try {
    const { data } = await (await authClient()).auth.getUser();
    return data.user ?? null;
  } catch {
    return null;
  }
}

const escapeLike = (v: string) => v.replace(/[\\%_]/g, (c) => `\\${c}`);

/**
 * Attaches briefs sent before the account existed (same email, no owner yet) to this account.
 * Only for a confirmed email, so nobody can claim someone else's projects by signing up with their address.
 */
export async function claimOrders(user: User) {
  if (!user.email || !user.email_confirmed_at) return;
  await db()
    .from("orders")
    .update({ user_id: user.id })
    .is("user_id", null)
    .ilike("email", escapeLike(user.email));
}

/** Where to send someone after signing in: only paths on this site. */
export function safeNext(next: string | null | undefined, fallback = "/account") {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}
