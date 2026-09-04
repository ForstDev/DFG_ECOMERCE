import { NextResponse } from "next/server";
import { appendEvent } from "@/lib/store";
import type { TrackEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

const KINDS = new Set(["search", "view", "cart_add", "quote", "filter"]);

/**
 * Collects the behaviour the admin dashboard reports on: what people search,
 * what they open, what they put in a quote and what they filter by.
 *
 * Nothing identifying is stored. There is no cookie, no IP and no session id,
 * only the event and a timestamp, which is all the KPI panel needs.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TrackEvent;

    if (!body || typeof body !== "object" || !KINDS.has(body.type)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Trim free text so a pasted paragraph cannot bloat the log.
    if (body.type === "search") {
      const term = String(body.term ?? "").trim().slice(0, 80);
      if (!term) return NextResponse.json({ ok: true });
      appendEvent({ type: "search", term, results: Number(body.results) || 0 });
    } else {
      appendEvent(body);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
