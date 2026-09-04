import "server-only";
import { getCatalog } from "./catalog";
import type { Product } from "./types";

/**
 * The catalog is organised by the 28 families the excel defines, which is how a
 * warehouse thinks. A buyer thinks in truck systems. This map is the bridge:
 * four systems, each pointing at the real families that serve it, so the home
 * page can present the catalog the way the customer searches it.
 *
 * Every family name here exists in the generated catalog. If the excel is
 * re-imported with different names, the resolver below simply skips the misses.
 */
export const SYSTEMS = [
  {
    id: "frenos",
    name: "Frenos de aire",
    blurb:
      "Ratchets, válvulas, cámaras y diafragmas. La familia más profunda del catálogo.",
    families: [
      "AIR BRAKE COMPONENTS",
      "Z-CAM BRAKES",
      "BRAKE PAD KIT AND BRAKE DISC",
    ],
  },
  {
    id: "suspension",
    name: "Suspensión y chasis",
    blurb:
      "Bolsas de aire, amortiguadores de cabina y de eje, bujes y soportes de motor.",
    families: [
      "SUSPENSION",
      "AIR SPRINGS",
      "SHOCK ABSORBERS",
      "BUSHING",
      "MOUNTING",
    ],
  },
  {
    id: "motor",
    name: "Motor y enfriamiento",
    blurb:
      "Filtros de aire, aceite y combustible, bombas, radiadores e intercoolers.",
    families: [
      "FILTERS",
      "PUMP",
      "RADIATORS AND INTERCOOLERS",
      "COMPRESSOR",
      "CAMSHAFT",
    ],
  },
  {
    id: "transmision",
    name: "Transmisión y embrague",
    blurb:
      "Discos, cilindros maestros, válvulas de cambio, crucetas y retenes de caja.",
    families: [
      "CLUTCH SYSTEM",
      "GEAR SHIFT VALVES AND ACCESORIES",
      "GEAR SHIFT HANDLES",
      "UNIVERSAL JOINT",
      "OIL SEAL",
    ],
  },
] as const;

export type ResolvedSystem = {
  id: string;
  name: string;
  blurb: string;
  families: string[];
  count: number;
  products: Pick<Product, "slug" | "code" | "name" | "images" | "family">[];
};

export function getSystems(): ResolvedSystem[] {
  const { products } = getCatalog();

  return SYSTEMS.map((s) => {
    const families = (s.families as readonly string[]).filter((f) =>
      products.some((p) => p.family === f),
    );
    const inSystem = products.filter((p) => families.includes(p.family));

    // One photo per family first, so the four tiles show four different parts
    // rather than four variants of the same filter.
    const picked: Product[] = [];
    for (const family of families) {
      const hit = inSystem.find(
        (p) => p.family === family && p.images.length && !picked.includes(p),
      );
      if (hit) picked.push(hit);
      if (picked.length === 4) break;
    }
    for (const p of inSystem) {
      if (picked.length === 4) break;
      if (p.images.length && !picked.includes(p)) picked.push(p);
    }

    return {
      id: s.id,
      name: s.name,
      blurb: s.blurb,
      families,
      count: inSystem.length,
      products: picked.map((p) => ({
        slug: p.slug,
        code: p.code,
        name: p.name,
        images: p.images,
        family: p.family,
      })),
    };
  });
}
