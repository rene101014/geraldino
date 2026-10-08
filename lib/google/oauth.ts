import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase/service";
import type { Database } from "@/types/database.types";

type DB = SupabaseClient<Database>;

// Las operaciones sobre google_tokens ocurren casi siempre en contexto admin
// (autenticado por cookie), donde basta el cliente normal. Solo las rutas
// públicas (proxy de fotos) necesitan service_role. Por eso aceptamos un
// cliente opcional y caemos a service_role si no se pasa.
function db(client?: DB): DB {
  return client ?? createServiceClient();
}

// Conexión con Google Drive vía OAuth. Guardamos un único refresh token
// (la cuenta del estudio) en la tabla google_tokens y renovamos el access
// token cuando expira. Implementado con fetch directo a los endpoints de
// Google para no arrastrar la dependencia pesada `googleapis` al bundle.

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v2/userinfo";

// Solo lectura de Drive; nunca modificamos los archivos del usuario.
const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
];

function clientId(): string {
  const id = process.env.GOOGLE_CLIENT_ID;
  if (!id) throw new Error("Falta GOOGLE_CLIENT_ID en el entorno.");
  return id;
}

function clientSecret(): string {
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!secret) throw new Error("Falta GOOGLE_CLIENT_SECRET en el entorno.");
  return secret;
}

export function redirectUri(): string {
  const base =
    process.env.GOOGLE_REDIRECT_URI ||
    `${(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")}/api/google/oauth/callback`;
  return base;
}

// URL a la que mandamos al admin para autorizar. `state` protege contra CSRF.
export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline", // para obtener refresh_token
    prompt: "consent", // fuerza refresh_token incluso si ya autorizó antes
    include_granted_scopes: "true",
    state,
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
};

// Intercambia el `code` del callback por tokens y guarda el refresh token.
export async function exchangeCodeAndStore(
  code: string,
  client?: DB,
): Promise<void> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId(),
      client_secret: clientSecret(),
      redirect_uri: redirectUri(),
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    throw new Error(`Google token exchange falló: ${res.status} ${await res.text()}`);
  }

  const tokens = (await res.json()) as TokenResponse;
  if (!tokens.refresh_token) {
    // Sin refresh_token no podemos leer Drive a largo plazo. Suele pasar si
    // el usuario ya había autorizado antes sin `prompt=consent`.
    throw new Error(
      "Google no devolvió refresh_token. Revoca el acceso en tu cuenta de Google y vuelve a conectar.",
    );
  }

  const email = await fetchEmail(tokens.access_token);
  const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  const supabase = db(client);
  await supabase.from("google_tokens").upsert(
    {
      singleton: true,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_type: tokens.token_type,
      scope: tokens.scope,
      expiry,
      google_email: email,
    },
    { onConflict: "singleton" },
  );
}

async function fetchEmail(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(USERINFO_ENDPOINT, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { email?: string };
    return data.email ?? null;
  } catch {
    return null;
  }
}

// Devuelve un access token válido, renovándolo con el refresh token si expiró.
// Lanza si el estudio nunca conectó Google.
export async function getValidAccessToken(client?: DB): Promise<string> {
  const supabase = db(client);
  const { data: row } = await supabase
    .from("google_tokens")
    .select("access_token, refresh_token, expiry")
    .eq("singleton", true)
    .maybeSingle();

  if (!row?.refresh_token) {
    throw new Error("Google Drive no está conectado. Conéctalo desde el panel.");
  }

  // Margen de 60s para no usar un token a punto de expirar.
  const stillValid =
    row.access_token &&
    row.expiry &&
    new Date(row.expiry).getTime() - 60_000 > Date.now();
  if (stillValid) return row.access_token as string;

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId(),
      client_secret: clientSecret(),
      refresh_token: row.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    // Google devuelve JSON { error, error_description } cuando falla la
    // renovación. Lo exponemos para poder diagnosticar en vez de ver solo
    // el código de estado.
    const body = await res.text();
    let googleError = "";
    try {
      const parsed = JSON.parse(body) as {
        error?: string;
        error_description?: string;
      };
      googleError = [parsed.error, parsed.error_description]
        .filter(Boolean)
        .join(": ");
    } catch {
      googleError = body;
    }

    // invalid_grant = el refresh token ya no sirve (revocado, cambio de
    // contraseña, o expirado por app en modo "Testing" tras 7 días). Hay que
    // reconectar Google desde el panel.
    if (googleError.includes("invalid_grant")) {
      throw new Error(
        "La conexión con Google expiró o fue revocada. Reconecta Google Drive desde el panel de administración.",
      );
    }

    throw new Error(
      `No se pudo renovar el token de Google: ${res.status} ${googleError}`,
    );
  }

  const tokens = (await res.json()) as TokenResponse;
  const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  await supabase
    .from("google_tokens")
    .update({ access_token: tokens.access_token, expiry })
    .eq("singleton", true);

  return tokens.access_token;
}

// Estado de la conexión para mostrarlo en el panel admin.
export async function getGoogleConnection(client?: DB): Promise<{
  connected: boolean;
  email: string | null;
}> {
  const supabase = db(client);
  const { data } = await supabase
    .from("google_tokens")
    .select("google_email, refresh_token")
    .eq("singleton", true)
    .maybeSingle();
  return {
    connected: !!data?.refresh_token,
    email: data?.google_email ?? null,
  };
}

export async function disconnectGoogle(client?: DB): Promise<void> {
  const supabase = db(client);
  await supabase.from("google_tokens").delete().eq("singleton", true);
}
