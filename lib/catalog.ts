import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Brand, Catalog, Family, Product } from "./types";
import { readOverrides } from "./store";
import { expandTerm, STOPWORDS } from "./synonyms";

const CATALOG_PATH = path.join(process.cwd(), "data", "catalog.json");

/** The excel export never changes at runtime, so it is parsed once per process. */
let base: Catalog | null = null;

function loadBase(): Catalog {
  if (!base) {
    base = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8")) as Catalog;
  }
  return base;
}

/**
 * The catalog the site actually renders: the excel data with the admin panel's
 * edits merged on top. Overrides live in a small JSON file, so re-reading them
 * per request is cheap and keeps the panel saves visible immediately.
 */
export function getCatalog(): Catalog {
  const src = loadBase();
  const overrides = readOverrides();
  if (!Object.keys(overrides).length) return src;

  const products = src.products.map((p) => {
    const o = overrides[p.slug];
    if (!o) return p;
    return {
      ...p,
      name: o.name ?? p.name,
      application: o.application ?? p.application,
      images: o.images ?? p.images,
      edited: true,
    };
  });

  return { ...src, products };
}

export function getProduct(slug: string): Product | undefined {
  return getCatalog().products.find((p) => p.slug === slug);
}

export function getFamilies(): Family[] {
  return getCatalog().families;
}

export function getBrands(): Brand[] {
  return getCatalog().brands;
}

// --- search -----------------------------------------------------------------

/** Strips accents and punctuation so a code and a description both match. */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export type Query = {
  q?: string;
  family?: string;
  subfamily?: string;
  brand?: string;
  withImage?: boolean;
  sort?: "relevance" | "code" | "name";
  page?: number;
  perPage?: number;
};

export type SearchResult = {
  items: Product[];
  total: number;
  page: number;
  pages: number;
  perPage: number;
  facets: {
    families: { name: string; count: number }[];
    subfamilies: { name: string; count: number }[];
    brands: { name: string; count: number }[];
  };
};

/** A search term plus every English word it should also match. */
type Term = { raw: string; forms: string[] };

function toTerms(q: string | undefined): Term[] {
  if (!q) return [];
  const words = normalize(q).split(" ").filter(Boolean);
  const meaningful = words.filter((w) => !STOPWORDS.has(w));
  // If the query was nothing but stopwords, fall back to the raw words so the
  // search still does something rather than returning the whole catalog.
  return (meaningful.length ? meaningful : words).map((raw) => ({
    raw,
    forms: expandTerm(raw),
  }));
}

function scoreOf(p: Product, terms: Term[]): number {
  const code = normalize(p.code);
  const name = normalize(p.name);
  const app = normalize(p.application);
  const fam = normalize(p.family + " " + p.subfamily);
  const brand = normalize(p.brands.join(" "));
  // An OEM number a customer copies off the old part has to find the DFG
  // equivalent, so the cross references are part of the searchable code space.
  const refs = p.crossRefs.length
    ? normalize(p.crossRefs.map((r) => r.brand + " " + r.code).join(" "))
    : "";

  let score = 0;
  for (const term of terms) {
    // A term counts as matched when any of its forms lands: the word typed, or
    // the English equivalent the catalog actually uses.
    let best = 0;
    for (const t of term.forms) {
      let s = 0;

      if (code === t) s += 1000;
      else if (code.startsWith(t)) s += 400;
      else if (code.includes(t)) s += 160;

      if (name.startsWith(t)) s += 90;
      else if (name.includes(t)) s += 55;

      if (refs.includes(t)) s += 120;
      if (brand.includes(t)) s += 30;
      if (fam.includes(t)) s += 22;
      if (app.includes(t)) s += 14;

      // A translated form is worth slightly less than the literal one, so an
      // exact text match still outranks a synonym.
      if (t !== term.raw) s = Math.round(s * 0.9);

      if (s > best) best = s;
    }

    // Every term has to land somewhere, otherwise the product is not a match.
    if (best === 0) return -1;
    score += best;
  }
  // Products with photography rank above the 198 that have none.
  if (p.images.length) score += 8;
  return score;
}

export function search(query: Query): SearchResult {
  const { products } = getCatalog();
  const perPage = query.perPage ?? 24;
  const page = Math.max(1, query.page ?? 1);

  const terms = toTerms(query.q);

  const scored: { p: Product; s: number }[] = [];
  for (const p of products) {
    if (query.family && p.family !== query.family) continue;
    if (query.subfamily && p.subfamily !== query.subfamily) continue;
    if (query.brand && !p.brands.includes(query.brand)) continue;
    if (query.withImage && !p.images.length) continue;
    const s = terms.length ? scoreOf(p, terms) : 0;
    if (s < 0) continue;
    scored.push({ p, s });
  }

  const sort = query.sort ?? (terms.length ? "relevance" : "code");
  if (sort === "relevance" && terms.length) {
    scored.sort((a, b) => b.s - a.s || a.p.code.localeCompare(b.p.code));
  } else if (sort === "name") {
    scored.sort((a, b) => a.p.name.localeCompare(b.p.name));
  } else {
    scored.sort((a, b) =>
      a.p.code.localeCompare(b.p.code, undefined, { numeric: true }),
    );
  }

  const matched = scored.map((x) => x.p);
  const total = matched.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, pages);
  const items = matched.slice((safePage - 1) * perPage, safePage * perPage);

  return {
    items,
    total,
    page: safePage,
    pages,
    perPage,
    facets: buildFacets(products, query, terms),
  };
}

/**
 * Facet counts are computed with the facet own filter removed, so the user can
 * see how many results switching to another family would give.
 */
function buildFacets(products: Product[], query: Query, terms: Term[]) {
  const pass = (p: Product, skip: "family" | "subfamily" | "brand") => {
    if (skip !== "family" && query.family && p.family !== query.family) return false;
    if (skip !== "subfamily" && query.subfamily && p.subfamily !== query.subfamily)
      return false;
    if (skip !== "brand" && query.brand && !p.brands.includes(query.brand)) return false;
    if (query.withImage && !p.images.length) return false;
    if (terms.length && scoreOf(p, terms) < 0) return false;
    return true;
  };

  const fam = new Map<string, number>();
  const sub = new Map<string, number>();
  const brd = new Map<string, number>();

  for (const p of products) {
    if (pass(p, "family")) fam.set(p.family, (fam.get(p.family) ?? 0) + 1);
    if (pass(p, "subfamily") && p.subfamily) {
      sub.set(p.subfamily, (sub.get(p.subfamily) ?? 0) + 1);
    }
    if (pass(p, "brand")) {
      for (const b of p.brands) brd.set(b, (brd.get(b) ?? 0) + 1);
    }
  }

  const toList = (m: Map<string, number>) =>
    [...m.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return { families: toList(fam), subfamilies: toList(sub), brands: toList(brd) };
}

/** Same family first, then same brand. Used under the product detail. */
export function getRelated(product: Product, limit = 8): Product[] {
  const { products } = getCatalog();

  const rank = (p: Product) => {
    let r = 0;
    if (p.family === product.family) r += 4;
    if (p.subfamily && p.subfamily === product.subfamily) r += 4;
    if (p.brands.some((b) => product.brands.includes(b))) r += 2;
    if (p.images.length) r += 1;
    return r;
  };

  return products
    .filter((p) => p.slug !== product.slug)
    .map((p) => ({ p, r: rank(p) }))
    .filter((x) => x.r > 2)
    .sort((a, b) => b.r - a.r)
    .slice(0, limit)
    .map((x) => x.p);
}
