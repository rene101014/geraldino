import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { QuoteForm } from "@/components/admin/quote-form";
import { QuoteDetailActions } from "@/components/admin/quote-detail-actions";
import type { Quote, QuoteItem, QuoteWithItems } from "@/lib/data/quotes";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: quote } = await supabase
    .from("crm_quotes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!quote) notFound();

  const [itemsRes, accountsRes, servicesRes] = await Promise.all([
    supabase
      .from("crm_quote_items")
      .select("*")
      .eq("quote_id", id)
      .order("order_index"),
    supabase.from("crm_accounts").select("id, name, email").order("name"),
    supabase
      .from("services")
      .select("id, title")
      .eq("published", true)
      .order("order_index"),
  ]);

  const withItems: QuoteWithItems = {
    ...(quote as Quote),
    items: (itemsRes.data ?? []) as QuoteItem[],
  };
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

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {withItems.quote_number}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{withItems.title}</p>
        </div>
        <QuoteDetailActions quote={withItems} />
      </div>

      <div className="mt-6">
        <QuoteForm accounts={accounts} services={services} quote={withItems} />
      </div>
    </div>
  );
}
