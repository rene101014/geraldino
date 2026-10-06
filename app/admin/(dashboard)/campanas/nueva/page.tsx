import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CampaignForm } from "@/components/admin/campaign-form";

export const dynamic = "force-dynamic";

export default async function NuevaCampanaPage() {
  const supabase = await createClient();
  const { data: lists } = await supabase
    .from("email_lists")
    .select("id, name")
    .order("name");

  // Remitente por defecto desde el entorno (debe estar verificado en SES).
  const defaultFromName = process.env.EMAIL_FROM_NAME ?? "Geraldino";
  const defaultFromEmail = process.env.EMAIL_FROM_EMAIL ?? "";

  return (
    <div>
      <Link
        href="/admin/campanas"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Volver a campañas
      </Link>
      <h1 className="mt-2 font-heading text-2xl font-semibold tracking-tight">
        Nueva campaña
      </h1>

      <CampaignForm
        lists={lists ?? []}
        defaultFromName={defaultFromName}
        defaultFromEmail={defaultFromEmail}
      />
    </div>
  );
}
