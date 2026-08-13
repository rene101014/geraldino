"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { clientFormSchema } from "@/lib/validations/clients";

export type ClientFormState = { error: string | null; success: boolean };

export async function createClientRecord(
  _prevState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  const parsed = clientFormSchema.safeParse({
    name: formData.get("name"),
    website_url: formData.get("website_url"),
    logo_path: formData.get("logo_path"),
  });

  if (!parsed.success) {
    return { error: "Revisa los campos, algo no es válido.", success: false };
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true });

  const { error } = await supabase.from("clients").insert({
    name: parsed.data.name,
    website_url: parsed.data.website_url || null,
    logo_path: parsed.data.logo_path || null,
    order_index: count ?? 0,
    published: true,
  });

  if (error) {
    return { error: "No se pudo guardar el cliente. Intenta de nuevo.", success: false };
  }

  revalidateTag("clients", "max");
  revalidatePath("/", "layout");

  return { error: null, success: true };
}

export async function toggleClientPublished(id: string, published: boolean) {
  const supabase = await createClient();
  await supabase.from("clients").update({ published }).eq("id", id);
  revalidateTag("clients", "max");
  revalidatePath("/", "layout");
}

export async function deleteClient(id: string) {
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("logo_path")
    .eq("id", id)
    .single();

  await supabase.from("clients").delete().eq("id", id);

  if (client?.logo_path) {
    await supabase.storage.from("clients").remove([client.logo_path]);
  }

  revalidateTag("clients", "max");
  revalidatePath("/", "layout");
}
