"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { serviceFormSchema, createServiceFormSchema } from "@/lib/validations/services";

export type ServiceFormState = { error: string | null; success: boolean };

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

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

export async function createService(
  _prevState: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const parsed = createServiceFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    is_addon: formData.get("is_addon") === "on",
  });

  if (!parsed.success) {
    return { error: "Revisa los campos, algo no es válido.", success: false };
  }

  const supabase = await createClient();
  const baseSlug = slugify(parsed.data.title);
  const slug = baseSlug || `servicio-${Date.now()}`;

  const { count } = await supabase
    .from("services")
    .select("id", { count: "exact", head: true });

  const { error } = await supabase.from("services").insert({
    slug,
    title: parsed.data.title,
    description: parsed.data.description,
    is_addon: parsed.data.is_addon,
    order_index: count ?? 0,
    published: true,
  });

  if (error) {
    const message =
      error.code === "23505"
        ? "Ya existe un servicio con un título muy parecido."
        : "No se pudo crear el servicio. Intenta de nuevo.";
    return { error: message, success: false };
  }

  revalidateTag("services", "max");
  revalidatePath("/", "layout");

  return { error: null, success: true };
}
