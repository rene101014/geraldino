import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ImageOff } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { GalleryForm } from "@/components/admin/gallery-form";
import { GalleryActions } from "@/components/admin/gallery-actions";
import {
  GALLERY_STATUS_LABELS,
  GALLERY_TYPE_LABELS,
  type Gallery,
  type GalleryPhoto,
} from "@/lib/data/galleries";

type SubmissionWithItems = {
  id: string;
  client_name: string | null;
  client_email: string | null;
  note: string | null;
  selected_count: number;
  submitted_at: string;
  gallery_selection_items: { filename: string }[];
};

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: gallery } = await supabase
    .from("galleries")
    .select("*")
    .eq("id", id)
    .single();
  if (!gallery) notFound();
  const g = gallery as Gallery;

  const { data: photosData } = await supabase
    .from("gallery_photos")
    .select("*")
    .eq("gallery_id", id)
    .order("order_index", { ascending: true });
  const photos = (photosData ?? []) as GalleryPhoto[];

  const { data: subsData } = await supabase
    .from("gallery_submissions")
    .select("*, gallery_selection_items(filename)")
    .eq("gallery_id", id)
    .order("submitted_at", { ascending: false });
  const submissions = (subsData ?? []) as unknown as SubmissionWithItems[];

  return (
    <div className="space-y-6">
      <Link
        href="/admin/galerias"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Galerías
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {g.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {GALLERY_TYPE_LABELS[g.type] ?? g.type}
            </Badge>
            <Badge variant="outline">
              {GALLERY_STATUS_LABELS[g.status] ?? g.status}
            </Badge>
            <Badge variant="outline">
              {g.visibility === "private" ? "Privada" : "Pública"}
            </Badge>
            {g.type === "selection" && g.selection_limit && (
              <Badge variant="outline">Cupo: {g.selection_limit}</Badge>
            )}
          </div>
        </div>
        <GalleryForm gallery={g} />
      </div>

      <GalleryActions gallery={g} />

      <dl className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-card p-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs text-muted-foreground">Cliente</dt>
          <dd>{g.client_name || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Fotos</dt>
          <dd>{photos.length}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Carpeta Drive</dt>
          <dd className="truncate">{g.drive_folder_name || g.drive_folder_id || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Última sincronización</dt>
          <dd>
            {g.last_synced_at
              ? new Date(g.last_synced_at).toLocaleString("es-DO")
              : "Nunca"}
          </dd>
        </div>
      </dl>

      {/* Selecciones del cliente */}
      {g.type === "selection" && (
        <section>
          <h2 className="font-heading text-lg font-semibold">
            Selecciones del cliente
          </h2>
          {submissions.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              El cliente todavía no ha enviado su selección.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {submissions.map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {s.client_name || g.client_name || "Cliente"} ·{" "}
                        {s.selected_count} foto(s)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.submitted_at).toLocaleString("es-DO")}
                      </p>
                    </div>
                    <a
                      href={`/api/admin/galerias/${g.id}/export?submission=${s.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      Exportar nombres (Lightroom)
                    </a>
                  </div>
                  {s.note && (
                    <p className="mt-2 text-sm text-muted-foreground">“{s.note}”</p>
                  )}
                  <p className="mt-2 break-words font-mono text-xs text-muted-foreground">
                    {s.gallery_selection_items.map((i) => i.filename).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Grid de fotos */}
      <section>
        <h2 className="font-heading text-lg font-semibold">Fotos</h2>
        {photos.length === 0 ? (
          <div className="mt-3 flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-10 text-center">
            <ImageOff className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No hay fotos aún. Pulsa &quot;Sincronizar fotos&quot; para traerlas
              desde tu carpeta de Google Drive.
            </p>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.id}
                src={`/api/admin/drive/${p.drive_file_id}?size=400`}
                alt={p.filename}
                loading="lazy"
                className="aspect-square w-full rounded-md object-cover"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
