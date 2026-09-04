import Link from "next/link";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";

/**
 * The zero-results state. It offers a way forward instead of an apology: the
 * catalog is 1.828 items deep and most misses are a typo in a part number.
 */
export function EmptyResults({ query }: { query?: string }) {
  return (
    <div className="mt-6 flex flex-col items-center border border-line bg-surface px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center border border-line-strong bg-paper text-ink-mute">
        <MagnifyingGlassIcon size={24} weight="light" />
      </span>

      <h2 className="mt-5 text-[18px] font-bold uppercase tracking-tight">Sin resultados</h2>

      <p className="mt-2 max-w-[46ch] text-[13.5px] leading-relaxed text-ink-mute">
        {query
          ? "No hay repuestos para esa combinación. Revisa el número de parte o quita alguno de los filtros."
          : "Esa combinación de filtros no devuelve items. Quita alguno para ampliar la búsqueda."}
      </p>

      <Link
        href="/catalogo"
        className="mt-6 bg-ink px-5 py-3 text-[12px] font-bold uppercase tracking-[0.09em] text-paper transition-colors hover:bg-ink-soft"
      >
        Ver todo el catálogo
      </Link>
    </div>
  );
}
