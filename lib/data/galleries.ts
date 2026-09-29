import type { Database } from "@/types/database.types";

export type Gallery = Database["public"]["Tables"]["galleries"]["Row"];
export type GalleryPhoto = Database["public"]["Tables"]["gallery_photos"]["Row"];
export type GallerySubmission =
  Database["public"]["Tables"]["gallery_submissions"]["Row"];
export type GallerySelectionItem =
  Database["public"]["Tables"]["gallery_selection_items"]["Row"];

export const GALLERY_STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  active: "Activa",
  submitted: "Selección enviada",
  closed: "Cerrada",
};

export const GALLERY_TYPE_LABELS: Record<string, string> = {
  selection: "Selección",
  delivery: "Entrega",
};
