import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Json } from "@/types/database.types";
import {
  verifySnsSignature,
  confirmSubscription,
  type SnsMessage,
} from "@/lib/email/sns";

// Webhook que recibe los eventos de SES vía Amazon SNS (entregas, aperturas,
// clics, rebotes, quejas). URL pública: por eso SIEMPRE verificamos la firma de
// SNS antes de tocar la base de datos. Usa service_role (sin sesión de usuario).
export const dynamic = "force-dynamic";

interface SesEvent {
  eventType?: string;
  notificationType?: string;
  mail?: { messageId?: string };
  open?: { userAgent?: string; ipAddress?: string };
  click?: { userAgent?: string; ipAddress?: string; link?: string };
}

export async function POST(request: Request) {
  const raw = await request.text();

  let msg: SnsMessage;
  try {
    msg = JSON.parse(raw) as SnsMessage;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  // Rechaza cualquier mensaje que no esté firmado correctamente por AWS.
  const valid = await verifySnsSignature(msg);
  if (!valid) {
    return NextResponse.json({ error: "Firma SNS inválida" }, { status: 403 });
  }

  // Primer mensaje del topic: confirmar la suscripción.
  if (msg.Type === "SubscriptionConfirmation") {
    await confirmSubscription(msg);
    return NextResponse.json({ ok: true, confirmed: true });
  }

  if (msg.Type !== "Notification") {
    return NextResponse.json({ ok: true, ignored: msg.Type });
  }

  let event: SesEvent;
  try {
    event = JSON.parse(msg.Message) as SesEvent;
  } catch {
    return NextResponse.json({ error: "Message inválido" }, { status: 400 });
  }

  const type = event.eventType ?? event.notificationType;
  const messageId = event.mail?.messageId;
  if (!type || !messageId) {
    return NextResponse.json({ ok: true, ignored: "sin tipo o messageId" });
  }

  const supabase = createServiceClient();

  // Casa el evento con el envío por el message id de SES.
  const { data: send } = await supabase
    .from("email_sends")
    .select("id, contact_id, open_count, click_count, opened_at, clicked_at")
    .eq("ses_message_id", messageId)
    .maybeSingle();

  // Bitácora cruda del evento (aunque no encontremos el envío).
  await supabase.from("email_events").insert({
    send_id: send?.id ?? null,
    ses_message_id: messageId,
    event_type: type,
    link: event.click?.link ?? null,
    user_agent: event.open?.userAgent ?? event.click?.userAgent ?? null,
    ip: event.open?.ipAddress ?? event.click?.ipAddress ?? null,
    payload: event as unknown as Json,
  });

  if (!send) {
    return NextResponse.json({ ok: true, unmatched: true });
  }

  const now = new Date().toISOString();

  switch (type) {
    case "Delivery":
      await supabase
        .from("email_sends")
        .update({ delivered_at: now })
        .eq("id", send.id);
      break;

    case "Open":
      await supabase
        .from("email_sends")
        .update({
          opened_at: send.opened_at ?? now,
          open_count: (send.open_count ?? 0) + 1,
        })
        .eq("id", send.id);
      break;

    case "Click":
      await supabase
        .from("email_sends")
        .update({
          clicked_at: send.clicked_at ?? now,
          click_count: (send.click_count ?? 0) + 1,
        })
        .eq("id", send.id);
      break;

    case "Bounce":
      await supabase
        .from("email_sends")
        .update({ status: "bounced" })
        .eq("id", send.id);
      if (send.contact_id) {
        // Un rebote duro: deja de enviarle a este contacto en el futuro.
        await supabase
          .from("email_contacts")
          .update({ status: "bounced" })
          .eq("id", send.contact_id);
      }
      break;

    case "Complaint":
      await supabase
        .from("email_sends")
        .update({ status: "complained" })
        .eq("id", send.id);
      if (send.contact_id) {
        // Marcó como spam: nunca más.
        await supabase
          .from("email_contacts")
          .update({ status: "complained" })
          .eq("id", send.contact_id);
      }
      break;
  }

  return NextResponse.json({ ok: true });
}
