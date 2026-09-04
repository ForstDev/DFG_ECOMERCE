import type { Metadata } from "next";
import { search } from "@/lib/catalog";
import { one, type CatalogParams } from "@/lib/url";
import { FilterRail } from "@/components/catalog/FilterRail";
import { CatalogToolbar } from "@/components/catalog/CatalogToolbar";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Pagination } from "@/components/catalog/Pagination";
import { SearchBox } from "@/components/site/SearchBox";
import { EmptyResults } from "@/components/catalog/EmptyResults";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Todo el catálogo DFG con filtros por familia, subfamilia y línea de camión, y búsqueda por código o descripción.",
};

// The admin panel can change a description or a photo at any moment, and the
// facet counts are derived from the live data, so the page is rendered per
// request rather than cached.
export const dynamic = "force-dynamic";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const params: CatalogParams = {
    q: one(sp.q),
    familia: one(sp.familia),
    subfamilia: one(sp.subfamilia),
    marca: one(sp.marca),
    conFoto: one(sp.conFoto),
    orden: one(sp.orden),
    pagina: one(sp.pagina),
  };

  const sortParam = params.orden;
  const result = search({
    q: params.q,
    family: params.familia,
    subfamily: params.subfamilia,
    brand: params.marca,
    withImage: Boolean(params.conFoto),
    sort:
      sortParam === "relevance" || sortParam === "code" || sortParam === "name"
        ? sortParam
        : undefined,
    page: Number(params.pagina ?? 1) || 1,
    perPage: 24,
  });

  const heading = params.familia ?? "Catálogo completo";

  return (
    <div className="shell py-8 md:py-12">
      <header className="mb-8 flex flex-col gap-5 md:mb-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8">
          <div>
            <h1 className="text-[32px] font-bold uppercase leading-[0.95] tracking-tight md:text-[52px]">
              {heading}
            </h1>
            <p className="mt-2 max-w-[52ch] text-[13.5px] leading-relaxed text-ink-mute">
              Busca por número de parte o por descripción, o filtra por familia y
              línea de camión. Todo lo que agregues se envía junto en una sola
              cotización.
            </p>
          </div>
          <div className="w-full md:max-w-[400px]">
            <SearchBox variant="page" initialValue={params.q ?? ""} />
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-10">
        <aside className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:h-fit">
          <FilterRail
            params={params}
            families={result.facets.families}
            subfamilies={result.facets.subfamilies}
            brands={result.facets.brands}
            total={result.total}
          />
        </aside>

        <section>
          <CatalogToolbar
            params={params}
            total={result.total}
            showing={result.items.length}
          />

          {result.items.length === 0 ? (
            <EmptyResults query={params.q} />
          ) : (
            <>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 xl:gap-4">
                {result.items.map((p, i) => (
                  <ProductCard key={p.slug} product={p} index={i} />
                ))}
              </div>

              <Pagination params={params} page={result.page} pages={result.pages} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
