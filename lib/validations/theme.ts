import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Color inválido");

export const themeFormSchema = z.object({
  background: hexColor,
  foreground: hexColor,
  accent: hexColor,
  radius: z.coerce.number().min(0).max(2),
});

export type ThemeFormInput = z.infer<typeof themeFormSchema>;
