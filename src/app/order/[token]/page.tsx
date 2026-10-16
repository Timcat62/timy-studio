import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { OrderRoom } from "@/components/OrderRoom";
import { currentUser } from "@/lib/auth";
import { getAttachments, getMessages, getOrderForViewer } from "@/lib/orders";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your project",
  robots: { index: false, follow: false },
};

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const { token } = await params;
  const { paid } = await searchParams;
  const access = await getOrderForViewer(token);
  if (access.status === "login") redirect(`/login?next=${encodeURIComponent(`/order/${token}`)}`);
  if (access.status !== "ok") notFound();
  const { order } = access;

  const [messages, attachments, user] = await Promise.all([
    getMessages(order.id),
    getAttachments(order.id),
    currentUser(),
  ]);
  return (
    <OrderRoom
      token={token}
      initial={{ order, messages, attachments }}
      justPaid={paid === "1"}
      signedIn={Boolean(user)}
    />
  );
}
