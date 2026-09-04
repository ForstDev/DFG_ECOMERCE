"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { Gallery } from "./Gallery";
import { AddToCart } from "./AddToCart";
import { track } from "@/lib/track";
import { riseItem, stagger } from "@/lib/motion";
import type { Product } from "@/lib/types";

/**
 * The full product record, shared by the standalone page and the quick-view
 * overlay so both surfaces can never drift apart. The ground is white on
 * purpose: it is the same white the photography was shot on, so the part reads
 * as cut out of the page rather than pasted onto it.
 */
export function ProductDetail({
  product,
  compact = false,
  sharedLayout = false,
}: {
  product: Product;
  compact?: boolean;
  sharedLayout?: boolean;
}) {
  useEffect(() => {
    track({
      type: "view",
      slug: product.slug,
      code: product.code,
      name: product.name,
      family: product.family,
    });
  }, [product.slug, product.code, product.name, product.family]);

  const specs = [
    { label: "Código", value: product.code, mono: true },
    { label: "Familia", value: product.family },
    { label: "Subfamilia", value: product.subfamily },
    { label: "Línea de camión", value: product.brandLabel },
    { label: "Aplicación", value: product.application, wide: true },
  ].filter((s) => Boolean(s.value));

  return (
    <div className="bg-paper">
      <div className={compact ? "" : "shell pt-8 md:pt-12"}>
        {!compact && (
          <nav aria-label="Ruta" className="mb-6 flex flex-wrap items-center gap-1.5 text-[12px]">
            <Link href="/catalogo" className="text-ink-mute transition-colors hover:text-red">
              Catálogo
            </Link>
            <span className="text-line-strong">/</span>
            <Link
              href={"/catalogo?familia=" + encodeURIComponent(product.family)}
              className="text-ink-mute transition-colors hover:text-red"
            >
              {product.family}
            </Link>
            {product.subfamily && (
              <>
                <span className="text-line-strong">/</span>
                <Link
                  href={
                    "/catalogo?familia=" +
                    encodeURIComponent(product.family) +
                    "&subfamilia=" +
                    encodeURIComponent(product.subfamily)
                  }
                  className="text-ink-mute transition-colors hover:text-red"
                >
                  {product.subfamily}
                </Link>
              </>
            )}
          </nav>
        )}

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <Gallery
            images={product.images}
            alt={product.name}
            slug={product.slug}
            sharedLayout={sharedLayout}
          />

          <motion.div
            variants={stagger(0.06)}
            initial="hidden"
            animate="show"
            className="flex flex-col"
          >
            <motion.p
              variants={riseItem}
              className="code-type text-[26px] font-bold leading-none text-red md:text-[32px]"
            >
              {product.code}
            </motion.p>

            <motion.h1
              variants={riseItem}
              className={
                "mt-3 font-bold uppercase leading-[1.05] tracking-tight text-ink " +
                (compact ? "text-[22px] md:text-[28px]" : "text-[26px] md:text-[38px]")
              }
            >
              {product.name}
            </motion.h1>

            {product.brands.length > 0 && (
              <motion.div variants={riseItem} className="mt-5 flex flex-wrap gap-1.5">
                {product.brands.map((b) => (
                  <Link
                    key={b}
                    href={"/catalogo?marca=" + encodeURIComponent(b)}
                    className="border border-line px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-ink-soft transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                  >
                    {b}
                  </Link>
                ))}
              </motion.div>
            )}

            {/* The technical block. Grouped pairs, not a hairline-per-row table. */}
            <motion.dl
              variants={riseItem}
              className="mt-8 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2"
            >
              {specs.map((s) => (
                <div
                  key={s.label}
                  className={
                    "bg-paper px-4 py-3.5 " + (s.wide ? "sm:col-span-2" : "")
                  }
                >
                  <dt className="label text-ink-mute">{s.label}</dt>
                  <dd
                    className={
                      "mt-1.5 text-[13.5px] font-semibold leading-snug text-ink " +
                      (s.mono ? "code-type" : "")
                    }
                  >
                    {s.value}
                  </dd>
                </div>
              ))}
            </motion.dl>

            {product.crossRefs.length > 0 && (
              <motion.div variants={riseItem} className="mt-6 border border-line">
                <div className="border-b border-line bg-surface px-4 py-3">
                  <p className="label text-ink">Referencias cruzadas</p>
                  <p className="mt-1 text-[11.5px] leading-snug text-ink-mute">
                    Equivalencias OEM registradas para esta pieza. Todas son
                    buscables desde el buscador.
                  </p>
                </div>
                <ul className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2">
                  {product.crossRefs.map((r, i) => (
                    <li key={r.brand + r.code + i} className="bg-paper px-4 py-2.5">
                      {r.brand && (
                        <span className="block text-[10px] font-bold uppercase tracking-[0.07em] text-ink-mute">
                          {r.brand}
                        </span>
                      )}
                      <span className="code-type block text-[12.5px] font-semibold text-ink">
                        {r.code}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            <motion.div variants={riseItem} className="mt-8">
              <AddToCart product={product} insideOverlay={compact} />
            </motion.div>

            <motion.p variants={riseItem} className="mt-4 text-[12px] leading-relaxed text-ink-mute">
              Los precios se confirman por cotización. Al terminar tu lista envias
              todos los items juntos por WhatsApp y el equipo responde con
              disponibilidad y precio.
            </motion.p>

            {compact && (
              <motion.div variants={riseItem} className="mt-6">
                <Link
                  href={"/producto/" + product.slug}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-bold uppercase tracking-[0.08em] text-ink underline underline-offset-4 transition-colors hover:text-red"
                >
                  Abrir ficha completa
                  <ArrowUpRightIcon size={14} weight="bold" />
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
