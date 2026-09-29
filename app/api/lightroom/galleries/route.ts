import { NextResponse } from "next/server";
import { checkLightroomKey } from "@/lib/lightroom/auth";
import { createServiceClient } from "@/lib/supabase/service";

// Lista los envíos de selección recientes para el desplegable del plugin de
// Lightroom. Formato de texto simple (una línea por envío, separado por tabs)
// para que el plugin no necesite parsear JSON:
//   submissionId \t título \t cliente \t nºfotos \t fecha
export async function GET(request: Request) {
  if (!checkLightroomKey(request)) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("gallery_submissions")
    .select("id, client_name, selected_count, submitted_at, galleries!inner(title, client_name)")
    .order("submitted_at", { ascending: false })
    .limit(100);

  if (error) return new NextResponse("Error", { status: 500 });

  const clean = (s: string | null) =>
    (s ?? "").replace(/[\t\n\r]+/g, " ").trim();

  const lines = (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string;
      client_name: string | null;
      selected_count: number;
      submitted_at: string;
      galleries: { title: string; client_name: string | null };
    };
    const client = clean(r.client_name || r.galleries?.client_name || "");
    return [
      r.id,
      clean(r.galleries?.title || "Galería"),
      client,
      String(r.selected_count ?? 0),
      r.submitted_at,
    ].join("\t");
  });

  return new NextResponse(lines.join("\n") + (lines.length ? "\n" : ""), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
