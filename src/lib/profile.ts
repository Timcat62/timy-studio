import type { User } from "@supabase/supabase-js";

export const AVATAR_BUCKET = "avatars";

export interface Profile {
  name: string;
  avatar: string | null;
  email: string;
}

/**
 * Name and photo of an account. What the client sets on /account is stored under `profile_name` and
 * `profile_avatar`, because Supabase rewrites `name`, `full_name` and `avatar_url` from Google at every
 * Google sign-in. Google accounts start with their Google name and picture. `profile_avatar: "none"` hides it.
 */
export function profileOf(user: User): Profile {
  const m = user.user_metadata ?? {};
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const chosen = str(m.profile_avatar);
  return {
    name: str(m.profile_name) || str(m.name) || str(m.full_name),
    avatar: chosen === "none" ? null : chosen || str(m.avatar_url) || str(m.picture) || null,
    email: user.email ?? "",
  };
}
