import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Exporta los nombres de archivo seleccionados como .txt (uno por línea) para
// importarlos en Lightroom Classic. Solo admin.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("No autorizado", { status: 401 });

  const { id } = await params;
  const submissionId = new URL(request.url).searchParams.get("submission");

  let query = supabase
    .from("gallery_selection_items")
    .select("filename, submission_id, gallery_submissions!inner(gallery_id)")
    .eq("gallery_submissions.gallery_id", id);

  if (submissionId) query = query.eq("submission_id", submissionId);

  const { data, error } = await query;
  if (error) return new NextResponse("Error", { status: 500 });

  const names = (data ?? []).map((r) => (r as { filename: string }).filename);
  // Sin duplicados y ordenados como en la sesión.
  const unique = [...new Set(names)].sort();
  const body = unique.join("\n") + "\n";

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="seleccion-${id}.txt"`,
    },
  });
}
