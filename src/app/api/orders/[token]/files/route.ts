import { getOrderForViewer } from "@/lib/orders";
import { failJson, startOrderFile } from "@/lib/order-files";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ token: string }> };

/** The client registers a file (from the brief form, or the chat with `chat: true`) before sending its chunks. */
export async function POST(req: Request, { params }: Ctx) {
  const { token } = await params;
  const access = await getOrderForViewer(token);
  if (access.status !== "ok") return Response.json({ error: "Not found." }, { status: 404 });
  const result = await startOrderFile(access.order.id, "client", await req.json().catch(() => null));
  return "error" in result ? failJson(result) : Response.json(result);
}
