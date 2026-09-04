"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductPhoto } from "./ProductPhoto";
import { AnimatePresence, motion } from "motion/react";
import { ImageBrokenIcon, MagnifyingGlassPlusIcon } from "@phosphor-icons/react";
import { expo } from "@/lib/motion";

/**
 * Product photography viewer. The plate stays pure white at every size because
 * the source shots are cut out on white; any tint would show the edge of the
 * photo. Zoom is pointer-tracked rather than a modal, so the buyer can compare
 * a thread or a bore without losing the page.
 */
export function Gallery({
  images,
  alt,
  slug,
  sharedLayout = false,
}: {
  images: string[];
  alt: string;
  slug: string;
  sharedLayout?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  const current = images[index];

  if (!current) {
    return (
      <div className="photo-plate aspect-square w-full border border-line">
        <div className="flex flex-col items-center gap-3 text-line-strong">
          <ImageBrokenIcon size={44} weight="light" />
          <p className="label text-ink-mute">Sin fotografía</p>
        </div>
      </div>
    );
  }

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoom) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setOrigin(x + "% " + y + "%");
  };

  const Frame = sharedLayout ? motion.div : "div";
  const frameProps = sharedLayout
    ? { layoutId: "photo-" + slug, transition: expo(0.5) }
    : {};

  return (
    <div className="flex flex-col gap-3">
      <div
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
        className="photo-plate group relative aspect-square w-full cursor-zoom-in border border-line"
      >
        <Frame {...frameProps} className="absolute inset-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <div
                style={{
                  transformOrigin: origin,
                  transform: zoom ? "scale(2)" : "scale(1)",
                }}
                className="absolute inset-0 transition-transform duration-300 ease-[var(--ease-out-expo)]"
              >
                <ProductPhoto
                  src={current}
                  alt={alt}
                  priority
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  padding="p-6 md:p-10"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </Frame>

        <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 bg-ink/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <MagnifyingGlassPlusIcon size={12} weight="bold" />
          Zoom
        </span>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setIndex(i)}
              aria-label={"Ver foto " + (i + 1)}
              aria-pressed={i === index}
              className={
                "photo-plate relative h-20 w-20 border transition-colors " +
                (i === index ? "border-ink" : "border-line hover:border-line-strong")
              }
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="80px"
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
