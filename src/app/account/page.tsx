import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";
import { claimOrders, currentUser } from "@/lib/auth";
import { formatDate, formatMoney } from "@/lib/format";
import { db } from "@/lib/supabase";
import { statusLabels, type OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your account", robots: { index: false, follow: false } };

interface Row {
  token: string;
  project_type: string;
  status: OrderStatus;
  created_at: string;
  quote_amount: number | null;
  quote_currency: string;
}

export default async function Account() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/account");
  await claimOrders(user);

  const { data } = await db()
    .from("orders")
    .select("token,project_type,status,created_at,quote_amount,quote_currency")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = (data as Row[] | null) ?? [];
  const usesPassword = user.app_metadata?.providers?.includes("email") ?? user.app_metadata?.provider === "email";

  return (
    <div className="wrap" style={{ paddingBottom: "6rem" }}>
      <div className="page-head admin-bar">
        <div>
          <h1 className="display" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
            Your projects
          </h1>
          <p className="muted">Signed in as {user.email}</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {usesPassword ? (
            <Link href="/account/password" className="btn btn--ghost btn--small">
              Change password
            </Link>
          ) : null}
          <SignOutButton />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="notice stack">
          <p>No projects yet. Briefs you send while signed in, or with this email, show up here.</p>
          <p>
            <Link href="/start" className="btn btn--primary">
              Start a project
            </Link>
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Price</th>
                <th>Sent</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.token}>
                  <td>
                    <Link href={`/order/${r.token}`}>{r.project_type}</Link>
                  </td>
                  <td>
                    <span className={`badge badge--${r.status}`}>{statusLabels[r.status]}</span>
                  </td>
                  <td className="num">{r.quote_amount ? formatMoney(r.quote_amount, r.quote_currency) : "—"}</td>
                  <td className="num" suppressHydrationWarning>
                    {formatDate(r.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
