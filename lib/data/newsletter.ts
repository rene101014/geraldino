import { createServiceClient } from "@/lib/supabase/service";

export interface CampaignStats {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  failed: number;
  unsubscribed: number;
}

// Cuenta filas de email_sends de una campaña con un filtro dado. El builder de
// Supabase tiene genéricos muy encadenados; aquí el filtro se tipa laxo a
// propósito para no pelear con ellos.
async function countSends(
  supabase: ReturnType<typeof createServiceClient>,
  campaignId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apply: (q: any) => any,
): Promise<number> {
  const base = supabase
    .from("email_sends")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campaignId);
  const { count } = (await apply(base)) as { count: number | null };
  return count ?? 0;
}

// Estadísticas agregadas de una campaña, calculadas desde email_sends.
export async function getCampaignStats(campaignId: string): Promise<CampaignStats> {
  const supabase = createServiceClient();

  const [total, delivered, opened, clicked, bounced, complained, failed, unsubscribed] =
    await Promise.all([
      countSends(supabase, campaignId, (q) => q),
      countSends(supabase, campaignId, (q) => q.not("delivered_at", "is", null)),
      countSends(supabase, campaignId, (q) => q.not("opened_at", "is", null)),
      countSends(supabase, campaignId, (q) => q.not("clicked_at", "is", null)),
      countSends(supabase, campaignId, (q) => q.eq("status", "bounced")),
      countSends(supabase, campaignId, (q) => q.eq("status", "complained")),
      countSends(supabase, campaignId, (q) => q.eq("status", "failed")),
      countSends(supabase, campaignId, (q) => q.not("unsubscribed_at", "is", null)),
    ]);

  // "sent" = aceptados por SES (todo lo que no quedó pendiente ni falló).
  const sent = total - failed;

  return { total, sent, delivered, opened, clicked, bounced, complained, failed, unsubscribed };
}

export interface ContactCounts {
  subscribed: number;
  unsubscribed: number;
  bounced: number;
  complained: number;
}

// Conteo de contactos por estado para el encabezado de la sección.
export async function getContactCounts(): Promise<ContactCounts> {
  const supabase = createServiceClient();
  const statuses = ["subscribed", "unsubscribed", "bounced", "complained"] as const;
  const results = await Promise.all(
    statuses.map(async (status) => {
      const { count } = await supabase
        .from("email_contacts")
        .select("id", { count: "exact", head: true })
        .eq("status", status);
      return [status, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(results) as unknown as ContactCounts;
}
