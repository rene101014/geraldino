import { getSiteUrl } from "@/lib/seo/site-url";
import type { SiteContent } from "@/lib/data/content";
import type { SocialLink } from "@/lib/data/social-links";

export function buildOrganizationJsonLd(
  content: SiteContent,
  socialLinks: SocialLink[],
) {
  const siteUrl = getSiteUrl();
  const sameAs = socialLinks
    .filter((link) => link.url)
    .map((link) => link.url);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: content.brand_name,
    url: siteUrl,
    description: content.meta_description,
    founder: {
      "@type": "Person",
      name: content.founder_name,
    },
    areaServed: "República Dominicana",
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(content.contact_email ? { email: content.contact_email } : {}),
    ...(content.contact_phone ? { telephone: content.contact_phone } : {}),
  };
}
