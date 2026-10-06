"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { subscribeSchema } from "@/lib/validations/newsletter";

export type ContactState = { error: string | null; success: boolean; info?: string };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Alta manual de un suscriptor desde el admin.
export async function addContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = subscribeSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    source: "admin",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("email_contacts").insert({
    email: normalizeEmail(parsed.data.email),
    name: parsed.data.name || null,
    source: "admin",
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Ese email ya está en la lista", success: false };
    }
    return { error: "No se pudo agregar el contacto", success: false };
  }

  revalidatePath("/admin/suscriptores");
  return { error: null, success: true, info: "Contacto agregado" };
}

// Importación masiva: un email por línea, opcionalmente "email,nombre".
export async function importContacts(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const raw = String(formData.get("raw") ?? "").trim();
  if (!raw) return { error: "Pega al menos un email", success: false };

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const rows: { email: string; name: string | null; source: string }[] = [];
  const seen = new Set<string>();

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [emailPart, ...nameParts] = trimmed.split(",");
    const email = normalizeEmail(emailPart);
    if (!emailRe.test(email) || seen.has(email)) continue;
    seen.add(email);
    rows.push({ email, name: nameParts.join(",").trim() || null, source: "import" });
  }

  if (rows.length === 0) {
    return { error: "No se encontró ningún email válido", success: false };
  }

  const supabase = await createClient();
  // Ignora duplicados: no pisa contactos ya existentes.
  const { error } = await supabase
    .from("email_contacts")
    .upsert(rows, { onConflict: "email", ignoreDuplicates: true });

  if (error) {
    return { error: "No se pudo importar la lista", success: false };
  }

  revalidatePath("/admin/suscriptores");
  return {
    error: null,
    success: true,
    info: `Procesados ${rows.length} emails (los repetidos se ignoraron)`,
  };
}

// Cambia el estado de un contacto (dar de baja / reactivar).
export async function setContactStatus(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const supabase = await createClient();
  await supabase
    .from("email_contacts")
    .update({
      status,
      unsubscribed_at: status === "unsubscribed" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  revalidatePath("/admin/suscriptores");
}

// Borra un contacto definitivamente.
export async function removeContact(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("email_contacts").delete().eq("id", id);
  revalidatePath("/admin/suscriptores");
}
