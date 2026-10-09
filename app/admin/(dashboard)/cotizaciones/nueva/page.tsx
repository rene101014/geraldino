import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { QuoteForm } from "@/components/admin/quote-form";

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string }>;
}) {
  const { account } = await searchParams;
  const supabase = await createClient();
  const [accountsRes, servicesRes] = await Promise.all([
    supabase.from("crm_accounts").select("id, name, email").order("name"),
    supabase
      .from("services")
      .select("id, title")
      .eq("published", true)
      .order("order_index"),
  ]);

  const accounts = (accountsRes.data ?? []) as {
    id: string;
    name: string;
    email: string | null;
  }[];
  const services = (servicesRes.data ?? []) as { id: string; title: string }[];

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/cotizaciones"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a cotizaciones
      </Link>

      <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight">
        Nueva cotización
      </h1>

      <div className="mt-6">
        <QuoteForm
          accounts={accounts}
          services={services}
          defaultAccountId={account}
        />
      </div>
    </div>
  );
}
