import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchThumbnail } from "@/lib/google/drive";

// Proxy solo-admin para previsualizar miniaturas de Drive en el panel.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const { fileId } = await params;
  const size = Number(new URL(request.url).searchParams.get("size") || 600);

  try {
    const res = await fetchThumbnail(fileId, size, supabase);
    if (!res.ok || !res.body) {
      return new NextResponse("No encontrado", { status: 404 });
    }
    return new NextResponse(res.body, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Error leyendo Drive", { status: 502 });
  }
}
