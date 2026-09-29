import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeAndStore } from "@/lib/google/oauth";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Recibe el redirect de Google, valida el estado y guarda los tokens.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const back = (params: string) =>
    NextResponse.redirect(new URL(`/admin/galerias?${params}`, SITE));

  if (error) return back(`google=denied`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/admin/login", SITE));

  const cookieStore = await cookies();
  const expected = cookieStore.get("google_oauth_state")?.value;
  cookieStore.delete("google_oauth_state");

  if (!code || !state || !expected || state !== expected) {
    return back("google=error");
  }

  try {
    // Cliente autenticado: guarda el token sin depender de service_role.
    await exchangeCodeAndStore(code, supabase);
  } catch {
    return back("google=error");
  }

  return back("google=connected");
}
