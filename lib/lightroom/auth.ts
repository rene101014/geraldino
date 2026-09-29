import { timingSafeEqual } from "node:crypto";

// Valida la "llave de estudio" que envía el plugin de Lightroom en el header
// x-api-key (o ?key=). Comparación en tiempo constante.
export function checkLightroomKey(request: Request): boolean {
  const expected = process.env.LIGHTROOM_API_KEY;
  if (!expected) return false;

  const url = new URL(request.url);
  const provided =
    request.headers.get("x-api-key") || url.searchParams.get("key") || "";

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
