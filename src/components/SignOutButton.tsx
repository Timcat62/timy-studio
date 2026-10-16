"use client";

import { useRouter } from "next/navigation";
import { browserAuth } from "@/lib/supabase-browser";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      className="btn btn--ghost btn--small"
      onClick={async () => {
        await browserAuth()?.auth.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
