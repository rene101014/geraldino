import { createClient } from "@/lib/supabase/server";
import { DEFAULT_THEME } from "@/lib/theme/defaults";
import { cssToOklch, oklchToHex } from "@/lib/theme/color";
import { ThemeForm } from "@/components/admin/theme-editor/theme-form";

export default async function AdminThemePage() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_theme").select("*").eq("id", 1).single();
  const theme = data ?? DEFAULT_THEME;

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Tema</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Elige los 3 colores de marca. El resto de la interfaz (bordes, fondos
        secundarios, hover) se calcula automáticamente a partir de ellos.
      </p>

      <div className="mt-8">
        <ThemeForm
          background={oklchToHex(cssToOklch(theme.background))}
          foreground={oklchToHex(cssToOklch(theme.foreground))}
          accent={oklchToHex(cssToOklch(theme.primary))}
          radius={theme.radius}
        />
      </div>
    </div>
  );
}
