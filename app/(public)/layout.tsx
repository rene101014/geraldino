import { getSiteContent } from "@/lib/data/content";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { mediaUrl } from "@/lib/storage/public-url";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getSiteContent();
  const brandName = content?.brand_name ?? "Geraldino";
  const logoUrl = content?.logo_path ? mediaUrl("site", content.logo_path) : null;

  return (
    <>
      <SiteHeader brandName={brandName} logoUrl={logoUrl} />
      {children}
      <SiteFooter brandName={brandName} />
    </>
  );
}
