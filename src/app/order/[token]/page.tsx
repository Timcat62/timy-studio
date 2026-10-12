import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderRoom } from "@/components/OrderRoom";
import { getAttachments, getMessages, getPublicOrderByToken } from "@/lib/orders";

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
  const order = await getPublicOrderByToken(token);
  if (!order) notFound();

  const [messages, attachments] = await Promise.all([getMessages(order.id), getAttachments(order.id)]);
  return <OrderRoom token={token} initial={{ order, messages, attachments }} justPaid={paid === "1"} />;
}
