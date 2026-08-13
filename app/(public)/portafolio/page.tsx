import type { Metadata } from "next";
import { Suspense } from "react";
import { getPortfolioItems } from "@/lib/data/portfolio";
import { getSiteUrl } from "@/lib/seo/site-url";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";

export const metadata: Metadata = {
  title: "Portafolio",
  description:
    "Fotografía y video producidos por Geraldino: reels, campañas, producto, vehículos, gastronomía, corporativo y podcast.",
  alternates: { canonical: `${getSiteUrl()}/portafolio` },
};

export default async function PortfolioPage() {
  const items = await getPortfolioItems();

  return (
    <main className="pb-20 pt-36 md:pb-28 md:pt-44">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
          Portafolio
        </p>
        <h1 className="font-heading mt-4 max-w-2xl text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          Lo que se ha producido
        </h1>
      </div>

      <div className="mt-12">
        <Suspense fallback={null}>
          <PortfolioGrid items={items} />
        </Suspense>
      </div>
    </main>
  );
}
