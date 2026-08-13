import { z } from "zod";

export const clientFormSchema = z.object({
  name: z.string().min(1, "Requerido"),
  website_url: z.string().url().optional().or(z.literal("")),
  logo_path: z.string().optional().or(z.literal("")),
});

export type ClientFormInput = z.infer<typeof clientFormSchema>;
