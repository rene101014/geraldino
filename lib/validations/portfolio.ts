import { z } from "zod";

export const portfolioItemFormSchema = z
  .object({
    title: z.string().min(1, "Requerido"),
    description: z.string().optional().or(z.literal("")),
    category: z.string().min(1, "Requerido"),
    media_type: z.enum(["image", "video"]),
    provider: z.enum(["supabase", "vimeo"]).default("supabase"),
    storage_path: z.string().optional().or(z.literal("")),
    external_id: z.string().optional().or(z.literal("")),
    thumbnail_path: z.string().optional().or(z.literal("")),
  })
  .refine((data) => data.provider !== "supabase" || !!data.storage_path, {
    message: "Falta el archivo",
    path: ["storage_path"],
  })
  .refine((data) => data.provider !== "vimeo" || !!data.external_id, {
    message: "Falta el video de Vimeo",
    path: ["external_id"],
  });

export type PortfolioItemFormInput = z.infer<typeof portfolioItemFormSchema>;
