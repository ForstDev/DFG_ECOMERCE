"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { CheckIcon, PlusIcon } from "@phosphor-icons/react";
import { QtyStepper } from "@/components/cart/QtyStepper";
import { useCart } from "@/components/cart/CartProvider";
import { expo, snap } from "@/lib/motion";
import type { Product } from "@/lib/types";

/**
 * `insideOverlay` is set when this renders in the quick view. There the cart
 * drawer must not slide out on its own: it would open behind the overlay and
 * the buyer would only see a sliver of it. Instead the confirmation offers an
 * explicit way through, which closes the quick view first.
 */
export function AddToCart({
  product,
  insideOverlay = false,
}: {
  product: Product;
  insideOverlay?: boolean;
}) {
  const { add, open } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [confirmed, setConfirmed] = useState<number | null>(null);

  const submit = () => {
    const total = add(
      {
        slug: product.slug,
        code: product.code,
        name: product.name,
        image: product.images[0] ?? "",
        brandLabel: product.brandLabel,
      },
      qty,
    );

    setConfirmed(total);
    if (insideOverlay) {
      window.setTimeout(() => setConfirmed(null), 6000);
    } else {
      window.setTimeout(() => setConfirmed(null), 2600);
      open();
    }
  };

  const goToCart = () => {
    router.back();
    // The overlay unmounts on the history pop; opening on the next frame keeps
    // the two animations from fighting over the scroll lock.
    window.setTimeout(open, 260);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-stretch gap-3">
        <QtyStepper value={qty} onChange={setQty} />

        <motion.button
          type="button"
          onClick={submit}
          whileTap={{ scale: 0.985 }}
          transition={snap}
          className="flex flex-1 items-center justify-center gap-2 bg-red px-6 py-3 text-[13px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-deep"
        >
          <PlusIcon size={16} weight="bold" />
          Agregar a la cotización
        </motion.button>
      </div>

      <AnimatePresence>
        {confirmed !== null && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={expo(0.3)}
            role="status"
            className="flex flex-wrap items-center justify-between gap-2 bg-surface px-3 py-2.5"
          >
            <p className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
              <CheckIcon size={14} weight="bold" className="text-red" />
              {confirmed} {confirmed === 1 ? "unidad" : "unidades"} de {product.code} en
              la cotización
            </p>

            {insideOverlay && (
              <button
                onClick={goToCart}
                className="text-[12px] font-bold uppercase tracking-[0.07em] text-ink underline underline-offset-4 transition-colors hover:text-red"
              >
                Ver cotización
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
