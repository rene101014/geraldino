import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { unwrap } from "@/lib/data/fetch-or-throw";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

const STATUS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Borrador", variant: "outline" },
  queued: { label: "En cola", variant: "secondary" },
  sending: { label: "Enviando", variant: "secondary" },
  sent: { label: "Enviada", variant: "default" },
  failed: { label: "Falló", variant: "destructive" },
};

export default async function CampanasPage() {
  const supabase = await createClient();
  const res = await supabase
    .from("email_campaigns")
    .select("id, name, subject, status, total_recipients, created_at, sent_at")
    .order("created_at", { ascending: false });
  const campaigns = unwrap(res, "las campañas") ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Campañas</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea, envía y mide tus correos de marketing.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/campanas/nueva">Nueva campaña</Link>
        </Button>
      </div>

      <div className="mt-6 rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Asunto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Destinatarios</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Todavía no has creado campañas.
                </TableCell>
              </TableRow>
            )}
            {campaigns.map((c) => {
              const s = STATUS[c.status] ?? { label: c.status, variant: "outline" as const };
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/campanas/${c.id}`} className="hover:underline">
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.subject}</TableCell>
                  <TableCell>
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{c.total_recipients}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
