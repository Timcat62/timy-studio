import { getOrderForViewer, isUuid } from "@/lib/orders";
import { orderFileResponse } from "@/lib/order-files";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ token: string; fileId: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { token, fileId } = await params;
  if (!isUuid(fileId)) return new Response("Not found.", { status: 404 });
  const access = await getOrderForViewer(token);
  if (access.status !== "ok") return new Response("Not found.", { status: 404 });
  return orderFileResponse(access.order.id, fileId);
}
