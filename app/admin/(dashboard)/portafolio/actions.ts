"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { portfolioItemFormSchema } from "@/lib/validations/portfolio";
import { isExternalUrl } from "@/lib/storage/public-url";

export type PortfolioFormState = { error: string | null; success: boolean };

export async function createPortfolioItem(
  _prevState: PortfolioFormState,
  formData: FormData,
): Promise<PortfolioFormState> {
  const parsed = portfolioItemFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    media_type: formData.get("media_type"),
    provider: formData.get("provider") || "supabase",
    storage_path: formData.get("storage_path"),
    external_id: formData.get("external_id"),
    thumbnail_path: formData.get("thumbnail_path"),
  });

  if (!parsed.success) {
    return { error: "Revisa los campos, algo no es válido.", success: false };
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("portfolio_items")
    .select("id", { count: "exact", head: true });

  const { error } = await supabase.from("portfolio_items").insert({
    title: parsed.data.title,
    description: parsed.data.description || null,
    category: parsed.data.category,
    media_type: parsed.data.media_type,
    provider: parsed.data.provider,
    storage_path: parsed.data.storage_path || null,
    external_id: parsed.data.external_id || null,
    thumbnail_path: parsed.data.thumbnail_path || null,
    order_index: count ?? 0,
    published: true,
  });

  if (error) {
    return { error: "No se pudo guardar la pieza. Intenta de nuevo.", success: false };
  }

  revalidateTag("portfolio-items", "max");
  revalidatePath("/", "layout");

  return { error: null, success: true };
}

export async function togglePortfolioPublished(id: string, published: boolean) {
  const supabase = await createClient();
  await supabase.from("portfolio_items").update({ published }).eq("id", id);
  revalidateTag("portfolio-items", "max");
  revalidatePath("/", "layout");
}

export async function togglePortfolioFeatured(id: string, is_featured: boolean) {
  const supabase = await createClient();
  await supabase.from("portfolio_items").update({ is_featured }).eq("id", id);
  revalidateTag("portfolio-items", "max");
  revalidatePath("/", "layout");
}

export async function togglePortfolioCaption(id: string, show_caption: boolean) {
  const supabase = await createClient();
  await supabase.from("portfolio_items").update({ show_caption }).eq("id", id);
  revalidateTag("portfolio-items", "max");
  revalidatePath("/", "layout");
}

export async function deletePortfolioItem(id: string) {
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("portfolio_items")
    .select("storage_path, thumbnail_path")
    .eq("id", id)
    .single();

  await supabase.from("portfolio_items").delete().eq("id", id);

  const paths = [item?.storage_path, item?.thumbnail_path].filter(
    (p): p is string => !!p && !isExternalUrl(p),
  );
  if (paths.length > 0) {
    await supabase.storage.from("portfolio").remove(paths);
  }

  revalidateTag("portfolio-items", "max");
  revalidatePath("/", "layout");
}
