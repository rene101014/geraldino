import { NextResponse, type NextRequest } from "next/server";
import { processCampaignBatch } from "@/lib/email/campaign";

// Worker de envío por lotes. Lo llama el cron de Vercel cada minuto (ver
// vercel.json). Procesa un lote de la campaña en cola y termina; el siguiente
// disparo del cron toma el siguiente lote hasta vaciar la cola.
//
// Protegido con CRON_SECRET: Vercel Cron envía automáticamente la cabecera
// Authorization: Bearer <CRON_SECRET>. Nadie más puede dispararlo.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const result = await processCampaignBatch();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error desconocido" },
      { status: 500 },
    );
  }
}
