import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { budgets, maxFileSizeMB, maxFiles, projectTypes } from "@/lib/config";
import { safeFilename } from "@/lib/format";
import { adminEmail, adminOrderLink, notifyDiscord, orderLink, sendEmail } from "@/lib/notify";
import { addMessage } from "@/lib/orders";
import { BUCKET, db } from "@/lib/supabase";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(200),
  projectType: z.enum(projectTypes as [string, ...string[]]),
  budget: z.enum(budgets as [string, ...string[]]),
  description: z.string().trim().min(20).max(6000),
  deadline: z.string().trim().max(200).optional().default(""),
  links: z.string().trim().max(2000).optional().default(""),
  consent: z.literal(true),
  website: z.string().max(0).optional().default(""), // honeypot, must stay empty
  elapsedMs: z.number().min(0).optional().default(0),
  files: z
    .array(
      z.object({
        name: z.string().min(1).max(255),
        size: z.number().int().min(0).max(maxFileSizeMB * 1024 * 1024),
        type: z.string().max(200).optional().default(""),
      }),
    )
    .max(maxFiles)
    .default([]),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const field = first?.path?.[0];
    return NextResponse.json(
      { error: field ? `Please check the "${String(field)}" field.` : "Please check the form and try again." },
      { status: 400 },
    );
  }
  const data = parsed.data;

  // Cheap spam guard: bots fill the honeypot or submit instantly.
  if (data.elapsedMs < 2500) {
    return NextResponse.json({ error: "That was fast. Please take a moment and send it again." }, { status: 429 });
  }

  const supabase = db();

  // Throttle: max 3 briefs per email per hour, 40 briefs per hour overall.
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const [{ count: byEmail }, { count: overall }] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("email", data.email).gte("created_at", since),
    supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", since),
  ]);
  if ((byEmail ?? 0) >= 3 || (overall ?? 0) >= 40) {
    return NextResponse.json({ error: "Too many briefs in a short time. Please try again later." }, { status: 429 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      name: data.name,
      email: data.email,
      project_type: data.projectType,
      budget: data.budget,
      description: data.description,
      deadline: data.deadline || null,
      links: data.links || null,
    })
    .select("id,token")
    .single();
  if (error || !order) {
    console.error("Order insert failed", error);
    return NextResponse.json({ error: "Could not save your brief. Please try again." }, { status: 500 });
  }

  // Signed upload URLs so files go straight to storage (no size limit from the web server).
  const uploads: { index: number; path: string; token: string }[] = [];
  for (const [index, file] of data.files.entries()) {
    const path = `${order.id}/${randomUUID()}-${safeFilename(file.name)}`;
    const { data: signed, error: signErr } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
    if (signErr || !signed) {
      console.error("Signed upload failed", signErr);
      continue;
    }
    uploads.push({ index, path, token: signed.token });
    await supabase.from("attachments").insert({
      order_id: order.id,
      path,
      filename: file.name,
      size: file.size,
      content_type: file.type || null,
    });
  }

  await addMessage(
    order.id,
    "system",
    "Brief received. I'll read it and reply here, usually within a day or two. Nothing to pay at this stage.",
  );

  const adminText =
    `New brief from ${data.name} (${data.email})\n` +
    `${data.projectType} | budget: ${data.budget}${data.deadline ? ` | deadline: ${data.deadline}` : ""}\n` +
    `${data.description.slice(0, 500)}${data.description.length > 500 ? "..." : ""}\n` +
    `${data.files.length} file(s)\n${adminOrderLink(order.id)}`;
  await Promise.all([
    notifyDiscord(adminText),
    sendEmail(adminEmail(), `New brief: ${data.name}`, adminText, data.email),
    sendEmail(
      data.email,
      "Your brief to timy. is in",
      `Hi ${data.name},\n\nThanks for your brief. This is your private page for the project, where we'll talk and, once we agree on a price, where you can pay:\n\n${orderLink(order.token)}\n\nKeep this link: anyone who has it can see the conversation.\n\ntimy.`,
    ),
  ]);

  return NextResponse.json({ token: order.token, uploads });
}
