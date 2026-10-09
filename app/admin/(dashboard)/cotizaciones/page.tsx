import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { unwrap } from "@/lib/data/fetch-or-throw";
import { Button } from "@/components/ui/button";
import { QuotesList } from "@/components/admin/quotes-list";
import type { Quote } from "@/lib/data/quotes";

export default async function AdminQuotesPage() {
  const supabase = await createClient();
  const res = await supabase
    .from("crm_quotes")
    .select("*")
    .order("created_at", { ascending: false });
  const quotes = (unwrap(res, "las cotizaciones") ?? []) as Quote[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Cotizaciones
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea cotizaciones y compártelas para que el cliente las acepte en línea.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/cotizaciones/nueva">
            <Plus className="mr-1 size-4" />
            Nueva cotización
          </Link>
        </Button>
      </div>

      <QuotesList quotes={quotes} />
    </div>
  );
}
