import type { Database } from "@/types/database.types";

export type CrmAccount = Database["public"]["Tables"]["crm_accounts"]["Row"];
export type CrmProject = Database["public"]["Tables"]["crm_projects"]["Row"];

export type CrmAccountWithChildren = CrmAccount & {
  children: CrmAccount[];
};

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  agencia: "Agencia",
  particular: "Particular",
};

export const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  activo: "Activo",
  prospecto: "Prospecto",
  inactivo: "Inactivo",
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  propuesta: "Propuesta",
  en_progreso: "En progreso",
  entregado: "Entregado",
  cerrado: "Cerrado",
  cancelado: "Cancelado",
};

// Agrupa las cuentas de nivel superior (agencias y particulares directos) y
// cuelga de cada agencia sus sub-clientes. Recibe la lista plana tal cual
// viene de Supabase.
export function buildAccountTree(
  accounts: CrmAccount[],
): CrmAccountWithChildren[] {
  const childrenByParent = new Map<string, CrmAccount[]>();
  for (const a of accounts) {
    if (a.parent_id) {
      const list = childrenByParent.get(a.parent_id) ?? [];
      list.push(a);
      childrenByParent.set(a.parent_id, list);
    }
  }

  return accounts
    .filter((a) => !a.parent_id)
    .map((a) => ({
      ...a,
      children: (childrenByParent.get(a.id) ?? []).sort((x, y) =>
        x.name.localeCompare(y.name),
      ),
    }));
}

// Formatea un monto con su moneda para mostrarlo en la UI.
export function formatMoney(
  amount: number | null,
  currency: string | null,
): string {
  if (amount === null || amount === undefined) return "—";
  const code = currency === "USD" ? "USD" : "DOP";
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 2,
  }).format(amount);
}
