import { isAdmin } from "@/lib/admin-auth";
import { isUuid } from "@/lib/orders";
import { orderFileResponse } from "@/lib/order-files";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string; fileId: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return new Response("Unauthorized.", { status: 401 });
  const { id, fileId } = await params;
  if (!isUuid(id) || !isUuid(fileId)) return new Response("Not found.", { status: 404 });
  return orderFileResponse(id, fileId);
}
