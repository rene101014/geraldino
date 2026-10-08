"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import { galleryFormSchema } from "@/lib/validations/galleries";
import { generateGalleryToken, hashPassword } from "@/lib/galleries/token";
import { parseFolderId, listFolderImages, getFolderName } from "@/lib/google/drive";
import { disconnectGoogle } from "@/lib/google/oauth";

export type GalleryFormState = {
  error: string | null;
  success: boolean;
  id?: string;
};

function parseForm(formData: FormData) {
  return galleryFormSchema.safeParse({
    title: formData.get("title"),
    client_name: formData.get("client_name"),
    client_email: formData.get("client_email"),
    type: formData.get("type"),
    delivery_format: formData.get("delivery_format") || "download",
    visibility: formData.get("visibility"),
    password: formData.get("password"),
    drive_folder: formData.get("drive_folder"),
    selection_limit: formData.get("selection_limit"),
    allow_downloads: formData.get("allow_downloads") === "on",
  });
}

export async function createGallery(
  _prevState: GalleryFormState,
  formData: FormData,
): Promise<GalleryFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: "Revisa los campos, algo no es válido.", success: false };
  }
  const d = parsed.data;

  // Opcional: enlazar la galería a un trabajo del CRM al crearla.
  const projectId = (formData.get("project_id") as string) || null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("galleries")
    .insert({
      title: d.title,
      client_name: d.client_name || null,
      client_email: d.client_email || null,
      type: d.type,
      delivery_format: d.type === "delivery" ? d.delivery_format : "download",
      visibility: d.visibility,
      password_hash:
        d.visibility === "private" && d.password
          ? hashPassword(d.password)
          : null,
      token: generateGalleryToken(),
      drive_folder_id: parseFolderId(d.drive_folder),
      selection_limit: d.type === "selection" ? d.selection_limit : null,
      allow_downloads: d.allow_downloads,
      project_id: projectId,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "No se pudo crear la galería. Intenta de nuevo.", success: false };
  }

  revalidatePath("/admin/galerias");
  if (projectId) revalidatePath("/admin/crm");
  return { error: null, success: true, id: data.id };
}

export async function updateGallery(
  id: string,
  _prevState: GalleryFormState,
  formData: FormData,
): Promise<GalleryFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: "Revisa los campos, algo no es válido.", success: false };
  }
  const d = parsed.data;

  const update: Database["public"]["Tables"]["galleries"]["Update"] = {
    title: d.title,
    client_name: d.client_name || null,
    client_email: d.client_email || null,
    type: d.type,
    delivery_format: d.type === "delivery" ? d.delivery_format : "download",
    visibility: d.visibility,
    drive_folder_id: parseFolderId(d.drive_folder),
    selection_limit: d.type === "selection" ? d.selection_limit : null,
    allow_downloads: d.allow_downloads,
  };

  // Contraseña: vacío = no cambiar. Cambiar a pública borra la contraseña.
  if (d.visibility === "public") {
    update.password_hash = null;
  } else if (d.password) {
    update.password_hash = hashPassword(d.password);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("galleries").update(update).eq("id", id);

  if (error) {
    return { error: "No se pudo guardar. Intenta de nuevo.", success: false };
  }

  revalidatePath("/admin/galerias");
  revalidatePath(`/admin/galerias/${id}`);
  return { error: null, success: true, id };
}

export async function disconnectGoogleDrive() {
  const supabase = await createClient();
  await disconnectGoogle(supabase);
  revalidatePath("/admin/galerias");
}

export async function deleteGallery(id: string) {
  const supabase = await createClient();
  await supabase.from("galleries").delete().eq("id", id);
  revalidatePath("/admin/galerias");
}

export async function setGalleryStatus(id: string, status: string) {
  const supabase = await createClient();
  await supabase.from("galleries").update({ status }).eq("id", id);
  revalidatePath("/admin/galerias");
  revalidatePath(`/admin/galerias/${id}`);
}

// Lee la carpeta de Drive y refresca la lista de fotos cacheadas.
export async function syncGalleryPhotos(
  id: string,
): Promise<{ error: string | null; count: number }> {
  const supabase = await createClient();

  const { data: gallery } = await supabase
    .from("galleries")
    .select("id, drive_folder_id")
    .eq("id", id)
    .single();

  if (!gallery?.drive_folder_id) {
    return { error: "Esta galería no tiene una carpeta de Drive configurada.", count: 0 };
  }

  let images;
  let folderName: string | null = null;
  try {
    // Pasamos el cliente autenticado para leer el token de Google sin
    // necesitar service_role en el flujo de admin.
    images = await listFolderImages(gallery.drive_folder_id, supabase);
    folderName = await getFolderName(gallery.drive_folder_id, supabase);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error leyendo Google Drive.";
    return { error: msg, count: 0 };
  }

  // Estrategia simple y consistente: reemplazamos el set de fotos cacheadas.
  await supabase.from("gallery_photos").delete().eq("gallery_id", id);

  if (images.length > 0) {
    const rows = images.map((img, index) => ({
      gallery_id: id,
      drive_file_id: img.id,
      filename: img.name,
      mime_type: img.mimeType,
      thumbnail_url: img.thumbnailLink,
      width: img.width,
      height: img.height,
      size_bytes: img.size,
      order_index: index,
    }));
    const { error } = await supabase.from("gallery_photos").insert(rows);
    if (error) {
      return { error: "Se leyó Drive pero no se pudieron guardar las fotos.", count: 0 };
    }
  }

  await supabase
    .from("galleries")
    .update({
      drive_folder_name: folderName,
      last_synced_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath(`/admin/galerias/${id}`);
  return { error: null, count: images.length };
}
