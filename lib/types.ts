export type Product = {
  id: string;
  slug: string;
  /** First reference in the CODIGO column, cleaned of its brand prefix. */
  code: string;
  /** Original CODIGO cell when it held more than one reference. */
  codeRaw: string;
  /** OEM equivalences the CODIGO cell listed after the primary code. */
  crossRefs: { brand: string; code: string }[];
  name: string;
  family: string;
  subfamily: string;
  brands: string[];
  brandLabel: string;
  application: string;
  images: string[];
  /** true when an admin has edited this product from the panel */
  edited?: boolean;
};

export type Subfamily = { name: string; slug: string; count: number };

export type Family = {
  name: string;
  slug: string;
  count: number;
  image: string;
  subfamilies: Subfamily[];
};

export type Brand = { name: string; slug: string; count: number };

export type Catalog = {
  generatedAt: string;
  source: string;
  totals: {
    products: number;
    families: number;
    brands: number;
    withImage: number;
    images: number;
  };
  families: Family[];
  brands: Brand[];
  products: Product[];
};

/** Fields an admin may override. Everything else stays as the excel defined it. */
export type ProductOverride = {
  name?: string;
  application?: string;
  images?: string[];
  updatedAt: string;
};

export type CartLine = {
  slug: string;
  code: string;
  name: string;
  image: string;
  brandLabel: string;
  qty: number;
};

export type TrackEvent =
  | { type: "search"; term: string; results: number }
  | { type: "view"; slug: string; code: string; name: string; family: string }
  | { type: "cart_add"; slug: string; code: string; name: string; qty: number }
  | { type: "quote"; lines: number; units: number }
  | { type: "filter"; facet: "family" | "subfamily" | "brand"; value: string };

export type StoredEvent = TrackEvent & { at: string };

export type Settings = {
  whatsapp: string;
  whatsappLabel: string;
  quoteIntro: string;
  contactEmail: string;
};
