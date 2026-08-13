"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { themeFormSchema } from "@/lib/validations/theme";
import { hexToOklch, oklchToCss, deriveTheme } from "@/lib/theme/color";

export type ThemeFormState = { error: string | null; success: boolean };

export async function updateTheme(
  _prevState: ThemeFormState,
  formData: FormData,
): Promise<ThemeFormState> {
  const parsed = themeFormSchema.safeParse({
    background: formData.get("background"),
    foreground: formData.get("foreground"),
    accent: formData.get("accent"),
    radius: formData.get("radius"),
  });

  if (!parsed.success) {
    return { error: "Revisa los colores y el radio, algo no es válido.", success: false };
  }

  const { background, foreground, accent, radius } = parsed.data;

  const tokens = deriveTheme({
    background: hexToOklch(background),
    foreground: hexToOklch(foreground),
    accent: hexToOklch(accent),
  });

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_theme")
    .update({
      background: oklchToCss(tokens.background),
      foreground: oklchToCss(tokens.foreground),
      primary: oklchToCss(tokens.primary),
      primary_foreground: oklchToCss(tokens.primaryForeground),
      secondary: oklchToCss(tokens.secondary),
      secondary_foreground: oklchToCss(tokens.secondaryForeground),
      accent: oklchToCss(tokens.accent),
      accent_foreground: oklchToCss(tokens.accentForeground),
      muted: oklchToCss(tokens.muted),
      muted_foreground: oklchToCss(tokens.mutedForeground),
      border: oklchToCss(tokens.border),
      input: oklchToCss(tokens.input),
      ring: oklchToCss(tokens.ring),
      radius,
    })
    .eq("id", 1);

  if (error) {
    return { error: "No se pudo guardar el tema. Intenta de nuevo.", success: false };
  }

  revalidateTag("site-theme", "max");
  revalidatePath("/", "layout");

  return { error: null, success: true };
}
