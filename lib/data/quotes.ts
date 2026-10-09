import type { Database } from "@/types/database.types";

export type Quote = Database["public"]["Tables"]["crm_quotes"]["Row"];
export type QuoteItem = Database["public"]["Tables"]["crm_quote_items"]["Row"];

export type QuoteWithItems = Quote & { items: QuoteItem[] };

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
  vencida: "Vencida",
};

// Para colorear el badge de estado según el flujo.
export const QUOTE_STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  borrador: "outline",
  enviada: "secondary",
  aceptada: "default",
  rechazada: "destructive",
  vencida: "destructive",
};
