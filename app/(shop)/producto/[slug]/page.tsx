import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduct, getRelated } from "@/lib/catalog";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Repuesto no encontrado" };

  return {
    title: product.code + " " + product.name,
    description:
      product.name +
      (product.brandLabel ? " para " + product.brandLabel : "") +
      (product.application ? ". Aplicación: " + product.application : ""),
    openGraph: {
      title: product.code + " " + product.name,
      images: product.images.length ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = getRelated(product, 8);

  return (
    <>
      <ProductDetail product={product} />

      {related.length > 0 && (
        <section className="shell mt-20">
          <Reveal>
            <div className="flex items-end justify-between gap-6 border-b border-line pb-4">
              <h2 className="text-[22px] font-bold uppercase tracking-tight md:text-[30px]">
                Repuestos relacionados
              </h2>
              <Link
                href={"/catalogo?familia=" + encodeURIComponent(product.family)}
                className="shrink-0 text-[12px] font-bold uppercase tracking-[0.08em] text-ink underline underline-offset-4 transition-colors hover:text-red"
              >
                Ver familia
              </Link>
            </div>
          </Reveal>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 xl:gap-4">
            {related.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
