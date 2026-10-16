import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PasswordForm } from "@/components/PasswordForm";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New password", robots: { index: false, follow: false } };

export default async function NewPassword() {
  if (!(await currentUser())) redirect("/login?next=/account/password");
  return (
    <div className="wrap page-head" style={{ paddingBottom: "6rem" }}>
      <div className="auth stack">
        <h1 className="display auth__title">Choose a new password</h1>
        <PasswordForm />
      </div>
    </div>
  );
}
