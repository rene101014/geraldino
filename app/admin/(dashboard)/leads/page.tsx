import { createClient } from "@/lib/supabase/server";
import { LeadsTable } from "@/components/admin/leads-table";

export default async function AdminLeadsPage() {
  const supabase = await createClient();
  const { data: leads } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Mensajes
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Leads recibidos desde el formulario de contacto del sitio.
      </p>

      <LeadsTable leads={leads ?? []} />
    </div>
  );
}
