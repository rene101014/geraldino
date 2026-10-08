import { createClient } from "@/lib/supabase/server";
import { unwrap } from "@/lib/data/fetch-or-throw";
import { buildAccountTree, type CrmAccount } from "@/lib/data/crm";
import { CrmAccountForm } from "@/components/admin/crm-account-form";
import { CrmAccountsList } from "@/components/admin/crm-accounts-list";

export default async function AdminCrmPage() {
  const supabase = await createClient();

  const res = await supabase
    .from("crm_accounts")
    .select("*")
    .order("name", { ascending: true });
  const accounts = (unwrap(res, "los clientes del CRM") ?? []) as CrmAccount[];

  const tree = buildAccountTree(accounts);
  const agencies = accounts
    .filter((a) => a.type === "agencia")
    .map((a) => ({ id: a.id, name: a.name }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            CRM
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona tus clientes y agencias, y envíales trabajos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CrmAccountForm defaultType="agencia" agencies={agencies} />
          <CrmAccountForm defaultType="particular" agencies={agencies} />
        </div>
      </div>

      <CrmAccountsList accounts={tree} />
    </div>
  );
}
