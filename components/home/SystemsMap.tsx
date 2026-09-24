"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useInView } from "motion/react";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { expo } from "@/lib/motion";
import type { ResolvedSystem } from "@/lib/systems";

/**
 * The catalog seen from the truck instead of from the warehouse.
 *
 * The four systems scroll past on the left while a pinned panel on the right
 * swaps to the real parts that serve whichever system is in view. The motion is
 * doing a job here: it holds one exploded view in place so a buyer can map
 * "the brake is leaking" onto the families that actually fix it.
 *
 * Under lg the pin is dropped and each system carries its own tiles, because a
 * sticky panel on a phone would cover the text it is meant to illustrate.
 */
export function SystemsMap({ systems }: { systems: ResolvedSystem[] }) {
  const [active, setActive] = useState(0);
  const handleEnter = useCallback((i: number) => setActive(i), []);
  const current = systems[active] ?? systems[0];

  if (!current) return null;

  return (
    <section className="shell py-20 md:py-28">
      <div className="border-b border-line pb-6">
        <p className="label text-red">Por sistema del vehículo</p>
        <h2 className="mt-3 max-w-[18ch] text-[30px] font-bold uppercase leading-[0.98] tracking-tight md:text-[46px]">
          Del camión a la pieza
        </h2>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
        <div>
          {systems.map((s, i) => (
            <SystemBlock
              key={s.id}
              system={s}
              index={i}
              isActive={i === active}
              onEnter={handleEnter}
            />
          ))}
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-h)+40px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={expo(0.45)}
              >
                <div className="grid grid-cols-2 gap-px border border-line bg-line">
                  {current.products.map((p) => (
                    <Link
                      key={p.slug}
                      href={"/producto/" + p.slug}
                      className="photo-plate group relative aspect-square"
                    >
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        sizes="24vw"
                        className="object-contain p-7 transition-transform duration-[700ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.08]"
                      />
                      <span className="absolute inset-x-0 bottom-0 truncate bg-ink/85 px-3 py-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        {p.code}
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border border-line px-4 py-3">
                  <p className="text-[12.5px] font-semibold text-ink">
                    {current.count.toLocaleString("es")} repuestos en{" "}
                    {current.families.length} familias
                  </p>
                  <span className="code-type text-[11px] text-ink-mute">
                    {active + 1} de {systems.length}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function SystemBlock({
  system,
  index,
  isActive,
  onEnter,
}: {
  system: ResolvedSystem;
  index: number;
  isActive: boolean;
  onEnter: (index: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, margin: "-18% 0px -18% 0px" });

  useEffect(() => {
    if (inView) onEnter(index);
  }, [inView, index, onEnter]);

  const firstFamily = system.families[0];

  return (
    <div
      ref={ref}
      className="border-b border-line py-9 last:border-b-0 lg:min-h-[46vh] lg:py-14"
    >
      <div className="flex items-start gap-4">
        <span
          className={
            "code-type mt-1.5 shrink-0 text-[12px] font-bold transition-colors duration-500 " +
            (isActive ? "text-red" : "text-line-strong")
          }
        >
          {index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <h3
            className={
              "text-[24px] font-bold uppercase leading-[1.02] tracking-tight transition-colors duration-500 md:text-[34px] " +
              (isActive ? "text-ink" : "text-ink-mute lg:text-line-strong")
            }
          >
            {system.name}
          </h3>

          <p className="mt-3 max-w-[46ch] text-[13.5px] leading-relaxed text-ink-mute">
            {system.blurb}
          </p>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {system.families.map((f) => (
              <Link
                key={f}
                href={"/catalogo?familia=" + encodeURIComponent(f)}
                className="border border-line px-2.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.06em] text-ink-soft transition-colors hover:border-ink hover:bg-ink hover:text-paper"
              >
                {f}
              </Link>
            ))}
          </div>

          {/* Mobile and tablet: the tiles travel with their own system block.
              Four columns from `sm` up, not two: at tablet widths (roughly
              640-1023px, right below the desktop sticky-panel breakpoint) two
              columns of aspect-square product photography turn into tiles
              near 460px on a side. The photos are shot on white, so two rows
              of that read as a blank white screen while scrolling, not as a
              product grid. */}
          <div className="mt-6 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4 lg:hidden">
            {system.products.map((p) => (
              <Link
                key={p.slug}
                href={"/producto/" + p.slug}
                className="photo-plate relative aspect-square"
              >
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  fill
                  sizes="(min-width: 640px) 25vw, 45vw"
                  className="object-contain p-5"
                />
              </Link>
            ))}
          </div>

          {firstFamily && (
            <Link
              href={"/catalogo?familia=" + encodeURIComponent(firstFamily)}
              className="group mt-6 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.08em] text-ink transition-colors hover:text-red"
            >
              Ver {system.count.toLocaleString("es")} repuestos
              <ArrowUpRightIcon
                size={13}
                weight="bold"
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
