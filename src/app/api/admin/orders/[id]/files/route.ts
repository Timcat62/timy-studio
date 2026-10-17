import { isAdmin } from "@/lib/admin-auth";
import { isUuid } from "@/lib/orders";
import { failJson, startOrderFile } from "@/lib/order-files";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** I register a file to send in a project's chat (a delivery, a preview). */
export async function POST(req: Request, { params }: Ctx) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  if (!isUuid(id)) return Response.json({ error: "Not found." }, { status: 404 });
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const result = await startOrderFile(id, "admin", { ...body, chat: true });
  return "error" in result ? failJson(result) : Response.json(result);
}
