"use client";

import Link from "next/link";
import { ProductPhoto } from "@/components/product/ProductPhoto";
import { motion } from "motion/react";
import { PlusIcon, CheckIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { expo, snap } from "@/lib/motion";
import type { Product } from "@/lib/types";

/**
 * One catalog result. The photo sits on its own white plate because every DFG
 * product shot is on a white ground; tinting the tile would show a seam.
 *
 * The `layoutId` on the image is what lets the quick-view overlay grow out of
 * the card the user clicked instead of fading in from nowhere.
 */
export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add, open } = useCart();
  const [added, setAdded] = useState(false);
  const image = product.images[0];

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(
      {
        slug: product.slug,
        code: product.code,
        name: product.name,
        image: image ?? "",
        brandLabel: product.brandLabel,
      },
      1,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
    open();
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={expo(0.5, Math.min(index, 11) * 0.035)}
      className="group relative flex flex-col border border-line bg-paper transition-colors duration-300 hover:border-ink"
    >
      <Link
        href={"/producto/" + product.slug}
        scroll={false}
        className="flex flex-1 flex-col focus:outline-none"
      >
        <div className="photo-plate relative aspect-square w-full border-b border-line">
          <motion.div
            layoutId={"photo-" + product.slug}
            className="absolute inset-0"
            transition={expo(0.5)}
          >
            <ProductPhoto
              src={image}
              alt={product.name}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="transition-transform duration-[600ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
            />
          </motion.div>

          {product.subfamily && (
            <span className="absolute left-0 top-0 max-w-[85%] truncate bg-ink/85 px-2 py-1 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {product.subfamily}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5 p-3.5">
          <span className="code-type truncate text-[12.5px] font-bold leading-none text-red">
            {product.code}
          </span>
          <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-ink">
            {product.name}
          </h3>
          <p className="mt-auto truncate pt-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-mute">
            {product.brandLabel || product.family}
          </p>
        </div>
      </Link>

      <motion.button
        type="button"
        onClick={handleAdd}
        whileTap={{ scale: 0.97 }}
        transition={snap}
        aria-label={"Agregar " + product.code + " a la cotización"}
        className={
          "flex items-center justify-center gap-1.5 border-t border-line py-2.5 text-[11px] font-bold uppercase tracking-[0.09em] transition-colors " +
          (added
            ? "bg-ink text-paper"
            : "bg-paper text-ink hover:bg-red hover:text-white")
        }
      >
        {added ? (
          <>
            <CheckIcon size={13} weight="bold" /> Agregado
          </>
        ) : (
          <>
            <PlusIcon size={13} weight="bold" /> Cotizar
          </>
        )}
      </motion.button>
    </motion.article>
  );
}
