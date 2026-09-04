"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { TrashIcon, ShoppingCartSimpleIcon, ArrowLeftIcon } from "@phosphor-icons/react";
import { useCart } from "./CartProvider";
import { QtyStepper } from "./QtyStepper";
import { QuoteButton } from "./QuoteButton";
import { buildQuoteMessage } from "@/lib/wa";
import { expo } from "@/lib/motion";

/**
 * The full quote review. It shows the exact message that will be sent, because
 * a buyer is about to hand this list to a salesperson and should see it first.
 */
export function CartPage() {
  const { lines, units, ready, setQty, remove, clear, settings } = useCart();

  if (!ready) {
    return (
      <div className="shell py-16">
        <div className="h-8 w-56 animate-pulse bg-surface-2" />
        <div className="mt-8 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="shell flex flex-col items-center py-24 text-center md:py-32">
        <span className="grid h-20 w-20 place-items-center border border-line text-ink-mute">
          <ShoppingCartSimpleIcon size={32} weight="light" />
        </span>
        <h1 className="mt-6 text-[28px] font-bold uppercase tracking-tight md:text-[38px]">
          Tu cotización está vacía
        </h1>
        <p className="mt-3 max-w-[46ch] text-[14px] leading-relaxed text-ink-mute">
          Arma tu lista desde el catálogo. Cuando termines, se envía completa por
          WhatsApp con codigos y cantidades.
        </p>
        <Link
          href="/catalogo"
          className="mt-8 bg-red px-7 py-4 text-[12.5px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-deep"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  const preview = buildQuoteMessage(lines, settings);

  return (
    <div className="shell py-10 md:py-14">
      <Link
        href="/catalogo"
        className="mb-6 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-mute transition-colors hover:text-red"
      >
        <ArrowLeftIcon size={14} weight="bold" />
        Seguir buscando
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <h1 className="text-[32px] font-bold uppercase leading-none tracking-tight md:text-[46px]">
          Cotización
        </h1>
        <p className="code-type text-[13px] text-ink-mute">
          {lines.length} {lines.length === 1 ? "ítem" : "ítems"} / {units}{" "}
          {units === 1 ? "unidad" : "unidades"}
        </p>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
        <ul>
          <AnimatePresence initial={false}>
            {lines.map((l) => (
              <motion.li
                key={l.slug}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={expo(0.35)}
                className="overflow-hidden border-b border-line"
              >
                <div className="flex flex-wrap items-center gap-4 py-4 sm:flex-nowrap">
                  <Link
                    href={"/producto/" + l.slug}
                    className="photo-plate h-24 w-24 shrink-0 border border-line"
                  >
                    {l.image ? (
                      <Image
                        src={l.image}
                        alt=""
                        width={96}
                        height={96}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <span className="code-type text-[10px] text-ink-mute">S/F</span>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={"/producto/" + l.slug}
                      className="code-type text-[14px] font-bold text-red hover:underline"
                    >
                      {l.code}
                    </Link>
                    <p className="mt-1 text-[13.5px] font-medium leading-snug text-ink">
                      {l.name}
                    </p>
                    {l.brandLabel && (
                      <p className="mt-1 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-ink-mute">
                        {l.brandLabel}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <QtyStepper value={l.qty} onChange={(n) => setQty(l.slug, n)} />
                    <button
                      onClick={() => remove(l.slug)}
                      aria-label={"Quitar " + l.code}
                      className="grid h-11 w-11 place-items-center border border-line text-ink-mute transition-colors hover:border-red hover:text-red"
                    >
                      <TrashIcon size={17} />
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>

          <button
            onClick={clear}
            className="mt-5 text-[12px] font-semibold text-ink-mute underline underline-offset-4 transition-colors hover:text-red"
          >
            Vaciar cotización
          </button>
        </ul>

        <aside className="lg:sticky lg:top-[calc(var(--header-h)+24px)] lg:h-fit">
          <div className="border border-line">
            <div className="border-b border-line bg-surface px-5 py-4">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.09em]">
                Mensaje que se envía
              </h2>
            </div>
            <pre className="thin-scroll max-h-[300px] overflow-y-auto whitespace-pre-wrap px-5 py-4 font-mono text-[11.5px] leading-relaxed text-ink-soft">
              {preview}
            </pre>
          </div>

          <div className="mt-4">
            <QuoteButton size="large" />
          </div>

          <p className="mt-3 text-[12px] leading-relaxed text-ink-mute">
            Se abre WhatsApp con la lista ya escrita. No hay pago en línea: el
            equipo de DFG responde con disponibilidad y precio.
          </p>
        </aside>
      </div>
    </div>
  );
}
