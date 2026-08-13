import { getSiteContent } from "@/lib/data/content";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getSiteContent();
  const brandName = content?.brand_name ?? "Geraldino";

  return (
    <>
      <SiteHeader brandName={brandName} />
      {children}
      <SiteFooter brandName={brandName} />
    </>
  );
}
