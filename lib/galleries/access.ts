import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";
import type { Gallery } from "@/lib/data/galleries";

// Carga una galería por su token público. Usa service_role porque el visitante
// no está autenticado; la seguridad la da el token imposible de adivinar + la
// contraseña (para privadas), validada aquí en el servidor.
export async function getGalleryByToken(token: string): Promise<Gallery | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("galleries")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  return (data as Gallery | null) ?? null;
}

function cookieName(galleryId: string): string {
  return `g_access_${galleryId}`;
}

// Valor de la cookie derivado del hash de la contraseña: si el estudio cambia
// la contraseña, las cookies viejas dejan de servir.
function expectedCookieValue(passwordHash: string): string {
  return createHash("sha256").update(passwordHash).digest("hex").slice(0, 24);
}

// ¿El visitante puede ver esta galería? Pública siempre; privada solo con la
// cookie de acceso válida (o sin contraseña configurada).
export async function hasGalleryAccess(gallery: Gallery): Promise<boolean> {
  if (gallery.visibility === "public") return true;
  if (!gallery.password_hash) return true; // privada por link, sin contraseña
  const store = await cookies();
  const c = store.get(cookieName(gallery.id))?.value;
  return !!c && c === expectedCookieValue(gallery.password_hash);
}

export async function grantGalleryAccess(gallery: Gallery): Promise<void> {
  if (!gallery.password_hash) return;
  const store = await cookies();
  store.set(cookieName(gallery.id), expectedCookieValue(gallery.password_hash), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 días
    path: "/",
  });
}
