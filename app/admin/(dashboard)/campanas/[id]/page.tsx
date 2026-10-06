import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCampaignStats } from "@/lib/data/newsletter";
import { Badge } from "@/components/ui/badge";
import { SendButton, DeleteButton } from "@/components/admin/campaign-actions";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Borrador", variant: "outline" },
  queued: { label: "En cola", variant: "secondary" },
  sending: { label: "Enviando", variant: "secondary" },
  sent: { label: "Enviada", variant: "default" },
  failed: { label: "Falló", variant: "destructive" },
};

function pct(part: number, whole: number): string {
  if (whole <= 0) return "0%";
  return `${Math.round((part / whole) * 100)}%`;
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default async function CampanaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("email_campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!campaign) notFound();

  const stats = await getCampaignStats(id);
  const s = STATUS[campaign.status] ?? { label: campaign.status, variant: "outline" as const };
  const isDraft = campaign.status === "draft";
  const inProgress = campaign.status === "queued" || campaign.status === "sending";

  return (
    <div>
      <Link href="/admin/campanas" className="text-sm text-muted-foreground hover:underline">
        ← Volver a campañas
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {campaign.name}
            </h1>
            <Badge variant={s.variant}>{s.label}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Asunto: {campaign.subject}
          </p>
          <p className="text-sm text-muted-foreground">
            De: {campaign.from_name} &lt;{campaign.from_email}&gt;
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDraft && <SendButton id={id} />}
          {isDraft && <DeleteButton id={id} />}
        </div>
      </div>

      {inProgress && (
        <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4 text-sm">
          Enviando por lotes… {stats.sent} de {campaign.total_recipients} procesados.
          El cron continúa automáticamente cada minuto. Recarga para ver el avance.
        </div>
      )}

      {/* Estadísticas */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Destinatarios" value={campaign.total_recipients} />
        <StatCard
          label="Entregados"
          value={stats.delivered}
          hint={pct(stats.delivered, stats.sent) + " de enviados"}
        />
        <StatCard
          label="Aperturas"
          value={stats.opened}
          hint={pct(stats.opened, stats.delivered) + " de entregados"}
        />
        <StatCard
          label="Clics"
          value={stats.clicked}
          hint={pct(stats.clicked, stats.delivered) + " de entregados"}
        />
        <StatCard label="Rebotes" value={stats.bounced} hint={pct(stats.bounced, stats.sent)} />
        <StatCard label="Quejas de spam" value={stats.complained} />
        <StatCard label="Bajas" value={stats.unsubscribed} />
        <StatCard label="Fallos de envío" value={stats.failed} />
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Nota: las aperturas son orientativas — Apple Mail precarga las imágenes y
        las infla. Los clics son la métrica más confiable.
      </p>

      {/* Vista previa del contenido */}
      <h2 className="mt-8 font-medium">Vista previa</h2>
      <div className="mt-2 overflow-hidden rounded-lg border border-border">
        <iframe
          title="Vista previa del correo"
          srcDoc={campaign.html}
          className="h-[480px] w-full bg-white"
        />
      </div>
    </div>
  );
}
