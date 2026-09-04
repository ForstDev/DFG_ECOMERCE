"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/**
 * The size of the catalog, counted up once when the strip enters view.
 *
 * These are real figures read off the generated catalog, so the component is
 * built to never show a wrong one. The true value is what renders on the
 * server and what the resting state holds; the count-up is an enhancement laid
 * over it, and a timer that does not depend on the frame loop forces the final
 * value in case the animation is interrupted or never advances. A stat tile
 * frozen at "379 repuestos" would be worse than one that never animated.
 */
function Ticker({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [shown, setShown] = useState(value);
  // A ref, not state: whether the count-up already ran is bookkeeping, and
  // storing it in state would re-render the tile for nothing.
  const hasRun = useRef(false);

  useEffect(() => {
    if (!inView || reduce || hasRun.current) return;
    hasRun.current = true;

    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setShown(Math.round(v)),
      onComplete: () => setShown(value),
    });

    // Safety net, on a timer rather than on a frame: whatever happens to the
    // animation, the tile is showing the real number a moment later.
    const guard = window.setTimeout(() => {
      controls.stop();
      setShown(value);
    }, 2200);

    return () => {
      controls.stop();
      window.clearTimeout(guard);
      setShown(value);
    };
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className="code-type tabular-nums">
      {shown.toLocaleString("es")}
    </span>
  );
}

export function ScaleStrip({
  products,
  families,
  brands,
  images,
}: {
  products: number;
  families: number;
  brands: number;
  images: number;
}) {
  const stats = [
    { value: products, label: "Repuestos en catálogo" },
    { value: families, label: "Familias de producto" },
    { value: brands, label: "Líneas de camión" },
    { value: images, label: "Fotografías de producto" },
  ];

  return (
    <section className="border-b border-line bg-surface">
      <div className="shell grid grid-cols-2 gap-px bg-line md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface px-4 py-8 md:px-6 md:py-12">
            <p className="text-[34px] font-extrabold leading-none tracking-tight text-ink md:text-[52px]">
              <Ticker value={s.value} />
            </p>
            <p className="mt-2 text-[11.5px] font-semibold uppercase leading-tight tracking-[0.08em] text-ink-mute">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
