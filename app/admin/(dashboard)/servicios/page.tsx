import { createClient } from "@/lib/supabase/server";
import { ServicesTable } from "@/components/admin/services-table";

export default async function AdminServicesPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("order_index", { ascending: true });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Servicios
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Edita el texto, el orden y la visibilidad de cada servicio.
      </p>

      <div className="mt-8">
        <ServicesTable services={services ?? []} />
      </div>
    </div>
  );
}
