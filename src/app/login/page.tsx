import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { currentUser, safeNext } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const target = safeNext(next);
  if (await currentUser()) redirect(target);

  return (
    <div className="wrap page-head" style={{ paddingBottom: "6rem" }}>
      <AuthForm
        next={target}
        initialError={error === "link" ? "That link has expired or was already used. Try again below." : undefined}
      />
    </div>
  );
}
