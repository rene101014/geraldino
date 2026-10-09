"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Link2, ExternalLink, Trash2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  setQuoteStatus,
  deleteQuote,
  convertQuoteToProject,
} from "@/app/admin/(dashboard)/cotizaciones/actions";
import { QUOTE_STATUS_LABELS, type Quote } from "@/lib/data/quotes";

export function QuoteDetailActions({ quote }: { quote: Quote }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [converting, setConverting] = useState(false);

  function copyLink() {
    const url = `${window.location.origin}/cotizacion/${quote.token}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Link copiado"),
      () => toast.error("No se pudo copiar"),
    );
  }

  async function handleConvert() {
    setConverting(true);
    try {
      const res = await convertQuoteToProject(quote.id);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Trabajo creado desde la cotización");
      if (res.accountId) router.push(`/admin/crm/${res.accountId}`);
    } finally {
      setConverting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        defaultValue={quote.status}
        onValueChange={(value) => {
          startTransition(() => setQuoteStatus(quote.id, value));
          toast.success("Estado actualizado");
        }}
      >
        <SelectTrigger className="w-[150px]" disabled={pending}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(QUOTE_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" onClick={copyLink}>
        <Link2 className="mr-1 size-4" />
        Copiar link
      </Button>

      <Button asChild variant="outline" size="sm">
        <a href={`/cotizacion/${quote.token}`} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-1 size-4" />
          Ver / PDF
        </a>
      </Button>

      {quote.account_id && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleConvert}
          disabled={converting}
        >
          <Briefcase className="mr-1 size-4" />
          {quote.project_id ? "Ver trabajo" : "Convertir en trabajo"}
        </Button>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash2 className="mr-1 size-4" />
            Eliminar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {quote.quote_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borra la cotización y sus ítems. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  await deleteQuote(quote.id);
                  toast.success("Cotización eliminada");
                  router.push("/admin/cotizaciones");
                });
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
