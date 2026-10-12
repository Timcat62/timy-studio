export type OrderStatus =
  | "new"
  | "discussing"
  | "quoted"
  | "paid"
  | "in_production"
  | "delivered"
  | "cancelled";

export type Sender = "client" | "admin" | "system";

export interface Message {
  id: string;
  sender: Sender;
  body: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  filename: string;
  size: number;
  content_type: string | null;
  url?: string; // signed download URL (admin only)
}

/** What the client is allowed to see about their own order. */
export interface PublicOrder {
  id: string;
  name: string;
  project_type: string;
  budget: string;
  description: string;
  deadline: string | null;
  links: string | null;
  status: OrderStatus;
  quote_amount: number | null;
  quote_currency: string;
  quote_note: string | null;
  paid_at: string | null;
  created_at: string;
}

export const statusLabels: Record<OrderStatus, string> = {
  new: "Brief received",
  discussing: "In discussion",
  quoted: "Price proposed",
  paid: "Paid",
  in_production: "In production",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const statusFlow: OrderStatus[] = ["new", "discussing", "quoted", "paid", "in_production", "delivered"];

export interface AdminOrder extends PublicOrder {
  email: string;
  token: string;
  stripe_session_id: string | null;
}

export interface OrderState {
  order: PublicOrder;
  messages: Message[];
  attachments: Attachment[];
}

export interface AdminOrderState {
  order: AdminOrder;
  messages: Message[];
  attachments: Attachment[];
}
