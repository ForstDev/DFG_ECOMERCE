/**
 * Catalog state lives in the URL, not in React state. That keeps every filtered
 * view shareable, the back button correct, and the page renderable on the server.
 */
export type CatalogParams = {
  q?: string;
  familia?: string;
  subfamilia?: string;
  marca?: string;
  conFoto?: string;
  orden?: string;
  pagina?: string;
};

export function buildCatalogHref(
  current: CatalogParams,
  patch: Partial<CatalogParams>,
): string {
  const next: CatalogParams = { ...current, ...patch };

  // Any change other than paging sends the user back to page one.
  if (!("pagina" in patch)) delete next.pagina;

  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(next)) {
    if (!value) continue;
    if (key === "pagina" && value === "1") continue;
    sp.set(key, String(value));
  }

  const qs = sp.toString();
  return qs ? `/catalogo?${qs}` : "/catalogo";
}

/** Reads a searchParams value that Next may hand over as string or string[]. */
export function one(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v || undefined;
}
