"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { serviceFormSchema } from "@/lib/validations/services";

export type ServiceFormState = { error: string | null; success: boolean };

export async function updateService(
  _prevState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const parsed = serviceFormSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    order_index: formData.get("order_index"),
    published: formData.get("published") === "on",
  });

  if (!parsed.success) {
    return { error: "Revisa los campos, algo no es válido.", success: false };
  }

  const { id, ...rest } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("services").update(rest).eq("id", id);

  if (error) {
    return { error: "No se pudo guardar. Intenta de nuevo.", success: false };
  }

  revalidateTag("services", "max");
  revalidatePath("/", "layout");

  return { error: null, success: true };
}

export async function toggleServicePublished(id: string, published: boolean) {
  const supabase = await createClient();
  await supabase.from("services").update({ published }).eq("id", id);
  revalidateTag("services", "max");
  revalidatePath("/", "layout");
}
