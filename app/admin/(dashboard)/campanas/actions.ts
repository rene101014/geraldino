"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { campaignSchema } from "@/lib/validations/newsletter";
import { enqueueCampaign } from "@/lib/email/campaign";

export type CampaignState = { error: string | null };

// Crea una campaña en borrador y redirige a su detalle.
export async function createCampaign(
  _prev: CampaignState,
  formData: FormData,
): Promise<CampaignState> {
  const parsed = campaignSchema.safeParse({
    name: formData.get("name"),
    subject: formData.get("subject"),
    from_name: formData.get("from_name"),
    from_email: formData.get("from_email"),
    reply_to: formData.get("reply_to"),
    html: formData.get("html"),
    list_id: formData.get("list_id"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los campos" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("email_campaigns")
    .insert({
      name: parsed.data.name,
      subject: parsed.data.subject,
      from_name: parsed.data.from_name,
      from_email: parsed.data.from_email,
      reply_to: parsed.data.reply_to || null,
      html: parsed.data.html,
      list_id: parsed.data.list_id || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "No se pudo crear la campaña" };
  }

  revalidatePath("/admin/campanas");
  redirect(`/admin/campanas/${data.id}`);
}

// Encola la campaña para envío. El cron la irá enviando por lotes.
export async function sendCampaign(formData: FormData) {
  const id = String(formData.get("id"));
  try {
    await enqueueCampaign(id);
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "No se pudo encolar la campaña");
  }
  revalidatePath(`/admin/campanas/${id}`);
  revalidatePath("/admin/campanas");
}

// Borra una campaña (y, en cascada, sus envíos y eventos).
export async function deleteCampaign(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("email_campaigns").delete().eq("id", id);
  revalidatePath("/admin/campanas");
  redirect("/admin/campanas");
}
