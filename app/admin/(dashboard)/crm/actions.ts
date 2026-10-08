"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import { crmAccountSchema, crmProjectSchema } from "@/lib/validations/crm";

type DB = SupabaseClient<Database>;

export type CrmFormState = {
  error: string | null;
  success: boolean;
  id?: string;
};

// ---------------------------------------------------------------------------
// Cuentas (clientes / agencias)
// ---------------------------------------------------------------------------

function parseAccount(formData: FormData) {
  return crmAccountSchema.safeParse({
    type: formData.get("type"),
    parent_id: formData.get("parent_id"),
    name: formData.get("name"),
    contact_name: formData.get("contact_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    rnc: formData.get("rnc"),
    address: formData.get("address"),
    website_url: formData.get("website_url"),
    notes: formData.get("notes"),
    status: formData.get("status") || "activo",
  });
}

// Un parent_id solo es válido si apunta a una agencia (no a un particular ni a
// otro sub-cliente). El check de "una agencia no tiene padre" ya lo hace zod.
async function parentIsAgency(supabase: DB, parentId: string): Promise<boolean> {
  const { data } = await supabase
    .from("crm_accounts")
    .select("type")
    .eq("id", parentId)
    .single();
  return data?.type === "agencia";
}

export async function createAccount(
  _prev: CrmFormState,
  formData: FormData,
): Promise<CrmFormState> {
  const parsed = parseAccount(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los campos.",
      success: false,
    };
  }
  const d = parsed.data;

  const supabase = await createClient();

  if (d.parent_id) {
    if (!(await parentIsAgency(supabase, d.parent_id))) {
      return {
        error: "Un sub-cliente solo puede pertenecer a una agencia.",
        success: false,
      };
    }
  }

  const { data, error } = await supabase
    .from("crm_accounts")
    .insert({
      type: d.type,
      parent_id: d.parent_id,
      name: d.name,
      contact_name: d.contact_name,
      email: d.email,
      phone: d.phone,
      whatsapp: d.whatsapp,
      rnc: d.rnc,
      address: d.address,
      website_url: d.website_url,
      notes: d.notes,
      status: d.status,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "No se pudo crear el cliente. Intenta de nuevo.", success: false };
  }

  revalidatePath("/admin/crm");
  if (d.parent_id) revalidatePath(`/admin/crm/${d.parent_id}`);
  return { error: null, success: true, id: data.id };
}

export async function updateAccount(
  id: string,
  _prev: CrmFormState,
  formData: FormData,
): Promise<CrmFormState> {
  const parsed = parseAccount(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los campos.",
      success: false,
    };
  }
  const d = parsed.data;

  const supabase = await createClient();

  if (d.parent_id) {
    if (d.parent_id === id) {
      return { error: "Una cuenta no puede ser su propio padre.", success: false };
    }
    if (!(await parentIsAgency(supabase, d.parent_id))) {
      return {
        error: "Un sub-cliente solo puede pertenecer a una agencia.",
        success: false,
      };
    }
  }

  const { error } = await supabase
    .from("crm_accounts")
    .update({
      type: d.type,
      parent_id: d.parent_id,
      name: d.name,
      contact_name: d.contact_name,
      email: d.email,
      phone: d.phone,
      whatsapp: d.whatsapp,
      rnc: d.rnc,
      address: d.address,
      website_url: d.website_url,
      notes: d.notes,
      status: d.status,
    })
    .eq("id", id);

  if (error) {
    return { error: "No se pudo guardar. Intenta de nuevo.", success: false };
  }

  revalidatePath("/admin/crm");
  revalidatePath(`/admin/crm/${id}`);
  return { error: null, success: true, id };
}

export async function deleteAccount(id: string) {
  const supabase = await createClient();
  // on delete cascade borra sub-clientes y sus trabajos. Las galerías enlazadas
  // quedan (project_id -> null) porque el FK es on delete set null.
  await supabase.from("crm_accounts").delete().eq("id", id);
  revalidatePath("/admin/crm");
}

// ---------------------------------------------------------------------------
// Trabajos (proyectos)
// ---------------------------------------------------------------------------

function parseProject(formData: FormData) {
  return crmProjectSchema.safeParse({
    account_id: formData.get("account_id"),
    title: formData.get("title"),
    description: formData.get("description"),
    service_id: formData.get("service_id"),
    status: formData.get("status") || "propuesta",
    start_date: formData.get("start_date"),
    due_date: formData.get("due_date"),
    budget_amount: formData.get("budget_amount"),
    currency: formData.get("currency") || "DOP",
    notes: formData.get("notes"),
  });
}

export async function createProject(
  _prev: CrmFormState,
  formData: FormData,
): Promise<CrmFormState> {
  const parsed = parseProject(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los campos.",
      success: false,
    };
  }
  const d = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crm_projects")
    .insert({
      account_id: d.account_id,
      title: d.title,
      description: d.description,
      service_id: d.service_id,
      status: d.status,
      start_date: d.start_date,
      due_date: d.due_date,
      budget_amount: d.budget_amount,
      currency: d.currency,
      notes: d.notes,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "No se pudo crear el trabajo. Intenta de nuevo.", success: false };
  }

  revalidatePath(`/admin/crm/${d.account_id}`);
  return { error: null, success: true, id: data.id };
}

export async function updateProject(
  id: string,
  _prev: CrmFormState,
  formData: FormData,
): Promise<CrmFormState> {
  const parsed = parseProject(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los campos.",
      success: false,
    };
  }
  const d = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("crm_projects")
    .update({
      title: d.title,
      description: d.description,
      service_id: d.service_id,
      status: d.status,
      start_date: d.start_date,
      due_date: d.due_date,
      budget_amount: d.budget_amount,
      currency: d.currency,
      notes: d.notes,
    })
    .eq("id", id);

  if (error) {
    return { error: "No se pudo guardar. Intenta de nuevo.", success: false };
  }

  revalidatePath(`/admin/crm/${d.account_id}`);
  return { error: null, success: true, id };
}

export async function setProjectStatus(
  id: string,
  accountId: string,
  status: string,
) {
  const supabase = await createClient();
  await supabase.from("crm_projects").update({ status }).eq("id", id);
  revalidatePath(`/admin/crm/${accountId}`);
}

export async function deleteProject(id: string, accountId: string) {
  const supabase = await createClient();
  await supabase.from("crm_projects").delete().eq("id", id);
  revalidatePath(`/admin/crm/${accountId}`);
}

// ---------------------------------------------------------------------------
// Enlace de galerías a un trabajo
// ---------------------------------------------------------------------------

export async function linkGalleryToProject(
  galleryId: string,
  projectId: string | null,
  accountId: string,
) {
  const supabase = await createClient();
  await supabase
    .from("galleries")
    .update({ project_id: projectId })
    .eq("id", galleryId);
  revalidatePath(`/admin/crm/${accountId}`);
  revalidatePath("/admin/galerias");
}
