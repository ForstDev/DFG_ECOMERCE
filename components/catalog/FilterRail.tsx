"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { CaretDownIcon, XIcon, FunnelSimpleIcon } from "@phosphor-icons/react";
import { buildCatalogHref, type CatalogParams } from "@/lib/url";
import { track } from "@/lib/track";
import { expo, snap } from "@/lib/motion";

type Facet = { name: string; count: number };

/**
 * Faceted navigation for the catalog. Every choice is written into the URL, so
 * a filtered view can be pasted into a chat and reopened exactly as it was.
 * Counts come from the server already excluding the facet being counted, so the
 * numbers answer "how many if I switch to that" rather than "how many now".
 */
export function FilterRail({
  params,
  families,
  subfamilies,
  brands,
  total,
}: {
  params: CatalogParams;
  families: Facet[];
  subfamilies: Facet[];
  brands: Facet[];
  total: number;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCount =
    (params.familia ? 1 : 0) +
    (params.subfamilia ? 1 : 0) +
    (params.marca ? 1 : 0) +
    (params.conFoto ? 1 : 0);

  return (
    <>
      {/* Mobile trigger. The rail becomes a full-height sheet under lg. */}
      <button
        onClick={() => setMobileOpen(true)}
        className="flex w-full items-center justify-between border border-ink bg-paper px-4 py-3 text-[12px] font-bold uppercase tracking-[0.09em] lg:hidden"
      >
        <span className="flex items-center gap-2">
          <FunnelSimpleIcon size={16} weight="bold" />
          Filtros
        </span>
        {activeCount > 0 && (
          <span className="code-type grid h-5 min-w-5 place-items-center bg-red px-1 text-[10px] text-white">
            {activeCount}
          </span>
        )}
      </button>

      <div className="hidden lg:block">
        <RailBody
          params={params}
          families={families}
          subfamilies={subfamilies}
          brands={brands}
          total={total}
        />
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[var(--z-drawer)] bg-ink/50 backdrop-blur-[2px] lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={expo(0.45)}
              role="dialog"
              aria-label="Filtros del catálogo"
              className="thin-scroll fixed left-0 top-0 z-[var(--z-drawer)] flex h-[100dvh] w-[min(340px,90vw)] flex-col overflow-y-auto bg-paper lg:hidden"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-paper px-4 py-3">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.09em]">Filtros</h2>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Cerrar filtros"
                  className="grid h-9 w-9 place-items-center text-ink-mute"
                >
                  <XIcon size={19} weight="bold" />
                </button>
              </div>
              <div className="p-4">
                <RailBody
                  params={params}
                  families={families}
                  subfamilies={subfamilies}
                  brands={brands}
                  total={total}
                  onPick={() => setMobileOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function RailBody({
  params,
  families,
  subfamilies,
  brands,
  total,
  onPick,
}: {
  params: CatalogParams;
  families: Facet[];
  subfamilies: Facet[];
  brands: Facet[];
  total: number;
  onPick?: () => void;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const go = (patch: Partial<CatalogParams>, facet?: "family" | "subfamily" | "brand") => {
    const value = Object.values(patch)[0];
    if (facet && value) track({ type: "filter", facet, value: String(value) });
    onPick?.();
    startTransition(() => {
      router.push(buildCatalogHref(params, patch), { scroll: false });
    });
  };

  const hasFilters =
    params.familia || params.subfamilia || params.marca || params.conFoto || params.q;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between pb-3">
        <p className="code-type text-[12px] text-ink-mute">
          {total.toLocaleString("es")} resultados
        </p>
        {hasFilters && (
          <button
            onClick={() =>
              go({
                familia: undefined,
                subfamilia: undefined,
                marca: undefined,
                conFoto: undefined,
                q: undefined,
              })
            }
            className="text-[11.5px] font-semibold text-red underline underline-offset-4"
          >
            Limpiar
          </button>
        )}
      </div>

      <FacetGroup
        title="Familia"
        items={families}
        selected={params.familia}
        onSelect={(v) => go({ familia: v, subfamilia: undefined }, "family")}
        initialOpen
        max={10}
      />

      {subfamilies.length > 0 && (
        <FacetGroup
          title="Subfamilia"
          items={subfamilies}
          selected={params.subfamilia}
          onSelect={(v) => go({ subfamilia: v }, "subfamily")}
          initialOpen={Boolean(params.familia)}
          max={10}
        />
      )}

      <FacetGroup
        title="Marca de camión"
        items={brands}
        selected={params.marca}
        onSelect={(v) => go({ marca: v }, "brand")}
        initialOpen
        max={10}
        searchable
      />

      <label className="mt-3 flex cursor-pointer items-center gap-2.5 border-t border-line pt-4">
        <input
          type="checkbox"
          checked={Boolean(params.conFoto)}
          onChange={(e) => go({ conFoto: e.target.checked ? "1" : undefined })}
          className="h-4 w-4 shrink-0 accent-[var(--color-red)]"
        />
        <span className="text-[12.5px] text-ink">Solo items con foto</span>
      </label>
    </div>
  );
}

function FacetGroup({
  title,
  items,
  selected,
  onSelect,
  initialOpen = false,
  max = 10,
  searchable = false,
}: {
  title: string;
  items: Facet[];
  selected?: string;
  onSelect: (value: string | undefined) => void;
  initialOpen?: boolean;
  max?: number;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState("");

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const list = q ? items.filter((i) => i.name.toLowerCase().includes(q)) : items;
    return expanded || q ? list : list.slice(0, max);
  }, [items, filter, expanded, max]);

  const hidden = items.length - visible.length;

  return (
    <div className="border-t border-line py-3 first:border-t-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="label text-ink">{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={snap}>
          <CaretDownIcon size={13} weight="bold" className="text-ink-mute" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={expo(0.35)}
            className="overflow-hidden"
          >
            <div className="pt-3">
              {searchable && items.length > max && (
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder={"Filtrar " + title.toLowerCase()}
                  aria-label={"Filtrar " + title.toLowerCase()}
                  className="mb-2 h-9 w-full border border-line bg-paper px-2.5 text-[12px] placeholder:text-ink-mute focus:border-red focus:outline-none"
                />
              )}

              <ul className="thin-scroll max-h-[280px] space-y-0.5 overflow-y-auto pr-1">
                {visible.map((item) => {
                  const active = selected === item.name;
                  return (
                    <li key={item.name}>
                      <button
                        onClick={() => onSelect(active ? undefined : item.name)}
                        aria-pressed={active}
                        className={
                          "flex w-full items-center justify-between gap-2 px-2 py-1.5 text-left transition-colors " +
                          (active ? "bg-ink text-paper" : "text-ink hover:bg-surface")
                        }
                      >
                        <span className="truncate text-[12.5px] leading-snug">
                          {item.name}
                        </span>
                        <span
                          className={
                            "code-type shrink-0 text-[10.5px] " +
                            (active ? "text-white/70" : "text-ink-mute")
                          }
                        >
                          {item.count}
                        </span>
                      </button>
                    </li>
                  );
                })}
                {visible.length === 0 && (
                  <li className="px-2 py-2 text-[12px] text-ink-mute">Sin coincidencias</li>
                )}
              </ul>

              {hidden > 0 && !filter && (
                <button
                  onClick={() => setExpanded(true)}
                  className="mt-2 px-2 text-[11.5px] font-semibold text-red underline underline-offset-4"
                >
                  Ver {hidden} más
                </button>
              )}
              {expanded && !filter && items.length > max && (
                <button
                  onClick={() => setExpanded(false)}
                  className="mt-2 px-2 text-[11.5px] font-semibold text-ink-mute underline underline-offset-4"
                >
                  Ver menos
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
