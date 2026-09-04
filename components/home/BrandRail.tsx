import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import type { Brand } from "@/lib/types";

/**
 * Truck lines the catalog covers, as a flickable scroll-snap rail. These are
 * navigation, not a logo wall: each tile is a live filter and the count under
 * it comes from the data, so the strip tells a buyer where the depth actually
 * is before they click.
 */
export function BrandRail({ brands }: { brands: Brand[] }) {
  const top = brands.filter((b) => b.count >= 2).slice(0, 20);

  return (
    <section className="border-y border-line bg-ink py-16 text-paper md:py-20">
      <div className="shell">
        <Reveal>
          <h2 className="max-w-[20ch] text-[30px] font-bold uppercase leading-[0.98] tracking-tight md:text-[46px]">
            Líneas cubiertas
          </h2>
          <p className="mt-3 max-w-[52ch] text-[14px] leading-relaxed text-white/60">
            Compatibilidad desarrollada para las líneas más pedidas del transporte
            pesado. El número es la cantidad de repuestos disponibles hoy.
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.08}>
        <div className="thin-scroll mt-9 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4 md:px-8 xl:px-12">
          {top.map((b) => (
            <Link
              key={b.slug}
              href={"/catalogo?marca=" + encodeURIComponent(b.name)}
              className="group flex min-w-[186px] snap-start flex-col justify-between border border-white/15 px-5 py-6 transition-colors hover:border-red hover:bg-red"
            >
              <span className="code-type text-[11px] font-bold text-white/45 transition-colors group-hover:text-white/80">
                {b.count} ítems
              </span>
              <span className="mt-8 block text-[19px] font-bold uppercase leading-[1.05] tracking-tight md:text-[22px]">
                {b.name}
              </span>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
