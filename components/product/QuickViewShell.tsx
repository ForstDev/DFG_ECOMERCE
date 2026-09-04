"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { XIcon } from "@phosphor-icons/react";
import { expo } from "@/lib/motion";

/**
 * The white sheet the quick view lives in.
 *
 * It is mounted by an intercepting route, so clicking a card from the catalog
 * opens this overlay while the grid stays alive underneath, and pasting the
 * same URL cold renders the full page instead. The ground is white because the
 * product photography is white; a dim scrim sits behind the sheet, never on it.
 */
export function QuickViewShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    // Move focus into the sheet so keyboard users are not left behind the scrim.
    sheetRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [router]);

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-start justify-center overflow-y-auto overscroll-contain">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.28 }}
        onClick={() => router.back()}
        className="fixed inset-0 bg-ink/55 backdrop-blur-[3px]"
        aria-hidden="true"
      />

      <motion.div
        ref={sheetRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Detalle del repuesto"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={expo(0.55)}
        className="relative my-4 w-[min(1180px,calc(100vw-1.5rem))] bg-paper shadow-[0_40px_120px_-30px_rgba(11,11,12,0.7)] focus:outline-none md:my-10"
      >
        <button
          onClick={() => router.back()}
          aria-label="Cerrar detalle"
          className="absolute right-0 top-0 z-10 grid h-12 w-12 place-items-center bg-ink text-paper transition-colors hover:bg-red"
        >
          <XIcon size={20} weight="bold" />
        </button>

        <div className="p-5 md:p-10">{children}</div>
      </motion.div>
    </div>
  );
}
