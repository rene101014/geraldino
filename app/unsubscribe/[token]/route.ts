import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// Baja de suscripción. El enlace del correo apunta aquí con el token del
// contacto (/unsubscribe/<token>?s=<sendId>). Usa service_role: el visitante
// no necesita sesión. Soporta:
//  - GET: la persona hace clic en el correo -> muestra confirmación.
//  - POST: baja de "un clic" (cabecera List-Unsubscribe-Post de Gmail/Yahoo).
export const dynamic = "force-dynamic";

async function unsubscribe(token: string, sendId: string | null): Promise<boolean> {
  const supabase = createServiceClient();

  const { data: contact } = await supabase
    .from("email_contacts")
    .select("id, status")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (!contact) return false;

  if (contact.status !== "unsubscribed") {
    await supabase
      .from("email_contacts")
      .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
      .eq("id", contact.id);
  }

  // Atribuye la baja a la campaña concreta, si vino el id del envío.
  if (sendId) {
    await supabase
      .from("email_sends")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("id", sendId);
  }

  return true;
}

function page(title: string, message: string): NextResponse {
  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  body{font-family:system-ui,-apple-system,sans-serif;background:#0a0a0a;color:#fafafa;
    display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
  .box{max-width:28rem;padding:2rem;text-align:center}
  h1{font-size:1.25rem;margin:0 0 .5rem}
  p{color:#a1a1aa;line-height:1.6;margin:0}
</style></head>
<body><div class="box"><h1>${title}</h1><p>${message}</p></div></body></html>`;
  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const sendId = request.nextUrl.searchParams.get("s");
  const ok = await unsubscribe(token, sendId);
  return ok
    ? page("Listo, te diste de baja", "No volverás a recibir nuestros correos. Puedes cerrar esta pestaña.")
    : page("Enlace no válido", "No encontramos esa suscripción. Quizás ya te habías dado de baja.");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const sendId = request.nextUrl.searchParams.get("s");
  await unsubscribe(token, sendId);
  return NextResponse.json({ ok: true });
}
