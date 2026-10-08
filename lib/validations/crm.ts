import { z } from "zod";

// Normaliza un campo de texto opcional del form: "" o null -> null.
const optionalText = z
  .string()
  .nullish()
  .transform((v) => (v && v.trim() !== "" ? v.trim() : null));

const optionalEmail = z
  .string()
  .email("Ese email no parece válido")
  .nullish()
  .or(z.literal(""))
  .transform((v) => (v && v !== "" ? v : null));

const optionalUrl = z
  .string()
  .url("La URL no parece válida")
  .nullish()
  .or(z.literal(""))
  .transform((v) => (v && v !== "" ? v : null));

// Un uuid opcional que llega del form como string o "" (select sin elegir).
const optionalUuid = z
  .string()
  .nullish()
  .transform((v) => (v && v.trim() !== "" ? v.trim() : null));

export const crmAccountSchema = z
  .object({
    type: z.enum(["agencia", "particular"]),
    parent_id: optionalUuid,
    name: z.string().min(1, "El nombre es requerido"),
    contact_name: optionalText,
    email: optionalEmail,
    phone: optionalText,
    whatsapp: optionalText,
    rnc: optionalText,
    address: optionalText,
    website_url: optionalUrl,
    notes: optionalText,
    status: z.enum(["activo", "prospecto", "inactivo"]).default("activo"),
  })
  .refine((d) => !(d.type === "agencia" && d.parent_id), {
    // Una agencia es siempre de nivel superior; no cuelga de otra cuenta.
    message: "Una agencia no puede ser sub-cliente de otra cuenta",
    path: ["parent_id"],
  });

export type CrmAccountInput = z.infer<typeof crmAccountSchema>;

const optionalDate = z
  .string()
  .nullish()
  .transform((v) => (v && v.trim() !== "" ? v.trim() : null));

export const crmProjectSchema = z.object({
  account_id: z.string().min(1, "Falta el cliente"),
  title: z.string().min(1, "El título es requerido"),
  description: optionalText,
  service_id: optionalUuid,
  status: z
    .enum(["propuesta", "en_progreso", "entregado", "cerrado", "cancelado"])
    .default("propuesta"),
  start_date: optionalDate,
  due_date: optionalDate,
  // Llega como string del form; "" -> null, resto -> número.
  budget_amount: z
    .string()
    .nullish()
    .transform((v) => (v && v.trim() !== "" ? Number(v) : null))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 0), {
      message: "El monto debe ser un número válido",
    }),
  currency: z.enum(["DOP", "USD"]).default("DOP"),
  notes: optionalText,
});

export type CrmProjectInput = z.infer<typeof crmProjectSchema>;
