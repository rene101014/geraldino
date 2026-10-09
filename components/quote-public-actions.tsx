"use client";

import { useState } from "react";
import { Check, X, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuotePublicActions({
  token,
  initialStatus,
}: {
  token: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function respond(action: "accept" | "reject") {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/cotizacion/${token}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo registrar tu respuesta.");
        return;
      }
      setStatus(data.status);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(null);
    }
  }

  const decided = status === "aceptada" || status === "rechazada";

  return (
    <div className="print:hidden">
      {decided ? (
        <div
          className={`rounded-lg border p-4 text-center text-sm font-medium ${
            status === "aceptada"
              ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {status === "aceptada"
            ? "✓ Aceptaste esta cotización. ¡Gracias! El estudio se pondrá en contacto."
            : "Rechazaste esta cotización. Si fue un error, contacta al estudio."}
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="flex-1"
            onClick={() => respond("accept")}
            disabled={loading !== null}
          >
            {loading === "accept" ? (
              <Loader2 className="mr-1 size-4 animate-spin" />
            ) : (
              <Check className="mr-1 size-4" />
            )}
            Aceptar cotización
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => respond("reject")}
            disabled={loading !== null}
          >
            {loading === "reject" ? (
              <Loader2 className="mr-1 size-4 animate-spin" />
            ) : (
              <X className="mr-1 size-4" />
            )}
            Rechazar
          </Button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-center text-sm text-destructive">{error}</p>
      )}

      <div className="mt-4 text-center">
        <Button variant="ghost" size="sm" onClick={() => window.print()}>
          <Printer className="mr-1 size-4" />
          Descargar PDF
        </Button>
      </div>
    </div>
  );
}
