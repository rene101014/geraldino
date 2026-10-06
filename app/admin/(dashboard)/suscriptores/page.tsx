import { createClient } from "@/lib/supabase/server";
import { unwrap } from "@/lib/data/fetch-or-throw";
import { SubscribersManager } from "@/components/admin/subscribers-manager";

export const dynamic = "force-dynamic";

export default async function SuscriptoresPage() {
  const supabase = await createClient();
  const res = await supabase
    .from("email_contacts")
    .select("id, email, name, status, source, created_at")
    .order("created_at", { ascending: false })
    .limit(1000);
  const contacts = unwrap(res, "los suscriptores") ?? [];

  const total = contacts.length;
  const activos = contacts.filter((c) => c.status === "subscribed").length;

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Suscriptores</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {activos} activos de {total} contactos. Solo se envían campañas a los suscritos.
      </p>

      <SubscribersManager contacts={contacts} />
    </div>
  );
}
