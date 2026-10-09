import { z } from "zod";

export const quoteItemSchema = z.object({
  service_id: z
    .string()
    .nullish()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  description: z.string().min(1, "Cada ítem necesita descripción"),
  quantity: z.coerce
    .number()
    .positive("La cantidad debe ser mayor a 0"),
  unit_price: z.coerce
    .number()
    .min(0, "El precio no puede ser negativo"),
});

export const quoteSchema = z.object({
  account_id: z
    .string()
    .nullish()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  title: z.string().min(1, "El título es requerido"),
  client_name: z
    .string()
    .nullish()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  client_email: z
    .string()
    .email("Email inválido")
    .nullish()
    .or(z.literal(""))
    .transform((v) => (v && v !== "" ? v : null)),
  currency: z.enum(["DOP", "USD"]).default("DOP"),
  tax_enabled: z.boolean().default(true),
  tax_rate: z.coerce.number().min(0).max(100).default(18),
  discount: z.coerce.number().min(0).default(0),
  valid_until: z
    .string()
    .nullish()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  notes: z
    .string()
    .nullish()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  terms: z
    .string()
    .nullish()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  items: z.array(quoteItemSchema).min(1, "Agrega al menos un ítem"),
});

export type QuoteInput = z.infer<typeof quoteSchema>;
export type QuoteItemInput = z.infer<typeof quoteItemSchema>;

// Cálculo de totales: subtotal = Σ(cantidad·precio); base = subtotal − descuento;
// ITBIS sobre la base si está activo; total = base + ITBIS. Se redondea a 2.
export function computeTotals(input: {
  items: { quantity: number; unit_price: number }[];
  discount: number;
  tax_enabled: boolean;
  tax_rate: number;
}) {
  const round2 = (n: number) => Math.round(n * 100) / 100;
  const subtotal = round2(
    input.items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0),
  );
  const base = Math.max(0, round2(subtotal - (input.discount || 0)));
  const taxAmount = input.tax_enabled
    ? round2((base * (input.tax_rate || 0)) / 100)
    : 0;
  const total = round2(base + taxAmount);
  return { subtotal, taxAmount, total };
}
