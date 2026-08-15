import type { CSSProperties } from "react";
import { Toaster } from "@/components/ui/sonner";

// El admin usa una paleta neutra fija, independiente del tema editable del
// sitio público — una herramienta de trabajo no debería volverse ilegible
// (o cambiar de humor) porque alguien eligió un fondo oscuro para la marca.
const ADMIN_THEME = {
  "--background": "oklch(0.99 0.003 75)",
  "--foreground": "oklch(0.16 0.004 75)",
  "--primary": "oklch(0.68 0.19 41)",
  "--primary-foreground": "oklch(1 0 0)",
  "--secondary": "oklch(0.97 0 0)",
  "--secondary-foreground": "oklch(0.205 0 0)",
  "--muted": "oklch(0.97 0 0)",
  "--muted-foreground": "oklch(0.556 0 0)",
  "--accent": "oklch(0.97 0 0)",
  "--accent-foreground": "oklch(0.205 0 0)",
  "--border": "oklch(0.922 0 0)",
  "--input": "oklch(0.922 0 0)",
  "--ring": "oklch(0.68 0.19 41)",
  "--radius": "0.625rem",
  // --card/--popover se definen en :root como var(--background), pero esa
  // indirección se resuelve una sola vez en :root (contra el tema oscuro
  // del sitio público) y ese valor ya calculado es lo que se hereda — no
  // se vuelve a evaluar aquí abajo. Se fijan explícitos para no heredar el
  // negro del sitio público.
  "--card": "oklch(0.99 0.003 75)",
  "--card-foreground": "oklch(0.16 0.004 75)",
  "--popover": "oklch(0.99 0.003 75)",
  "--popover-foreground": "oklch(0.16 0.004 75)",
} as CSSProperties;

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={ADMIN_THEME} className="min-h-screen bg-background text-foreground">
      {children}
      <Toaster />
    </div>
  );
}
