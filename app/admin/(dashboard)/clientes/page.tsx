import { createClient } from "@/lib/supabase/server";
import { unwrap } from "@/lib/data/fetch-or-throw";
import { ClientForm } from "@/components/admin/client-form";
import { ClientsList } from "@/components/admin/clients-list";

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const res = await supabase
    .from("clients")
    .select("*")
    .order("order_index", { ascending: true });
  const clients = unwrap(res, "los clientes");

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Clientes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Agrega los clientes con los que has trabajado, con o sin logo.
          </p>
        </div>
        <ClientForm />
      </div>

      <ClientsList clients={clients ?? []} />
    </div>
  );
}
