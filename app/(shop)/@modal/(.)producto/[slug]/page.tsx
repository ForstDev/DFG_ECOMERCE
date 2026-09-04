import { notFound } from "next/navigation";
import { getProduct } from "@/lib/catalog";
import { QuickViewShell } from "@/components/product/QuickViewShell";
import { ProductDetail } from "@/components/product/ProductDetail";

export const dynamic = "force-dynamic";

/**
 * Quick view. This route intercepts a click on a product card so the detail
 * opens over the catalog, keeping the grid, the scroll position and the filters
 * exactly where the buyer left them. A cold load of the same URL falls through
 * to app/producto/[slug] and renders the full page.
 */
export default async function QuickViewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <QuickViewShell>
      <ProductDetail product={product} compact sharedLayout />
    </QuickViewShell>
  );
}
