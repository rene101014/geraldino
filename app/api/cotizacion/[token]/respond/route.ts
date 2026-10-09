import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Database } from "@/types/database.types";

type QuoteUpdate = Database["public"]["Tables"]["crm_quotes"]["Update"];

// Respuesta pública del cliente a una cotización: aceptar o rechazar.
// Valida el token por su cuenta y usa service_role (anon no accede a la tabla).
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  let body: { action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const action = body.action;
  if (action !== "accept" && action !== "reject") {
    return NextResponse.json({ error: "Acción inválida." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: quote } = await supabase
    .from("crm_quotes")
    .select("id, status, valid_until")
    .eq("token", token)
    .maybeSingle();

  if (!quote) {
    return NextResponse.json({ error: "Cotización no encontrada." }, { status: 404 });
  }

  // Si ya fue decidida, devolvemos el estado actual sin cambiarlo.
  if (quote.status === "aceptada" || quote.status === "rechazada") {
    return NextResponse.json({ ok: true, status: quote.status, already: true });
  }

  // No se puede aceptar una cotización vencida.
  if (
    action === "accept" &&
    quote.valid_until &&
    new Date(quote.valid_until) < new Date(new Date().toDateString())
  ) {
    return NextResponse.json(
      { error: "Esta cotización está vencida. Contacta al estudio." },
      { status: 409 },
    );
  }

  const now = new Date().toISOString();
  const patch: QuoteUpdate =
    action === "accept"
      ? { status: "aceptada", accepted_at: now }
      : { status: "rechazada", rejected_at: now };

  const { error } = await supabase
    .from("crm_quotes")
    .update(patch)
    .eq("id", quote.id);

  if (error) {
    return NextResponse.json({ error: "No se pudo registrar tu respuesta." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: patch.status });
}
