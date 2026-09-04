import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { clearEvents } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function DELETE() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  clearEvents();
  revalidatePath("/admin");
  return NextResponse.json({ ok: true });
}
