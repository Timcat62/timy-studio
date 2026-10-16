import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { currentUser } from "@/lib/auth";
import { AVATAR_BUCKET } from "@/lib/profile";
import { db } from "@/lib/supabase";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

/** Our own files in the avatars bucket, so an old photo can be removed when it is replaced. */
function ownPath(url: unknown, userId: string) {
  if (typeof url !== "string") return null;
  const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`;
  const i = url.indexOf(marker);
  if (i < 0) return null;
  const path = decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
  return path.startsWith(`${userId}/`) ? path : null;
}

async function upload(path: string, body: Buffer) {
  const storage = db().storage;
  let { error } = await storage.from(AVATAR_BUCKET).upload(path, body, { contentType: "image/webp", upsert: false });
  if (error && /not found/i.test(error.message)) {
    // first photo ever: create the public bucket, then try again
    await storage.createBucket(AVATAR_BUCKET, {
      public: true,
      fileSizeLimit: "1MB",
      allowedMimeTypes: ["image/webp"],
    });
    ({ error } = await storage.from(AVATAR_BUCKET).upload(path, body, { contentType: "image/webp", upsert: false }));
  }
  return error;
}

/** Sets a new profile photo: cropped to a 256 px square, re-encoded (which strips EXIF data such as GPS). */
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "The image is over 5 MB." }, { status: 400 });
  if (file.type && !TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Use a JPG, PNG or WebP image." }, { status: 400 });
  }

  let image: Buffer;
  try {
    image = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40_000_000 })
      .rotate()
      .resize(256, 256, { fit: "cover" })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "This file isn't an image we can read." }, { status: 400 });
  }

  const path = `${user.id}/${randomUUID()}.webp`;
  const error = await upload(path, image);
  if (error) {
    console.error("Avatar upload failed", error);
    return NextResponse.json({ error: "Could not upload the photo." }, { status: 500 });
  }
  const url = db().storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl;

  const old = ownPath(user.user_metadata?.profile_avatar, user.id);
  await db().auth.admin.updateUserById(user.id, { user_metadata: { profile_avatar: url } });
  if (old) await db().storage.from(AVATAR_BUCKET).remove([old]);
  return NextResponse.json({ url });
}

/** Removes the profile photo. */
export async function DELETE() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const old = ownPath(user.user_metadata?.profile_avatar, user.id);
  await db().auth.admin.updateUserById(user.id, { user_metadata: { profile_avatar: "none" } });
  if (old) await db().storage.from(AVATAR_BUCKET).remove([old]);
  return NextResponse.json({ ok: true });
}
