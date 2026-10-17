import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

/** Tabs at the top of the admin pages. */
export function AdminNav({ current }: { current: "orders" | "shop" }) {
  return (
    <div className="page-head admin-bar">
      <nav className="admin-tabs" aria-label="Admin">
        <Link href="/admin" aria-current={current === "orders" ? "page" : undefined}>
          Orders
        </Link>
        <Link href="/admin/shop" aria-current={current === "shop" ? "page" : undefined}>
          Shop
        </Link>
      </nav>
      <LogoutButton />
    </div>
  );
}
