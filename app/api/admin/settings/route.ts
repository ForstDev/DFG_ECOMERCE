import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { readSettings, saveSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, settings: readSettings() });
}

export async function PUT(request: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  // The phone number reaches wa.me as digits only, so it is normalised here
  // rather than trusting whatever formatting was pasted in.
  const whatsapp = String(body.whatsapp ?? "").replace(/[^0-9]/g, "").slice(0, 15);

  if (whatsapp.length < 8) {
    return NextResponse.json(
      { ok: false, error: "El número debe incluir código de país, mínimo 8 dígitos" },
      { status: 400 },
    );
  }

  const settings = saveSettings({
    whatsapp,
    whatsappLabel: String(body.whatsappLabel ?? "").trim().slice(0, 60) || "Ventas DFG",
    quoteIntro:
      String(body.quoteIntro ?? "").trim().slice(0, 240) ||
      "Hola DFG, quiero cotizar los siguientes repuestos:",
    contactEmail: String(body.contactEmail ?? "").trim().slice(0, 120),
  });

  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, settings });
}
