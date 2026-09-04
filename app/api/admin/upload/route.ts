import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_BYTES = 6 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

/**
 * Accepts a product photo and stores it under public/uploads, returning the
 * public path so the editor can add it to the product image list. The extension
 * comes from the sniffed MIME type, never from the uploaded filename, and the
 * stored name is a random hex string, so nothing the client sends reaches the
 * filesystem as a path.
 */
export async function POST(request: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "No llego ningun archivo" }, { status: 400 });
  }

  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: "Formato no admitido. Usa JPG, PNG, WEBP o AVIF." },
      { status: 415 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "El archivo supera los 6 MB" },
      { status: 413 },
    );
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });

  const name = crypto.randomBytes(16).toString("hex") + ext;
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ ok: true, url: "/uploads/" + name });
}
