import type { Database } from "@/types/database.types";

export type SiteTheme = Database["public"]["Tables"]["site_theme"]["Row"];

// Debe coincidir con los defaults de la migración 20260811072655_dark_default_theme.sql.
// Solo se usa si la fila singleton (id=1) no se pudo leer de Supabase.
export const DEFAULT_THEME: SiteTheme = {
  id: 1,
  background: "0.09 0.004 75",
  foreground: "0.97 0.003 75",
  primary: "0.68 0.19 41",
  primary_foreground: "0.145 0 0",
  secondary: "0.17 0 0",
  secondary_foreground: "0.97 0.003 75",
  accent: "0.22 0.0342 41",
  accent_foreground: "0.97 0.003 75",
  muted: "0.17 0 0",
  muted_foreground: "0.574 0 0",
  border: "0.1956 0 0",
  input: "0.1956 0 0",
  ring: "0.68 0.19 41",
  radius: 0.5,
  updated_at: new Date(0).toISOString(),
};
