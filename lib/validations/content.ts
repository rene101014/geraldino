import { z } from "zod";

export const contentFormSchema = z.object({
  brand_name: z.string().min(1, "Requerido"),
  founder_name: z.string().min(1, "Requerido"),
  hero_title: z.string().min(1, "Requerido"),
  hero_subtitle: z.string().min(1, "Requerido"),
  hero_cta_label: z.string().min(1, "Requerido"),
  bio_heading: z.string().min(1, "Requerido"),
  bio_body: z.string().min(1, "Requerido"),
  contact_email: z.string().email().optional().or(z.literal("")),
  contact_phone: z.string().optional().or(z.literal("")),
  contact_whatsapp: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  meta_title: z.string().min(1, "Requerido"),
  meta_description: z.string().min(1, "Requerido"),
});

export type ContentFormInput = z.infer<typeof contentFormSchema>;
