import { NextResponse } from "next/server";
import { getGalleryByToken, hasGalleryAccess } from "@/lib/galleries/access";
import { fetchThumbnail, fetchFileMedia } from "@/lib/google/drive";
import { createServiceClient } from "@/lib/supabase/service";

// Proxy público de imágenes de una galería. Valida token + acceso, luego
// transmite la imagen desde Google Drive con el token del estudio.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string; fileId: string }> },
) {
  const { token, fileId } = await params;

  const gallery = await getGalleryByToken(token);
  if (!gallery || gallery.status === "closed") {
    return new NextResponse("No disponible", { status: 404 });
  }
  if (!(await hasGalleryAccess(gallery))) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  // El fileId debe pertenecer a esta galería (evita usar el proxy para leer
  // cualquier archivo de Drive).
  const supabase = createServiceClient();
  const { data: photo } = await supabase
    .from("gallery_photos")
    .select("id, filename")
    .eq("gallery_id", gallery.id)
    .eq("drive_file_id", fileId)
    .maybeSingle();
  if (!photo) {
    return new NextResponse("No encontrado", { status: 404 });
  }

  const url = new URL(request.url);
  const download = url.searchParams.get("download") === "1";
  const sizeParam = url.searchParams.get("size");

  try {
    const res =
      sizeParam && !download
        ? await fetchThumbnail(fileId, Number(sizeParam) || 800)
        : await fetchFileMedia(fileId);

    if (!res.ok || !res.body) {
      return new NextResponse("No encontrado", { status: 404 });
    }

    const headers: Record<string, string> = {
      "Content-Type": res.headers.get("Content-Type") || "image/jpeg",
      "Cache-Control": "private, max-age=3600",
    };
    if (download) {
      headers["Content-Disposition"] =
        `attachment; filename="${(photo as { filename: string }).filename}"`;
    }

    return new NextResponse(res.body, { headers });
  } catch {
    return new NextResponse("Error", { status: 502 });
  }
}
