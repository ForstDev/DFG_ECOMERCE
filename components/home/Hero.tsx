"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { SearchBox } from "@/components/site/SearchBox";
import { Chevron } from "@/components/brand/Logo";

/**
 * The one dark block at the top of the page. The footage is DFG own brand reel,
 * dimmed hard so the headline keeps AAA contrast over any frame, and it drifts
 * upward at a fraction of the scroll speed to give the fold some depth.
 *
 * The copy enters through CSS keyframes, not through Motion. Above the fold the
 * resting state has to be the readable one: if the bundle is slow, blocked, or
 * mounted while the tab is in the background, a JS-driven mask leaves the
 * headline translated out of its own clip and the hero renders empty. The
 * parallax stays in Motion because it is scroll-linked and purely decorative.
 */
const LINES = ["Repuestos alternativos", "para camión pesado."];

export function Hero({ products, families }: { products: number; families: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[min(88dvh,760px)] items-end overflow-hidden bg-ink text-paper"
    >
      <motion.div style={reduce ? undefined : { y }} className="absolute inset-0 -z-10">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="h-full w-full scale-105 object-cover opacity-55"
        >
          <source
            src="https://dfgtruckparts.com/wp-content/uploads/2022/09/DFG-final-260822.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/35" />
      </motion.div>

      <div className="shell w-full pb-14 pt-24 md:pb-20">
        <div className="max-w-[1040px]">
          <h1 className="text-[clamp(1.45rem,4.8vw,3.7rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em]">
            {LINES.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.06em]">
                <span
                  className="anim-mask-up block"
                  style={{ animationDelay: 0.15 + i * 0.09 + "s" }}
                >
                  {i === 1 ? (
                    <>
                      para <span className="text-red">camión pesado.</span>
                    </>
                  ) : (
                    line
                  )}
                </span>
              </span>
            ))}
          </h1>

          <p
            className="anim-rise mt-6 max-w-[46ch] text-[15px] leading-relaxed text-white/75 md:text-[17px]"
            style={{ animationDelay: "0.45s" }}
          >
            {products.toLocaleString("es")} ítems en {families} familias, para Volvo,
            Scania, Mercedes Benz y las principales líneas del mercado.
          </p>

          <div
            className="anim-rise mt-9 flex flex-col gap-4 sm:flex-row sm:items-center"
            style={{ animationDelay: "0.58s" }}
          >
            <div className="w-full sm:max-w-[420px]">
              <SearchBox variant="header" />
            </div>

            <Link
              href="/catalogo"
              className="group inline-flex shrink-0 items-center justify-center gap-2 bg-red px-6 py-3.5 text-[12.5px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-deep"
            >
              Ver catálogo
              <Chevron className="h-2.5 w-auto transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
