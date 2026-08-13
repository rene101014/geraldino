import { z } from "zod";

export const portfolioItemFormSchema = z.object({
  title: z.string().min(1, "Requerido"),
  description: z.string().optional().or(z.literal("")),
  category: z.string().min(1, "Requerido"),
  media_type: z.enum(["image", "video"]),
  storage_path: z.string().min(1),
  thumbnail_path: z.string().optional().or(z.literal("")),
});

export type PortfolioItemFormInput = z.infer<typeof portfolioItemFormSchema>;
