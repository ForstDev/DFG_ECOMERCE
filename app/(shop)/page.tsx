import { getCatalog } from "@/lib/catalog";
import { getSystems } from "@/lib/systems";
import { Hero } from "@/components/home/Hero";
import { ScaleStrip } from "@/components/home/ScaleStrip";
import { FamilyBento } from "@/components/home/FamilyBento";
import { SystemsMap } from "@/components/home/SystemsMap";
import { BrandRail } from "@/components/home/BrandRail";
import { Reasons } from "@/components/home/Reasons";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const catalog = getCatalog();
  const systems = getSystems();

  return (
    <>
      <Hero products={catalog.totals.products} families={catalog.totals.families} />

      <ScaleStrip
        products={catalog.totals.products}
        families={catalog.totals.families}
        brands={catalog.totals.brands}
        images={catalog.totals.images}
      />

      <FamilyBento families={catalog.families} />

      <SystemsMap systems={systems} />

      <BrandRail brands={catalog.brands} />

      <Reasons />
    </>
  );
}
