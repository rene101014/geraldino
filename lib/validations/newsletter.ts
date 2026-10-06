import { z } from "zod";

// Alta de suscriptor desde el sitio público o el admin.
export const subscribeSchema = z.object({
  email: z.string().email("Ese email no parece válido"),
  name: z.string().optional().or(z.literal("")),
  source: z.string().optional().or(z.literal("")),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;

// Crear o editar una campaña.
export const campaignSchema = z.object({
  name: z.string().min(1, "Ponle un nombre interno a la campaña"),
  subject: z.string().min(1, "El asunto no puede estar vacío"),
  from_name: z.string().min(1, "Requerido"),
  from_email: z.string().email("Remitente inválido"),
  reply_to: z.string().email("Responder-a inválido").optional().or(z.literal("")),
  html: z.string().min(1, "El cuerpo del correo no puede estar vacío"),
  // NULL/'' = enviar a todos los suscriptores activos.
  list_id: z.string().uuid().optional().or(z.literal("")),
});

export type CampaignInput = z.infer<typeof campaignSchema>;

// Importación masiva de contactos (textarea con un email por línea,
// o "email,nombre").
export const importSchema = z.object({
  raw: z.string().min(1, "Pega al menos un email"),
  list_id: z.string().uuid().optional().or(z.literal("")),
});

export type ImportInput = z.infer<typeof importSchema>;
