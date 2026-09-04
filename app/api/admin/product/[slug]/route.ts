import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { clearOverride, saveOverride } from "@/lib/store";
import { getProduct } from "@/lib/catalog";

export const dynamic = "force-dynamic";

function clean(v: unknown, max: number): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim().slice(0, max);
  return s.length ? s : undefined;
}

/** Saves the admin edits for one product. Only three fields are writable. */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { slug } = await params;
  if (!getProduct(slug)) {
    return NextResponse.json({ ok: false, error: "Repuesto inexistente" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    application?: string;
    images?: unknown;
  };

  const images = Array.isArray(body.images)
    ? body.images
        .map((i) => (typeof i === "string" ? i.trim() : ""))
        .filter((i) => i.length > 0 && (i.startsWith("http") || i.startsWith("/")))
        .slice(0, 8)
    : undefined;

  const saved = saveOverride(slug, {
    name: clean(body.name, 160)?.toUpperCase(),
    application: clean(body.application, 240),
    images,
  });

  // The catalog, the detail page and the home page all read this record.
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, override: saved });
}

/** Drops the override so the excel values show through again. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { slug } = await params;
  clearOverride(slug);
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true });
}
