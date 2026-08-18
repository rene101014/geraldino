const VIMEO_ID_RE = /vimeo\.com\/(?:video\/|channels\/[^/]+\/|groups\/[^/]+\/videos\/|showcase\/\d+\/video\/)?(\d+)/i;

// Acepta tanto un link completo de Vimeo (varias formas de URL) como un ID
// pelado, para que el campo del admin sea tolerante a lo que el usuario pegue.
export function extractVimeoId(input: string): string | null {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;
  const match = trimmed.match(VIMEO_ID_RE);
  return match ? match[1] : null;
}

export type VimeoOEmbed = {
  title: string;
  thumbnail_url: string;
  duration: number;
  width: number;
  height: number;
};

export async function fetchVimeoOEmbed(id: string): Promise<VimeoOEmbed | null> {
  const url = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(
    `https://vimeo.com/${id}`,
  )}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}
