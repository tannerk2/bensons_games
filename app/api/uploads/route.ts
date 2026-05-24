import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { storage } from "@/lib/storage";
import type {
  SupportedExtension,
  SupportedImageType,
} from "@/lib/storage/types";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const TYPE_TO_EXT: Record<SupportedImageType, SupportedExtension> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const isSupported = (t: string): t is SupportedImageType =>
  t === "image/png" || t === "image/jpeg" || t === "image/webp";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  const userId = session.user.id;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_BYTES / 1024 / 1024} MB)` },
      { status: 400 }
    );
  }
  const contentType = file.type;
  if (!isSupported(contentType)) {
    return NextResponse.json(
      { error: "Unsupported image type" },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await storage.saveFile({
      userId,
      buffer,
      contentType,
      extension: TYPE_TO_EXT[contentType],
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Upload failed", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
