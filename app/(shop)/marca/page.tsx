import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getCatalog } from "@/lib/catalog";
import { Reveal } from "@/components/ui/Reveal";
import { Chevron } from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "La marca",
  description:
    "Más de diez años desarrollando estándares de calidad para el mercado de repuestos de camiones y buses pesados.",
};

export const dynamic = "force-dynamic";

export default function BrandPage() {
  const catalog = getCatalog();

  // A strip of real parts, one per family, instead of stock photography.
  const showcase = catalog.families
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((f) => f.image)
    .filter(Boolean);

  return (
    <>
      <section className="bg-ink text-paper">
        <div className="shell py-20 md:py-28">
          <Reveal>
            <h1 className="max-w-[16ch] text-[clamp(2.2rem,5.6vw,4.25rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em]">
              Estándares de calidad para el <span className="text-red">transporte pesado</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-8 max-w-[62ch] text-[15px] leading-relaxed text-white/70 md:text-[17px]">
              Los procesos de calidad de DFG están bajo los estándares más altos
              del mundo automotriz, lo que permite entrar de forma competitiva a
              cualquier mercado. La experiencia y la pasion del equipo son el
              valor de marca más significativo, y lo que permite innovar tanto en
              los procesos como en el desarrollo de productos nuevos para las
              distintas líneas y aplicaciones de camión pesado.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="shell py-16 md:py-24">
        <div className="grid gap-px border border-line bg-line md:grid-cols-3">
          {[
            {
              k: "Alcance",
              v: catalog.totals.products.toLocaleString("es") + " repuestos",
              d: "Distribuidos en " + catalog.totals.families + " familias de producto.",
            },
            {
              k: "Compatibilidad",
              v: catalog.totals.brands + " líneas",
              d: "Volvo, Scania, Mercedes Benz, USA, Iveco, Sinotruk y más.",
            },
            {
              k: "Documentacion",
              v: catalog.totals.images.toLocaleString("es") + " fotos",
              d: "Fotografía de producto sobre fondo blanco para cada referencia.",
            },
          ].map((item, i) => (
            <Reveal key={item.k} delay={i * 0.07} className="bg-paper p-7 md:p-9">
              <p className="label text-red">{item.k}</p>
              <p className="mt-4 text-[26px] font-bold uppercase leading-none tracking-tight md:text-[32px]">
                {item.v}
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-mute">{item.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="shell pb-16 md:pb-24">
        <Reveal>
          <div className="grid grid-cols-3 gap-px border border-line bg-line md:grid-cols-6">
            {showcase.map((src) => (
              <div key={src} className="photo-plate relative aspect-square">
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 33vw, 16vw"
                  className="object-contain p-5"
                />
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="shell pb-20 md:pb-28">
        <Reveal className="flex flex-col items-start gap-6 border border-line bg-surface p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div>
            <h2 className="max-w-[20ch] text-[24px] font-bold uppercase leading-[1.02] tracking-tight md:text-[34px]">
              El catálogo completo, en línea
            </h2>
            <p className="mt-3 max-w-[52ch] text-[13.5px] leading-relaxed text-ink-mute">
              Busca por número de parte, filtra por familia o por línea de camión,
              y arma la cotización en una sola lista.
            </p>
          </div>

          <Link
            href="/catalogo"
            className="group inline-flex shrink-0 items-center gap-2 bg-red px-6 py-4 text-[12.5px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-deep"
          >
            Entrar al catálogo
            <Chevron className="h-2.5 w-auto transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
