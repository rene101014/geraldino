"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, ChevronRight, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteQuote } from "@/app/admin/(dashboard)/cotizaciones/actions";
import { formatMoney } from "@/lib/data/crm";
import {
  QUOTE_STATUS_LABELS,
  QUOTE_STATUS_VARIANT,
  type Quote,
} from "@/lib/data/quotes";

export function QuotesList({ quotes }: { quotes: Quote[] }) {
  if (quotes.length === 0) {
    return (
      <p className="mt-10 text-sm text-muted-foreground">
        Aún no tienes cotizaciones. Crea la primera con &quot;Nueva
        cotización&quot;.
      </p>
    );
  }

  return (
    <div className="mt-8 divide-y divide-border rounded-xl border border-border">
      {quotes.map((q) => (
        <QuoteRow key={q.id} quote={q} />
      ))}
    </div>
  );
}

function QuoteRow({ quote }: { quote: Quote }) {
  const [pending, startTransition] = useTransition();

  function copyLink() {
    const url = `${window.location.origin}/cotizacion/${quote.token}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Link copiado"),
      () => toast.error("No se pudo copiar"),
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <Link
        href={`/admin/cotizaciones/${quote.id}`}
        className="flex min-w-0 flex-1 flex-col"
      >
        <span className="truncate text-sm font-medium">
          {quote.quote_number} · {quote.title}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {quote.client_name || "Sin cliente"} ·{" "}
          {formatMoney(quote.total, quote.currency)}
        </span>
      </Link>

      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={QUOTE_STATUS_VARIANT[quote.status] ?? "outline"}>
          {QUOTE_STATUS_LABELS[quote.status] ?? quote.status}
        </Badge>

        <Button variant="ghost" size="icon" onClick={copyLink} title="Copiar link">
          <Link2 className="size-4" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" title="Eliminar">
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                ¿Eliminar {quote.quote_number}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Se borra la cotización y sus ítems. No se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                disabled={pending}
                onClick={() => {
                  startTransition(() => deleteQuote(quote.id));
                  toast.success("Cotización eliminada");
                }}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Link href={`/admin/cotizaciones/${quote.id}`}>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
