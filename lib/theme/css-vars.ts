import type { CSSProperties } from "react";
import type { SiteTheme } from "@/lib/theme/defaults";

// Inyecta la paleta guardada en Supabase como variables CSS inline en <html>.
// Al venir en el HTML servido por el servidor, gana por especificidad sobre
// los valores de fallback en :root de globals.css sin flash ni JS de cliente.
export function themeToCssVars(theme: SiteTheme): CSSProperties {
  return {
    "--background": `oklch(${theme.background})`,
    "--foreground": `oklch(${theme.foreground})`,
    "--primary": `oklch(${theme.primary})`,
    "--primary-foreground": `oklch(${theme.primary_foreground})`,
    "--secondary": `oklch(${theme.secondary})`,
    "--secondary-foreground": `oklch(${theme.secondary_foreground})`,
    "--accent": `oklch(${theme.accent})`,
    "--accent-foreground": `oklch(${theme.accent_foreground})`,
    "--muted": `oklch(${theme.muted})`,
    "--muted-foreground": `oklch(${theme.muted_foreground})`,
    "--border": `oklch(${theme.border})`,
    "--input": `oklch(${theme.input})`,
    "--ring": `oklch(${theme.ring})`,
    "--radius": `${theme.radius}rem`,
  } as CSSProperties;
}
