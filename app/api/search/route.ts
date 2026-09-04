import { NextResponse } from "next/server";
import { search } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/**
 * Typeahead for the header search. Returns a short, thin payload so the
 * suggestion list can render without shipping the whole catalog to the client.
 */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ items: [], total: 0 });
  }

  const result = search({ q, perPage: 8, page: 1, sort: "relevance" });

  return NextResponse.json({
    total: result.total,
    items: result.items.map((p) => ({
      slug: p.slug,
      code: p.code,
      name: p.name,
      family: p.family,
      brandLabel: p.brandLabel,
      image: p.images[0] ?? "",
    })),
  });
}
