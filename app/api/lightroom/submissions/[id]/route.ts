import { NextResponse } from "next/server";
import { checkLightroomKey } from "@/lib/lightroom/auth";
import { createServiceClient } from "@/lib/supabase/service";

// Devuelve los nombres de archivo de un envío de selección, uno por línea,
// para que el plugin de Lightroom los marque por coincidencia de nombre.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkLightroomKey(request)) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const { id } = await params;
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("gallery_selection_items")
    .select("filename")
    .eq("submission_id", id);

  if (error) return new NextResponse("Error", { status: 500 });

  const names = [...new Set((data ?? []).map((r) => (r as { filename: string }).filename))].sort();
  return new NextResponse(names.join("\n") + (names.length ? "\n" : ""), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
