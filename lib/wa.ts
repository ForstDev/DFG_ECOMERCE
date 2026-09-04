import type { CartLine, Settings } from "./types";

/**
 * Builds the WhatsApp quote message. There is no payment gateway in this build,
 * by design: the cart ends in a quote request, which is how DFG actually sells.
 */
export function buildQuoteMessage(lines: CartLine[], settings: Settings): string {
  const rows = lines.map(
    (l, i) => `${i + 1}. ${l.code} - ${l.name}${l.brandLabel ? ` (${l.brandLabel})` : ""} | Cant: ${l.qty}`,
  );
  const units = lines.reduce((n, l) => n + l.qty, 0);

  return [
    settings.quoteIntro,
    "",
    ...rows,
    "",
    `Total: ${lines.length} ${lines.length === 1 ? "ítem" : "ítems"} / ${units} ${units === 1 ? "unidad" : "unidades"}`,
  ].join("\n");
}

export function buildQuoteUrl(lines: CartLine[], settings: Settings): string {
  const phone = settings.whatsapp.replace(/[^0-9]/g, "");
  const text = encodeURIComponent(buildQuoteMessage(lines, settings));
  return `https://wa.me/${phone}?text=${text}`;
}
