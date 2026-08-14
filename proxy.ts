import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Antes el matcher cubría TODAS las rutas menos los estáticos, así que
  // cada visita a /, /portafolio, /clientes o /contacto disparaba un
  // supabase.auth.getUser() — una llamada de red bloqueante contra el
  // servidor de Auth antes de servir una página que no necesita sesión.
  // Eso se sumaba al tiempo de carga de todo visitante. El sitio público
  // es anónimo; solo /admin necesita sesión.
  matcher: ["/admin/:path*"],
};
