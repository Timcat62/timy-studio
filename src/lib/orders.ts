import { currentUser } from "./auth";
import { db } from "./supabase";
import type { AdminOrder, AdminOrderState, Attachment, Message, PublicOrder, Sender } from "./types";

export const PUBLIC_COLUMNS =
  "id,name,project_type,budget,description,deadline,links,status,quote_amount,quote_currency,quote_note,quote_breakdown,paid_at,created_at";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: string) => UUID.test(v);

export type OrderAccess =
  | { status: "ok"; order: PublicOrder }
  | { status: "login" } // the project belongs to an account: sign in first
  | { status: "missing" };

/**
 * Who may open a project page. A project sent without an account opens with its private link alone.
 * Once it belongs to an account (sent while signed in, or claimed by the confirmed owner of its email),
 * only that account can open it, so a forwarded or leaked link is useless.
 */
export async function getOrderForViewer(token: string): Promise<OrderAccess> {
  if (!isUuid(token)) return { status: "missing" };
  const { data } = await db()
    .from("orders")
    .select(`${PUBLIC_COLUMNS},user_id`)
    .eq("token", token)
    .maybeSingle();
  if (!data) return { status: "missing" };
  const { user_id: owner, ...order } = data as PublicOrder & { user_id: string | null };
  if (!owner) return { status: "ok", order };
  const user = await currentUser();
  if (!user) return { status: "login" };
  return user.id === owner ? { status: "ok", order } : { status: "missing" };
}

/** Messages of a project. Files sent in the chat are attached from `attachments` (see getAttachments). */
export async function getMessages(orderId: string, attachments: Attachment[] = []): Promise<Message[]> {
  const { data } = await db()
    .from("messages")
    .select("id,sender,body,created_at,attachment_id")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true })
    .limit(500);
  const byId = new Map(attachments.map((a) => [a.id, a]));
  return ((data ?? []) as (Message & { attachment_id: string | null })[]).map(({ attachment_id, ...m }) => ({
    ...m,
    attachment: attachment_id ? (byId.get(attachment_id) ?? null) : null,
  }));
}

/**
 * The finished files of a project. `urlBase` is the download route for this viewer
 * (/api/orders/<token>/files for the client, /api/admin/orders/<id>/files for me): it checks access again.
 */
export async function getAttachments(orderId: string, urlBase: string): Promise<Attachment[]> {
  const { data } = await db()
    .from("attachments")
    .select("id,filename,size,content_type,sender")
    .eq("order_id", orderId)
    .eq("complete", true)
    .order("created_at", { ascending: true });
  return ((data ?? []) as Attachment[]).map((a) => ({ ...a, url: `${urlBase}/${a.id}` }));
}

/** Everything the client's project page shows. Call only after getOrderForViewer said ok. */
export async function loadClientState(order: PublicOrder, token: string) {
  const attachments = await getAttachments(order.id, `/api/orders/${token}/files`);
  return { order, attachments, messages: await getMessages(order.id, attachments) };
}

export async function addMessage(orderId: string, sender: Sender, body: string) {
  const { error } = await db().from("messages").insert({ order_id: orderId, sender, body });
  if (error) throw new Error(error.message);
}

const ADMIN_COLUMNS =
  "id,token,name,email,project_type,budget,description,deadline,links,status,quote_amount,quote_currency,quote_note,quote_breakdown,paid_at,created_at,stripe_session_id";

/** Full order for the admin: includes the client's email and the files. */
export async function loadAdminState(id: string): Promise<AdminOrderState | null> {
  if (!isUuid(id)) return null;
  const { data: order } = await db().from("orders").select(ADMIN_COLUMNS).eq("id", id).maybeSingle();
  if (!order) return null;
  const attachments = await getAttachments(id, `/api/admin/orders/${id}/files`);
  return { order: order as AdminOrder, messages: await getMessages(id, attachments), attachments };
}
