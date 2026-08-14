import type { Metadata } from "next";
import { getSiteContent } from "@/lib/data/content";
import { getServices } from "@/lib/data/services";
import { getSocialLinks } from "@/lib/data/social-links";
import { getPortfolioItems } from "@/lib/data/portfolio";
import { getSiteUrl } from "@/lib/seo/site-url";
import { buildOrganizationJsonLd } from "@/lib/seo/jsonld";
import { Hero } from "@/components/site/hero";
import { FeaturedWork } from "@/components/site/featured-work";
import { BioSection } from "@/components/site/bio-section";
import { ServicesIndex } from "@/components/site/services-index";
import { CtaBand } from "@/components/site/cta-band";

// ISR: generada una vez y servida desde el edge cache de Vercel. Se
// regenera a los 5 min o cuando el admin invalida los tags.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const title = content?.meta_title ?? "Geraldino";
  const description = content?.meta_description ?? "";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: getSiteUrl() },
    openGraph: {
      title,
      description,
      url: getSiteUrl(),
      siteName: content?.brand_name ?? "Geraldino",
      type: "website",
      locale: "es_DO",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function HomePage() {
  const [content, services, socialLinks, portfolioItems] = await Promise.all([
    getSiteContent(),
    getServices(),
    getSocialLinks(),
    getPortfolioItems(),
  ]);

  const brandName = content?.brand_name ?? "Geraldino";
  const founderName = content?.founder_name ?? "Rene Geraldino";

  return (
    <main>
      {content ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildOrganizationJsonLd(content, socialLinks)),
          }}
        />
      ) : null}

      <Hero
        brandName={brandName}
        founderName={founderName}
        heroTitle={content?.hero_title ?? brandName}
        heroSubtitle={content?.hero_subtitle ?? ""}
        heroCtaLabel={content?.hero_cta_label ?? "Ver portafolio"}
      />
      <FeaturedWork items={portfolioItems.slice(0, 5)} />
      <BioSection
        heading={content?.bio_heading ?? "Sobre Geraldino"}
        body={content?.bio_body ?? ""}
        founderName={founderName}
      />
      <ServicesIndex services={services} />
      <CtaBand />
    </main>
  );
}
