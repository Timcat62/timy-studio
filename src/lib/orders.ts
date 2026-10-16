import { currentUser } from "./auth";
import { BUCKET, db } from "./supabase";
import type { AdminOrder, AdminOrderState, Attachment, Message, PublicOrder, Sender } from "./types";

export const PUBLIC_COLUMNS =
  "id,name,project_type,budget,description,deadline,links,status,quote_amount,quote_currency,quote_note,paid_at,created_at";

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

export async function getMessages(orderId: string): Promise<Message[]> {
  const { data } = await db()
    .from("messages")
    .select("id,sender,body,created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true })
    .limit(500);
  return (data as Message[] | null) ?? [];
}

/** The files of a project, each with a download link valid for one hour. Call only after checking access. */
export async function getAttachments(orderId: string): Promise<Attachment[]> {
  const { data: rows } = await db()
    .from("attachments")
    .select("id,filename,size,content_type,path")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  return Promise.all(
    (rows ?? []).map(async (r) => {
      const { data } = await db().storage.from(BUCKET).createSignedUrl(r.path, 3600, { download: r.filename });
      return { id: r.id, filename: r.filename, size: r.size, content_type: r.content_type, url: data?.signedUrl };
    }),
  );
}

export async function addMessage(orderId: string, sender: Sender, body: string) {
  const { error } = await db().from("messages").insert({ order_id: orderId, sender, body });
  if (error) throw new Error(error.message);
}

const ADMIN_COLUMNS =
  "id,token,name,email,project_type,budget,description,deadline,links,status,quote_amount,quote_currency,quote_note,paid_at,created_at,stripe_session_id";

/** Full order for the admin: includes the client's email and signed download links for their files. */
export async function loadAdminState(id: string): Promise<AdminOrderState | null> {
  if (!isUuid(id)) return null;
  const { data: order } = await db().from("orders").select(ADMIN_COLUMNS).eq("id", id).maybeSingle();
  if (!order) return null;
  const [messages, attachments] = await Promise.all([getMessages(id), getAttachments(id)]);
  return { order: order as AdminOrder, messages, attachments };
}
