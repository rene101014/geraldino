import { NextResponse } from "next/server";
import { getGalleryByToken, grantGalleryAccess } from "@/lib/galleries/access";
import { verifyPassword } from "@/lib/galleries/token";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Valida la contraseña de una galería privada y otorga la cookie de acceso.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const gallery = await getGalleryByToken(token);
  if (!gallery) return new NextResponse("No disponible", { status: 404 });

  const form = await request.formData();
  const password = String(form.get("password") ?? "");

  const back = (q: string) =>
    NextResponse.redirect(new URL(`/g/${token}${q}`, SITE), { status: 303 });

  if (!gallery.password_hash || !verifyPassword(password, gallery.password_hash)) {
    return back("?error=1");
  }

  await grantGalleryAccess(gallery);
  return back("");
}
