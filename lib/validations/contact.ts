import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(1, "Cuéntanos tu nombre"),
  email: z.string().email("Ese email no parece válido"),
  phone: z.string().optional().or(z.literal("")),
  service_interest: z.string().optional().or(z.literal("")),
  budget_range: z.string().optional().or(z.literal("")),
  message: z.string().min(10, "Cuéntanos un poco más sobre el proyecto"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
