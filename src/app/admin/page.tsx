import type { Metadata } from "next";
import Link from "next/link";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminNav } from "@/components/AdminNav";
import { isAdmin } from "@/lib/admin-auth";
import { formatDate, formatMoney } from "@/lib/format";
import { db } from "@/lib/supabase";
import { statusLabels, type OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

interface Row {
  id: string;
  name: string;
  project_type: string;
  budget: string;
  status: OrderStatus;
  created_at: string;
  quote_amount: number | null;
  quote_currency: string;
  last_client_message_at: string | null;
  admin_seen_at: string | null;
}

export default async function Admin() {
  if (!(await isAdmin())) {
    return (
      <div className="wrap page-head" style={{ paddingBottom: "6rem" }}>
        <h1 className="display" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", marginBottom: "2rem" }}>
          Admin
        </h1>
        <AdminLogin />
      </div>
    );
  }

  const { data } = await db()
    .from("orders")
    .select("id,name,project_type,budget,status,created_at,quote_amount,quote_currency,last_client_message_at,admin_seen_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data as Row[] | null) ?? [];

  return (
    <div className="wrap" style={{ paddingBottom: "6rem" }}>
      <AdminNav current="orders" />
      {rows.length === 0 ? (
        <p className="notice">No briefs yet. They'll show up here as soon as someone sends one.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Project</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Price</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const unread =
                  r.last_client_message_at && (!r.admin_seen_at || r.last_client_message_at > r.admin_seen_at);
                return (
                  <tr key={r.id}>
                    <td>
                      {unread ? <span className="dot-unread" title="New message" /> : null}
                      <Link href={`/admin/orders/${r.id}`}>{r.name}</Link>
                    </td>
                    <td>{r.project_type}</td>
                    <td>{r.budget}</td>
                    <td>
                      <span className={`badge badge--${r.status}`}>{statusLabels[r.status]}</span>
                    </td>
                    <td className="num">{r.quote_amount ? formatMoney(r.quote_amount, r.quote_currency) : "—"}</td>
                    <td className="num" suppressHydrationWarning>
                      {formatDate(r.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
