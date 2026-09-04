"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowClockwiseIcon } from "@phosphor-icons/react";

/**
 * Wipes the event log. Two clicks, because the numbers cannot be recovered
 * afterwards and a stray click on a dashboard should never destroy data.
 */
export function ResetEvents() {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [pending, start] = useTransition();

  const reset = async () => {
    await fetch("/api/admin/events", { method: "DELETE" });
    setArmed(false);
    start(() => router.refresh());
  };

  if (!armed) {
    return (
      <button
        onClick={() => setArmed(true)}
        className="inline-flex items-center gap-1.5 border border-line-strong bg-paper px-3.5 py-2.5 text-[12px] font-semibold text-ink-mute transition-colors hover:border-ink hover:text-ink"
      >
        <ArrowClockwiseIcon size={14} weight="bold" />
        Reiniciar métricas
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 border border-red bg-red-wash px-3 py-2">
      <span className="text-[12px] font-semibold text-red-deep">
        Se borra todo el historial
      </span>
      <button
        onClick={reset}
        disabled={pending}
        className="bg-red px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.07em] text-white transition-colors hover:bg-red-deep disabled:opacity-60"
      >
        {pending ? "Borrando" : "Confirmar"}
      </button>
      <button
        onClick={() => setArmed(false)}
        className="px-2 text-[12px] font-semibold text-ink-mute hover:text-ink"
      >
        Cancelar
      </button>
    </div>
  );
}
