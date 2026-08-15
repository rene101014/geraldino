import { createClient } from "@/lib/supabase/server";
import { unwrap } from "@/lib/data/fetch-or-throw";
import { MediaUploader } from "@/components/admin/media-uploader";
import { PortfolioList } from "@/components/admin/portfolio-list";

export default async function AdminPortfolioPage() {
  const supabase = await createClient();

  const [itemsRes, servicesRes] = await Promise.all([
    supabase
      .from("portfolio_items")
      .select("*")
      .order("order_index", { ascending: true }),
    supabase
      .from("services")
      .select("title")
      .eq("is_addon", false)
      .order("order_index", { ascending: true }),
  ]);
  const items = unwrap(itemsRes, "el portafolio");
  const services = unwrap(servicesRes, "los servicios");

  const categories = (services ?? []).map((s) => s.title);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Portafolio
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sube y organiza las fotos y videos publicados en el sitio.
          </p>
        </div>
        <MediaUploader categories={categories} />
      </div>

      <PortfolioList items={items ?? []} />
    </div>
  );
}
