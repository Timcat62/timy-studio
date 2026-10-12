import { BUCKET, db } from "./supabase";
import type { AdminOrder, AdminOrderState, Attachment, Message, PublicOrder, Sender } from "./types";

export const PUBLIC_COLUMNS =
  "id,name,project_type,budget,description,deadline,links,status,quote_amount,quote_currency,quote_note,paid_at,created_at";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: string) => UUID.test(v);

export async function getPublicOrderByToken(token: string): Promise<PublicOrder | null> {
  if (!isUuid(token)) return null;
  const { data } = await db().from("orders").select(PUBLIC_COLUMNS).eq("token", token).maybeSingle();
  return (data as PublicOrder | null) ?? null;
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

export async function getAttachments(orderId: string): Promise<Attachment[]> {
  const { data } = await db()
    .from("attachments")
    .select("id,filename,size,content_type")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  return (data as Attachment[] | null) ?? [];
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

  const { data: rows } = await db()
    .from("attachments")
    .select("id,filename,size,content_type,path")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  const attachments: Attachment[] = await Promise.all(
    (rows ?? []).map(async (r) => {
      const { data } = await db().storage.from(BUCKET).createSignedUrl(r.path, 3600, { download: r.filename });
      return { id: r.id, filename: r.filename, size: r.size, content_type: r.content_type, url: data?.signedUrl };
    }),
  );

  return { order: order as AdminOrder, messages: await getMessages(id), attachments };
}
