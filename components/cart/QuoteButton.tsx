"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { useCart } from "./CartProvider";
import { buildQuoteUrl } from "@/lib/wa";
import { track } from "@/lib/track";
import { snap } from "@/lib/motion";

/**
 * There is no payment gateway in this build. The cart ends in a WhatsApp quote
 * request with the full item list and quantities, which is how DFG sells today.
 */
export function QuoteButton({
  onDone,
  size = "default",
}: {
  onDone?: () => void;
  size?: "default" | "large";
}) {
  const { lines, units, settings } = useCart();
  const [sending, setSending] = useState(false);

  const disabled = lines.length === 0 || sending;

  const send = () => {
    if (disabled) return;
    setSending(true);
    track({ type: "quote", lines: lines.length, units });
    window.open(buildQuoteUrl(lines, settings), "_blank", "noopener,noreferrer");
    // The tab opens immediately; the flag only guards a double click.
    window.setTimeout(() => {
      setSending(false);
      onDone?.();
    }, 600);
  };

  return (
    <motion.button
      type="button"
      onClick={send}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.985 }}
      transition={snap}
      className={
        "flex w-full items-center justify-center gap-2.5 bg-red font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-red-deep disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-white " +
        (size === "large" ? "px-6 py-5 text-[14px]" : "px-5 py-4 text-[12.5px]")
      }
    >
      <WhatsappLogoIcon size={size === "large" ? 22 : 18} weight="fill" />
      {sending ? "Abriendo WhatsApp" : "Cotizar por WhatsApp"}
    </motion.button>
  );
}
