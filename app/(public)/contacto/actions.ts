"use server";

import { createClient } from "@/lib/supabase/server";
import { contactFormSchema } from "@/lib/validations/contact";
import { notifyNewLead } from "@/lib/email/notify-lead";

export type ContactState = { error: string | null; success: boolean };

export async function submitContactLead(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = contactFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    service_interest: formData.get("service_interest"),
    budget_range: formData.get("budget_range"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los campos del formulario.",
      success: false,
    };
  }

  // El visitante público solo tiene permiso de INSERT (sin RETURNING) sobre
  // contact_submissions, así que el email se intenta antes de insertar y su
  // resultado se guarda como parte de la misma fila, sin un UPDATE posterior
  // que el rol anon no podría hacer.
  let emailSent = false;
  try {
    await notifyNewLead(parsed.data);
    emailSent = true;
  } catch {
    // El lead se guarda igual; el email es una mejora, no un requisito.
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_submissions").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    service_interest: parsed.data.service_interest || null,
    budget_range: parsed.data.budget_range || null,
    message: parsed.data.message,
    email_sent: emailSent,
  });

  if (error) {
    return { error: "No se pudo enviar el mensaje. Intenta de nuevo.", success: false };
  }

  return { error: null, success: true };
}
