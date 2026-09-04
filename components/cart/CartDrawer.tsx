"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { XIcon, TrashIcon, ShoppingCartSimpleIcon } from "@phosphor-icons/react";
import { useCart } from "./CartProvider";
import { QtyStepper } from "./QtyStepper";
import { QuoteButton } from "./QuoteButton";
import { expo } from "@/lib/motion";

/**
 * The quote basket. It slides over the catalog rather than navigating away, so
 * a buyer building a long list never loses their place in the grid.
 */
export function CartDrawer() {
  const { isOpen, close, lines, units, setQty, remove, clear } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="fixed inset-0 z-[var(--z-drawer)] bg-ink/50 backdrop-blur-[3px]"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={expo(0.5)}
            role="dialog"
            aria-label="Carrito de cotización"
            className="fixed right-0 top-0 z-[var(--z-drawer)] flex h-[100dvh] w-[min(440px,100vw)] flex-col bg-paper"
          >
            <header className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line px-5">
              <div className="flex items-baseline gap-2">
                <h2 className="text-[15px] font-bold uppercase tracking-tight">
                  Cotización
                </h2>
                <span className="code-type text-[12px] text-ink-mute">
                  {lines.length} {lines.length === 1 ? "ítem" : "ítems"} / {units} und
                </span>
              </div>
              <button
                onClick={close}
                aria-label="Cerrar carrito"
                className="grid h-10 w-10 place-items-center text-ink-mute transition-colors hover:text-ink"
              >
                <XIcon size={20} weight="bold" />
              </button>
            </header>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <span className="grid h-16 w-16 place-items-center border border-line text-ink-mute">
                  <ShoppingCartSimpleIcon size={26} weight="light" />
                </span>
                <div>
                  <p className="text-[15px] font-semibold">Todavía no hay repuestos</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-mute">
                    Agrega repuestos desde el catálogo y al terminar envía la lista
                    completa por WhatsApp.
                  </p>
                </div>
                <Link
                  href="/catalogo"
                  onClick={close}
                  className="bg-ink px-5 py-3 text-[12px] font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft"
                >
                  Ir al catálogo
                </Link>
              </div>
            ) : (
              <>
                <ul className="thin-scroll flex-1 overflow-y-auto">
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
                        <div className="flex gap-3 p-4">
                          <Link
                            href={"/producto/" + l.slug}
                            onClick={close}
                            className="photo-plate h-16 w-16 shrink-0 border border-line"
                          >
                            {l.image ? (
                              <Image
                                src={l.image}
                                alt=""
                                width={64}
                                height={64}
                                className="h-full w-full object-contain p-1"
                              />
                            ) : (
                              <span className="code-type text-[9px] text-ink-mute">S/F</span>
                            )}
                          </Link>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={"/producto/" + l.slug}
                              onClick={close}
                              className="code-type block text-[12px] font-bold text-red"
                            >
                              {l.code}
                            </Link>
                            <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug">
                              {l.name}
                            </p>
                            <div className="mt-2.5 flex items-center justify-between gap-2">
                              <QtyStepper
                                value={l.qty}
                                onChange={(n) => setQty(l.slug, n)}
                                compact
                              />
                              <button
                                onClick={() => remove(l.slug)}
                                aria-label={"Quitar " + l.code}
                                className="grid h-8 w-8 place-items-center text-ink-mute transition-colors hover:text-red"
                              >
                                <TrashIcon size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                <footer className="shrink-0 border-t border-line p-4">
                  <QuoteButton onDone={close} />
                  <div className="mt-3 flex items-center justify-between">
                    <Link
                      href="/carrito"
                      onClick={close}
                      className="text-[12px] font-semibold text-ink underline underline-offset-4 hover:text-red"
                    >
                      Ver detalle completo
                    </Link>
                    <button
                      onClick={clear}
                      className="text-[12px] text-ink-mute transition-colors hover:text-red"
                    >
                      Vaciar
                    </button>
                  </div>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
