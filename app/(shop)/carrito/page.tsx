import type { Metadata } from "next";
import { CartPage } from "@/components/cart/CartPage";

export const metadata: Metadata = {
  title: "Cotización",
  description: "Revisa los repuestos seleccionados y envía la lista completa por WhatsApp.",
};

export default function Page() {
  return <CartPage />;
}
