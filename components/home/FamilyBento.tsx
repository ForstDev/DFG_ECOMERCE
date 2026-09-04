import Link from "next/link";
import Image from "next/image";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/ui/Reveal";
import type { Family } from "@/lib/types";

/**
 * The eight largest families, laid out as a bento with two hero cells so the
 * grid has rhythm instead of eight identical tiles. Each cell carries a real
 * product photo pulled from that family, never a placeholder.
 *
 * Cell count matches item count exactly: 8 families, 8 cells.
 */
const SPANS = [
  "md:col-span-3 md:row-span-2",
  "md:col-span-3 md:row-span-1",
  "md:col-span-3 md:row-span-1",
  "md:col-span-2 md:row-span-1",
  "md:col-span-2 md:row-span-1",
  "md:col-span-2 md:row-span-1",
  "md:col-span-3 md:row-span-1",
  "md:col-span-3 md:row-span-1",
];

export function FamilyBento({ families }: { families: Family[] }) {
  const top = families
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <section className="shell py-20 md:py-28">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
          <h2 className="max-w-[16ch] text-[30px] font-bold uppercase leading-[0.98] tracking-tight md:text-[46px]">
            Familias de repuesto
          </h2>
          <Link
            href="/catalogo"
            className="group inline-flex shrink-0 items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-[0.09em] text-ink transition-colors hover:text-red"
          >
            Las {families.length} familias
            <ArrowUpRightIcon
              size={14}
              weight="bold"
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </Reveal>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:auto-rows-[186px] md:grid-cols-6">
        {top.map((f, i) => (
          <Reveal
            key={f.slug}
            as="article"
            delay={Math.min(i, 6) * 0.05}
            className={
              "group relative overflow-hidden border border-line bg-paper " +
              (SPANS[i] ?? "md:col-span-3")
            }
          >
            <Link
              href={"/catalogo?familia=" + encodeURIComponent(f.name)}
              className="flex h-full min-h-[200px] flex-col justify-end p-5"
            >
              {f.image && (
                <div className="photo-plate absolute inset-0">
                  <Image
                    src={f.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    className={
                      "object-contain transition-transform duration-[800ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.07] " +
                      (i === 0 ? "p-10" : "p-8")
                    }
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/55 to-transparent" />
                </div>
              )}

              <div className="relative">
                <p className="code-type text-[11px] font-bold text-red">
                  {f.count} ítems
                </p>
                <h3
                  className={
                    "mt-1 font-bold uppercase leading-[1.02] tracking-tight text-ink " +
                    (i === 0 ? "text-[22px] md:text-[30px]" : "text-[17px] md:text-[20px]")
                  }
                >
                  {f.name}
                </h3>
                {f.subfamilies.length > 0 && (
                  <p className="mt-1.5 line-clamp-1 text-[11.5px] text-ink-mute">
                    {f.subfamilies
                      .slice(0, 3)
                      .map((s) => s.name)
                      .join(" / ")}
                  </p>
                )}
              </div>

              <span className="absolute right-4 top-4 grid h-8 w-8 place-items-center bg-ink text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <ArrowUpRightIcon size={14} weight="bold" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
