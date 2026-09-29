import type { SupabaseClient } from "@supabase/supabase-js";
import { getValidAccessToken } from "@/lib/google/oauth";
import type { Database } from "@/types/database.types";

type DB = SupabaseClient<Database>;

// Lectura de Google Drive vía la API REST v3. Todo server-side con el access
// token del estudio. Soporta tanto Mi unidad como unidades compartidas.

const DRIVE_FILES = "https://www.googleapis.com/drive/v3/files";

export type DriveImage = {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink: string | null;
  width: number | null;
  height: number | null;
  size: number | null;
};

// Acepta un ID de carpeta o pega la URL de Drive y extrae el ID.
// Ej: https://drive.google.com/drive/folders/<ID>?usp=sharing
export function parseFolderId(input: string): string {
  const trimmed = input.trim();
  const match =
    trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return trimmed; // se asume que ya es un ID
}

async function driveFetch(url: string, client?: DB): Promise<Response> {
  const token = await getValidAccessToken(client);
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } });
}

export async function getFolderName(
  folderId: string,
  client?: DB,
): Promise<string | null> {
  const params = new URLSearchParams({
    fields: "id,name,mimeType",
    supportsAllDrives: "true",
  });
  const res = await driveFetch(`${DRIVE_FILES}/${folderId}?${params}`, client);
  if (!res.ok) return null;
  const data = (await res.json()) as { name?: string; mimeType?: string };
  return data.name ?? null;
}

// Lista todas las imágenes (paginando) de una carpeta, ordenadas por nombre
// para respetar el orden de la sesión.
export async function listFolderImages(
  folderId: string,
  client?: DB,
): Promise<DriveImage[]> {
  const images: DriveImage[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields:
        "nextPageToken, files(id,name,mimeType,thumbnailLink,size,imageMediaMetadata(width,height))",
      pageSize: "1000",
      orderBy: "name_natural",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
      corpora: "allDrives",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const res = await driveFetch(`${DRIVE_FILES}?${params}`, client);
    if (!res.ok) {
      throw new Error(`Drive list falló: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as {
      nextPageToken?: string;
      files?: Array<{
        id: string;
        name: string;
        mimeType: string;
        thumbnailLink?: string;
        size?: string;
        imageMediaMetadata?: { width?: number; height?: number };
      }>;
    };

    for (const f of data.files ?? []) {
      images.push({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        thumbnailLink: f.thumbnailLink ?? null,
        width: f.imageMediaMetadata?.width ?? null,
        height: f.imageMediaMetadata?.height ?? null,
        size: f.size ? Number(f.size) : null,
      });
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return images;
}

// Transmite el contenido binario de un archivo (para el proxy de imágenes y
// las descargas). Devuelve la Response de Google para hacer streaming directo.
export async function fetchFileMedia(
  fileId: string,
  client?: DB,
): Promise<Response> {
  const params = new URLSearchParams({
    alt: "media",
    supportsAllDrives: "true",
  });
  return driveFetch(`${DRIVE_FILES}/${fileId}?${params}`, client);
}

// Miniatura redimensionada de Drive. `size` es el ancho en px (Drive escala el
// lado mayor). Requiere el token, por eso se usa server-side dentro del proxy.
export async function fetchThumbnail(
  fileId: string,
  size = 600,
  client?: DB,
): Promise<Response> {
  // La thumbnailLink de Drive admite el sufijo =s<px>. La resolvemos pidiendo
  // el metadato y ajustando el tamaño.
  const params = new URLSearchParams({
    fields: "thumbnailLink",
    supportsAllDrives: "true",
  });
  const metaRes = await driveFetch(`${DRIVE_FILES}/${fileId}?${params}`, client);
  if (!metaRes.ok) return fetchFileMedia(fileId, client);

  const meta = (await metaRes.json()) as { thumbnailLink?: string };
  if (!meta.thumbnailLink) return fetchFileMedia(fileId, client);

  const token = await getValidAccessToken(client);
  const sized = meta.thumbnailLink.replace(/=s\d+$/, `=s${size}`);
  const res = await fetch(sized, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // Si la miniatura falla, caemos al archivo completo.
  return res.ok ? res : fetchFileMedia(fileId, client);
}
