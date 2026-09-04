"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { XIcon } from "@phosphor-icons/react";
import { buildCatalogHref, type CatalogParams } from "@/lib/url";
import { expo } from "@/lib/motion";

/**
 * Active filters and sort order. The chips are the only place a filter can be
 * removed from the results area itself, so a user who scrolled past the rail
 * still knows what is narrowing their view.
 */
export function CatalogToolbar({
  params,
  total,
  showing,
}: {
  params: CatalogParams;
  total: number;
  showing: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const go = (patch: Partial<CatalogParams>) => {
    startTransition(() => {
      router.push(buildCatalogHref(params, patch), { scroll: false });
    });
  };

  const chips = [
    params.q && { key: "q" as const, label: 'Búsqueda: "' + params.q + '"' },
    params.familia && { key: "familia" as const, label: params.familia },
    params.subfamilia && { key: "subfamilia" as const, label: params.subfamilia },
    params.marca && { key: "marca" as const, label: params.marca },
    params.conFoto && { key: "conFoto" as const, label: "Con foto" },
  ].filter(Boolean) as { key: keyof CatalogParams; label: string }[];

  return (
    <div className="flex flex-col gap-3 border-b border-line pb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-ink-mute">
          <span
            className={
              "code-type font-bold text-ink transition-opacity " +
              (pending ? "opacity-40" : "opacity-100")
            }
          >
            {total.toLocaleString("es")}
          </span>{" "}
          {total === 1 ? "repuesto" : "repuestos"}
          {showing > 0 && total > showing && (
            <span className="hidden sm:inline"> / mostrando {showing}</span>
          )}
        </p>

        <label className="flex items-center gap-2 text-[12px] text-ink-mute">
          Ordenar
          <select
            value={params.orden ?? (params.q ? "relevance" : "code")}
            onChange={(e) => go({ orden: e.target.value })}
            className="h-9 border border-line bg-paper px-2 text-[12px] font-semibold text-ink focus:border-red focus:outline-none"
          >
            <option value="relevance">Relevancia</option>
            <option value="code">Código</option>
            <option value="name">Descripción</option>
          </select>
        </label>
      </div>

      <AnimatePresence initial={false}>
        {chips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={expo(0.3)}
            className="flex flex-wrap items-center gap-2 overflow-hidden"
          >
            {chips.map((c) => (
              <motion.button
                key={c.key}
                layout
                onClick={() => go({ [c.key]: undefined })}
                className="flex items-center gap-1.5 border border-ink bg-ink px-2.5 py-1.5 text-[11.5px] font-semibold text-paper transition-colors hover:bg-red hover:border-red"
              >
                <span className="max-w-[240px] truncate">{c.label}</span>
                <XIcon size={12} weight="bold" />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
