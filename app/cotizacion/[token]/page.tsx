import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/service";
import { formatMoney } from "@/lib/data/crm";
import { QUOTE_STATUS_LABELS, type Quote, type QuoteItem } from "@/lib/data/quotes";
import { QuotePublicActions } from "@/components/quote-public-actions";

export const metadata: Metadata = {
  title: "Cotización — Geraldino",
  robots: { index: false, follow: false },
};

function fmtDate(d: string | null): string {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function PublicQuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: quote } = await supabase
    .from("crm_quotes")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (!quote) notFound();
  const q = quote as Quote;

  const { data: itemsData } = await supabase
    .from("crm_quote_items")
    .select("*")
    .eq("quote_id", q.id)
    .order("order_index");
  const items = (itemsData ?? []) as QuoteItem[];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 print:py-0">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10 print:border-0 print:shadow-none">
        {/* Encabezado */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="font-heading text-2xl font-semibold tracking-tight">
              Geraldino
            </p>
            <p className="text-sm text-muted-foreground">Fotografía y producción</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{q.quote_number}</p>
            <p className="text-xs text-muted-foreground">
              Emitida: {fmtDate(q.created_at.slice(0, 10))}
            </p>
            {q.valid_until && (
              <p className="text-xs text-muted-foreground">
                Válida hasta: {fmtDate(q.valid_until)}
              </p>
            )}
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {QUOTE_STATUS_LABELS[q.status] ?? q.status}
            </p>
          </div>
        </div>

        {/* Cliente + título */}
        <div className="py-6">
          <h1 className="text-lg font-semibold">{q.title}</h1>
          {(q.client_name || q.client_email) && (
            <p className="mt-1 text-sm text-muted-foreground">
              Para: {q.client_name}
              {q.client_email ? ` · ${q.client_email}` : ""}
            </p>
          )}
        </div>

        {/* Ítems */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-2 font-medium">Descripción</th>
                <th className="py-2 px-2 text-right font-medium">Cant.</th>
                <th className="py-2 px-2 text-right font-medium">Precio</th>
                <th className="py-2 pl-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-b border-border/60">
                  <td className="py-3 pr-2">{it.description}</td>
                  <td className="py-3 px-2 text-right tabular-nums">{it.quantity}</td>
                  <td className="py-3 px-2 text-right tabular-nums">
                    {formatMoney(it.unit_price, q.currency)}
                  </td>
                  <td className="py-3 pl-2 text-right font-medium tabular-nums">
                    {formatMoney(it.line_total, q.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totales */}
        <div className="mt-6 flex justify-end">
          <dl className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatMoney(q.subtotal, q.currency)}</dd>
            </div>
            {q.discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Descuento</dt>
                <dd className="tabular-nums">− {formatMoney(q.discount, q.currency)}</dd>
              </div>
            )}
            {q.tax_enabled && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">ITBIS ({q.tax_rate}%)</dt>
                <dd className="tabular-nums">{formatMoney(q.tax_amount, q.currency)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatMoney(q.total, q.currency)}</dd>
            </div>
          </dl>
        </div>

        {/* Notas y términos */}
        {(q.notes || q.terms) && (
          <div className="mt-8 space-y-4 border-t border-border pt-6 text-sm">
            {q.notes && (
              <div>
                <p className="font-medium">Notas</p>
                <p className="mt-1 whitespace-pre-line text-muted-foreground">
                  {q.notes}
                </p>
              </div>
            )}
            {q.terms && (
              <div>
                <p className="font-medium">Términos y condiciones</p>
                <p className="mt-1 whitespace-pre-line text-muted-foreground">
                  {q.terms}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Acciones del cliente */}
        <div className="mt-8 border-t border-border pt-6">
          <QuotePublicActions token={token} initialStatus={q.status} />
        </div>
      </div>
    </main>
  );
}
