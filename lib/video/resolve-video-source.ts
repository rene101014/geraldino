import { storagePublicUrl } from "@/lib/storage/public-url";
import type { PortfolioItem } from "@/lib/data/portfolio";

export type VideoSource = {
  src: string;
  poster?: string;
  mimeType?: string;
};

// Único lugar que sabe de dónde sale el archivo reproducible. Hoy todo vive
// en Supabase Storage; el día que el video se mueva a Cloudflare Stream (u
// otro proveedor), solo cambia esta función y el formulario de subida del
// admin — el VideoPlayer y la grilla de portafolio no se tocan.
export function resolveVideoSource(
  item: Pick<
    PortfolioItem,
    "provider" | "storage_path" | "external_id" | "external_url" | "thumbnail_path"
  >,
): VideoSource {
  const poster = item.thumbnail_path
    ? storagePublicUrl("portfolio", item.thumbnail_path)
    : undefined;

  switch (item.provider) {
    case "supabase":
      return {
        src: storagePublicUrl("portfolio", item.storage_path!),
        poster,
        mimeType: "video/mp4",
      };
    case "cloudflare_stream":
      return {
        src: `https://videodelivery.net/${item.external_id}/manifest/video.m3u8`,
        poster:
          poster ?? `https://videodelivery.net/${item.external_id}/thumbnails/thumbnail.jpg`,
      };
    case "external_url":
      return { src: item.external_url!, poster };
    default:
      throw new Error(`Proveedor de video desconocido: ${item.provider}`);
  }
}
