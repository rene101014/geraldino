"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { contentFormSchema } from "@/lib/validations/content";

export type ContentFormState = { error: string | null; success: boolean };

export async function updateContent(
  _prevState: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  const parsed = contentFormSchema.safeParse({
    brand_name: formData.get("brand_name"),
    founder_name: formData.get("founder_name"),
    hero_title: formData.get("hero_title"),
    hero_subtitle: formData.get("hero_subtitle"),
    hero_cta_label: formData.get("hero_cta_label"),
    bio_heading: formData.get("bio_heading"),
    bio_body: formData.get("bio_body"),
    contact_email: formData.get("contact_email"),
    contact_phone: formData.get("contact_phone"),
    contact_whatsapp: formData.get("contact_whatsapp"),
    address: formData.get("address"),
    meta_title: formData.get("meta_title"),
    meta_description: formData.get("meta_description"),
  });

  if (!parsed.success) {
    return { error: "Revisa los campos, algo no es válido.", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_content")
    .update(parsed.data)
    .eq("id", 1);

  if (error) {
    return { error: "No se pudo guardar. Intenta de nuevo.", success: false };
  }

  revalidateTag("site-content", "max");
  revalidatePath("/", "layout");

  return { error: null, success: true };
}
