import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminOrder } from "@/components/AdminOrder";
import { isAdmin } from "@/lib/admin-auth";
import { loadAdminState } from "@/lib/orders";
import { db } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order", robots: { index: false, follow: false } };

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin");
  const { id } = await params;
  const state = await loadAdminState(id);
  if (!state) notFound();
  await db().from("orders").update({ admin_seen_at: new Date().toISOString() }).eq("id", id);

  return (
    <div className="wrap">
      <div className="page-head" style={{ paddingBottom: "1.5rem" }}>
        <p>
          <Link className="link-inline" href="/admin">
            All orders
          </Link>
        </p>
        <h1 className="display" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", marginTop: "1rem" }}>
          {state.order.project_type} for {state.order.name}
        </h1>
      </div>
      <AdminOrder id={id} initial={state} />
    </div>
  );
}
