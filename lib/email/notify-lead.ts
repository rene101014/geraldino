import { Resend } from "resend";
import type { ContactFormInput } from "@/lib/validations/contact";

// Sin RESEND_API_KEY configurada, el lead ya quedó guardado en Supabase
// (visible en /admin/leads) y esta función simplemente no hace nada — el
// formulario de contacto nunca depende de que el email exista para funcionar.
export async function notifyNewLead(lead: ContactFormInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.RESEND_TO_EMAIL;
  if (!apiKey || !to) return;

  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: "Geraldino <onboarding@resend.dev>",
    to,
    replyTo: lead.email,
    subject: `Nuevo mensaje de ${lead.name}`,
    text: [
      `Nombre: ${lead.name}`,
      `Email: ${lead.email}`,
      lead.phone ? `Teléfono: ${lead.phone}` : null,
      lead.service_interest ? `Servicio: ${lead.service_interest}` : null,
      lead.budget_range ? `Presupuesto: ${lead.budget_range}` : null,
      "",
      lead.message,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}
