"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import { generateGalleryToken } from "@/lib/galleries/token";
import { quoteSchema, computeTotals } from "@/lib/validations/quotes";

export type QuoteFormState = {
  error: string | null;
  success: boolean;
  id?: string;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

// Inserta los ítems de una cotización (línea por línea, con su total calculado).
async function insertItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  quoteId: string,
  items: { service_id: string | null; description: string; quantity: number; unit_price: number }[],
) {
  const rows = items.map((it, index) => ({
    quote_id: quoteId,
    service_id: it.service_id,
    description: it.description,
    quantity: it.quantity,
    unit_price: it.unit_price,
    line_total: round2(it.quantity * it.unit_price),
    order_index: index,
  }));
  return supabase.from("crm_quote_items").insert(rows);
}

export async function createQuote(raw: unknown): Promise<QuoteFormState> {
  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los datos.",
      success: false,
    };
  }
  const d = parsed.data;
  const totals = computeTotals(d);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("crm_quotes")
    .insert({
      account_id: d.account_id,
      title: d.title,
      client_name: d.client_name,
      client_email: d.client_email,
      currency: d.currency,
      tax_enabled: d.tax_enabled,
      tax_rate: d.tax_rate,
      discount: d.discount,
      subtotal: totals.subtotal,
      tax_amount: totals.taxAmount,
      total: totals.total,
      valid_until: d.valid_until,
      notes: d.notes,
      terms: d.terms,
      token: generateGalleryToken(),
      status: "borrador",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "No se pudo crear la cotización. Intenta de nuevo.", success: false };
  }

  const itemsRes = await insertItems(supabase, data.id, d.items);
  if (itemsRes.error) {
    // Rollback manual: borramos la cabecera si fallaron los ítems.
    await supabase.from("crm_quotes").delete().eq("id", data.id);
    return { error: "No se pudieron guardar los ítems.", success: false };
  }

  revalidatePath("/admin/cotizaciones");
  return { error: null, success: true, id: data.id };
}

export async function updateQuote(id: string, raw: unknown): Promise<QuoteFormState> {
  const parsed = quoteSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los datos.",
      success: false,
    };
  }
  const d = parsed.data;
  const totals = computeTotals(d);

  const supabase = await createClient();
  const { error } = await supabase
    .from("crm_quotes")
    .update({
      account_id: d.account_id,
      title: d.title,
      client_name: d.client_name,
      client_email: d.client_email,
      currency: d.currency,
      tax_enabled: d.tax_enabled,
      tax_rate: d.tax_rate,
      discount: d.discount,
      subtotal: totals.subtotal,
      tax_amount: totals.taxAmount,
      total: totals.total,
      valid_until: d.valid_until,
      notes: d.notes,
      terms: d.terms,
    })
    .eq("id", id);

  if (error) {
    return { error: "No se pudo guardar. Intenta de nuevo.", success: false };
  }

  // Reemplazamos los ítems (estrategia simple y consistente).
  await supabase.from("crm_quote_items").delete().eq("quote_id", id);
  const itemsRes = await insertItems(supabase, id, d.items);
  if (itemsRes.error) {
    return { error: "Se guardó la cotización pero fallaron los ítems.", success: false };
  }

  revalidatePath("/admin/cotizaciones");
  revalidatePath(`/admin/cotizaciones/${id}`);
  return { error: null, success: true, id };
}

export async function setQuoteStatus(id: string, status: string) {
  const supabase = await createClient();
  const patch: Database["public"]["Tables"]["crm_quotes"]["Update"] = { status };
  if (status === "enviada") patch.sent_at = new Date().toISOString();
  if (status === "aceptada") patch.accepted_at = new Date().toISOString();
  if (status === "rechazada") patch.rejected_at = new Date().toISOString();
  await supabase.from("crm_quotes").update(patch).eq("id", id);
  revalidatePath("/admin/cotizaciones");
  revalidatePath(`/admin/cotizaciones/${id}`);
}

export async function deleteQuote(id: string) {
  const supabase = await createClient();
  await supabase.from("crm_quotes").delete().eq("id", id);
  revalidatePath("/admin/cotizaciones");
}

// Convierte una cotización en un trabajo del CRM y las enlaza.
export async function convertQuoteToProject(
  id: string,
): Promise<{ error: string | null; accountId?: string; projectId?: string }> {
  const supabase = await createClient();

  const { data: quote } = await supabase
    .from("crm_quotes")
    .select("id, account_id, title, total, currency, project_id")
    .eq("id", id)
    .single();

  if (!quote) return { error: "No se encontró la cotización." };
  if (!quote.account_id) {
    return { error: "La cotización no tiene un cliente del CRM asociado." };
  }
  if (quote.project_id) {
    return {
      error: null,
      accountId: quote.account_id,
      projectId: quote.project_id,
    };
  }

  const { data: project, error } = await supabase
    .from("crm_projects")
    .insert({
      account_id: quote.account_id,
      title: quote.title,
      status: "en_progreso",
      budget_amount: quote.total,
      currency: quote.currency,
      notes: `Creado desde la cotización.`,
    })
    .select("id")
    .single();

  if (error || !project) {
    return { error: "No se pudo crear el trabajo." };
  }

  await supabase
    .from("crm_quotes")
    .update({ project_id: project.id })
    .eq("id", id);

  revalidatePath(`/admin/crm/${quote.account_id}`);
  revalidatePath(`/admin/cotizaciones/${id}`);
  return { error: null, accountId: quote.account_id, projectId: project.id };
}
