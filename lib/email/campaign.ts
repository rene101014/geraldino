import { createServiceClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/email/ses";
import { htmlToText } from "@/lib/email/mime";

// Tamaño de lote por invocación del cron. Conservador para no exceder el límite
// de tiempo de las funciones de Vercel ni el rate de envío de SES. Ajustable por
// entorno cuando SES suba tu cuota.
const BATCH_SIZE = Number(process.env.EMAIL_BATCH_SIZE ?? 30);

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
}

function unsubscribeUrl(token: string): string {
  return `${siteUrl()}/unsubscribe/${token}`;
}

// Reemplaza variables simples en el cuerpo por destinatario.
function render(html: string, vars: { unsubscribe_url: string; name: string; email: string }): string {
  return html
    .replaceAll("{{unsubscribe_url}}", vars.unsubscribe_url)
    .replaceAll("{{name}}", vars.name)
    .replaceAll("{{email}}", vars.email);
}

// Pasa una campaña 'draft' a 'queued': crea una fila en email_sends por cada
// destinatario (suscriptores activos, filtrados por lista si la campaña tiene
// una). A partir de aquí el cron la va enviando por lotes.
export async function enqueueCampaign(campaignId: string): Promise<number> {
  const supabase = createServiceClient();

  const { data: campaign, error: cErr } = await supabase
    .from("email_campaigns")
    .select("id, status, list_id")
    .eq("id", campaignId)
    .single();
  if (cErr || !campaign) throw new Error("Campaña no encontrada");
  if (campaign.status !== "draft") {
    throw new Error("Solo se puede encolar una campaña en borrador");
  }

  // Destinatarios: contactos activos, opcionalmente de una lista.
  let contacts: { id: string }[];
  if (campaign.list_id) {
    const { data, error } = await supabase
      .from("email_list_contacts")
      .select("email_contacts!inner(id, status)")
      .eq("list_id", campaign.list_id)
      .eq("email_contacts.status", "subscribed");
    if (error) throw new Error(error.message);
    contacts = (data ?? []).map((r) => {
      const c = r.email_contacts as unknown as { id: string };
      return { id: c.id };
    });
  } else {
    const { data, error } = await supabase
      .from("email_contacts")
      .select("id")
      .eq("status", "subscribed");
    if (error) throw new Error(error.message);
    contacts = data ?? [];
  }

  if (contacts.length === 0) throw new Error("No hay destinatarios activos");

  // Trae los emails de una vez para la instantánea en email_sends.
  const ids = contacts.map((c) => c.id);
  const { data: full, error: fErr } = await supabase
    .from("email_contacts")
    .select("id, email")
    .in("id", ids);
  if (fErr) throw new Error(fErr.message);

  const rows = (full ?? []).map((c) => ({
    campaign_id: campaignId,
    contact_id: c.id,
    email: c.email,
    status: "pending" as const,
  }));

  // Inserta en bloques para no mandar un INSERT gigantesco.
  for (let i = 0; i < rows.length; i += 500) {
    const slice = rows.slice(i, i + 500);
    const { error } = await supabase.from("email_sends").insert(slice);
    if (error) throw new Error(error.message);
  }

  const { error: uErr } = await supabase
    .from("email_campaigns")
    .update({
      status: "queued",
      total_recipients: rows.length,
      queued_at: new Date().toISOString(),
    })
    .eq("id", campaignId);
  if (uErr) throw new Error(uErr.message);

  return rows.length;
}

export interface BatchResult {
  campaignId: string | null;
  processed: number;
  sent: number;
  failed: number;
  remaining: number;
  done: boolean;
}

// Procesa un lote de envíos pendientes de la campaña más antigua en cola.
// Pensado para ejecutarse cada minuto por el cron de Vercel hasta vaciar la cola.
export async function processCampaignBatch(): Promise<BatchResult> {
  const supabase = createServiceClient();

  // Toma la campaña más antigua que esté en cola o enviándose.
  const { data: campaign } = await supabase
    .from("email_campaigns")
    .select("id, subject, from_name, from_email, reply_to, html, text_body, status")
    .in("status", ["queued", "sending"])
    .order("queued_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!campaign) {
    return { campaignId: null, processed: 0, sent: 0, failed: 0, remaining: 0, done: true };
  }

  if (campaign.status === "queued") {
    await supabase
      .from("email_campaigns")
      .update({ status: "sending" })
      .eq("id", campaign.id);
  }

  // Siguiente lote de pendientes, con el token de baja de cada contacto.
  const { data: pending, error } = await supabase
    .from("email_sends")
    .select("id, email, contact_id, email_contacts(name, unsubscribe_token)")
    .eq("campaign_id", campaign.id)
    .eq("status", "pending")
    .limit(BATCH_SIZE);
  if (error) throw new Error(error.message);

  let sent = 0;
  let failed = 0;

  for (const row of pending ?? []) {
    const contact = row.email_contacts as unknown as
      | { name: string | null; unsubscribe_token: string }
      | null;
    // El enlace de baja lleva el id del envío (?s=) para poder atribuir la baja
    // a esta campaña en las estadísticas.
    const unsub = contact
      ? `${unsubscribeUrl(contact.unsubscribe_token)}?s=${row.id}`
      : siteUrl();
    const vars = {
      unsubscribe_url: unsub,
      name: contact?.name ?? "",
      email: row.email,
    };
    const html = render(campaign.html, vars);
    const text = campaign.text_body
      ? render(campaign.text_body, vars)
      : htmlToText(html);

    try {
      const messageId = await sendEmail({
        fromName: campaign.from_name,
        fromEmail: campaign.from_email,
        to: row.email,
        subject: campaign.subject,
        html,
        text,
        replyTo: campaign.reply_to,
        unsubscribeUrl: unsub,
      });
      await supabase
        .from("email_sends")
        .update({
          status: "sent",
          ses_message_id: messageId,
          sent_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      sent++;
    } catch (e) {
      await supabase
        .from("email_sends")
        .update({
          status: "failed",
          error: e instanceof Error ? e.message : "Error desconocido",
        })
        .eq("id", row.id);
      failed++;
    }
  }

  // ¿Quedan pendientes?
  const { count: remaining } = await supabase
    .from("email_sends")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campaign.id)
    .eq("status", "pending");

  const done = (remaining ?? 0) === 0;
  if (done) {
    await supabase
      .from("email_campaigns")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", campaign.id);
  }

  return {
    campaignId: campaign.id,
    processed: (pending ?? []).length,
    sent,
    failed,
    remaining: remaining ?? 0,
    done,
  };
}
