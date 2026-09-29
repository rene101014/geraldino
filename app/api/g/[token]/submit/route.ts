import { NextResponse } from "next/server";
import { getGalleryByToken, hasGalleryAccess } from "@/lib/galleries/access";
import { createServiceClient } from "@/lib/supabase/service";

// Recibe la selección del cliente: lista de drive_file_id + nombre/nota
// opcionales. Valida el cupo y guarda un envío con sus fotos elegidas.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const gallery = await getGalleryByToken(token);
  if (!gallery || gallery.type !== "selection") {
    return NextResponse.json({ error: "No disponible" }, { status: 404 });
  }
  if (!(await hasGalleryAccess(gallery))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let payload: { fileIds?: string[]; clientName?: string; note?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const fileIds = Array.isArray(payload.fileIds) ? payload.fileIds : [];
  if (fileIds.length === 0) {
    return NextResponse.json({ error: "No elegiste ninguna foto." }, { status: 400 });
  }
  if (gallery.selection_limit && fileIds.length > gallery.selection_limit) {
    return NextResponse.json(
      { error: `El cupo es de ${gallery.selection_limit} fotos.` },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();

  // Solo aceptamos fotos que realmente pertenezcan a la galería.
  const { data: photos } = await supabase
    .from("gallery_photos")
    .select("id, drive_file_id, filename")
    .eq("gallery_id", gallery.id)
    .in("drive_file_id", fileIds);

  const valid = (photos ?? []) as {
    id: string;
    drive_file_id: string;
    filename: string;
  }[];
  if (valid.length === 0) {
    return NextResponse.json({ error: "Selección inválida." }, { status: 400 });
  }

  const { data: submission, error: subErr } = await supabase
    .from("gallery_submissions")
    .insert({
      gallery_id: gallery.id,
      client_name: payload.clientName?.slice(0, 200) || gallery.client_name || null,
      client_email: gallery.client_email,
      note: payload.note?.slice(0, 2000) || null,
      selected_count: valid.length,
    })
    .select("id")
    .single();

  if (subErr || !submission) {
    return NextResponse.json({ error: "No se pudo guardar." }, { status: 500 });
  }

  const items = valid.map((p) => ({
    submission_id: submission.id,
    gallery_photo_id: p.id,
    filename: p.filename,
  }));
  const { error: itemsErr } = await supabase
    .from("gallery_selection_items")
    .insert(items);
  if (itemsErr) {
    return NextResponse.json({ error: "No se pudo guardar la selección." }, { status: 500 });
  }

  await supabase
    .from("galleries")
    .update({ status: "submitted" })
    .eq("id", gallery.id);

  return NextResponse.json({ ok: true, count: valid.length });
}
