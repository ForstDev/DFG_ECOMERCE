"use client";

import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { snap } from "@/lib/motion";

/**
 * Quantity control. The value is editable by keyboard as well as by the two
 * buttons, because buyers type "24" far more often than they press plus 24 times.
 */
export function QtyStepper({
  value,
  onChange,
  compact = false,
  label = "Cantidad",
}: {
  value: number;
  onChange: (n: number) => void;
  compact?: boolean;
  label?: string;
}) {
  const size = compact ? "h-8 w-8" : "h-11 w-11";
  const field = compact ? "h-8 w-11 text-[12px]" : "h-11 w-14 text-[14px]";

  return (
    <div
      className="inline-flex items-stretch border border-line-strong"
      role="group"
      aria-label={label}
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        transition={snap}
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Quitar una unidad"
        className={
          size +
          " grid place-items-center text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:text-line-strong disabled:hover:bg-transparent"
        }
      >
        <MinusIcon size={compact ? 12 : 14} weight="bold" />
      </motion.button>

      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={999}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value.replace(/[^0-9]/g, ""));
          onChange(Number.isFinite(n) && n > 0 ? Math.min(999, n) : 1);
        }}
        aria-label={label}
        className={
          field +
          " code-type border-x border-line-strong bg-paper text-center font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        }
      />

      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        transition={snap}
        onClick={() => onChange(Math.min(999, value + 1))}
        aria-label="Agregar una unidad"
        className={size + " grid place-items-center text-ink transition-colors hover:bg-surface"}
      >
        <PlusIcon size={compact ? 12 : 14} weight="bold" />
      </motion.button>
    </div>
  );
}
