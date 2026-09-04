import { SmoothScroll } from "@/components/site/SmoothScroll";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { getFamilies } from "@/lib/catalog";
import { readSettings } from "@/lib/store";

/**
 * The storefront shell. The admin area sits outside this group so it never
 * inherits the shop chrome, the cart or the smooth-scroll rig.
 *
 * `modal` is a parallel slot: a click on a product card is intercepted into it
 * and renders as a quick view over the catalog, while a cold URL falls through
 * to the standalone page.
 */
export default function ShopLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const families = getFamilies();
  const settings = readSettings();

  return (
    <CartProvider settings={settings}>
      <SmoothScroll />
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Ir al contenido
      </a>
      <Header families={families} />
      <main id="contenido" className="min-h-[60vh]">
        {children}
      </main>
      {modal}
      <CartDrawer />
      <Footer families={families} settings={settings} />
    </CartProvider>
  );
}
