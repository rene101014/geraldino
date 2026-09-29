import type { Metadata } from "next";
import { getGalleryByToken, hasGalleryAccess } from "@/lib/galleries/access";
import { createServiceClient } from "@/lib/supabase/service";
import type { GalleryPhoto } from "@/lib/data/galleries";
import { PasswordGate } from "@/components/gallery/password-gate";
import { SelectionGallery } from "@/components/gallery/selection-gallery";
import { DeliveryGallery } from "@/components/gallery/delivery-gallery";
import { AlbumView } from "@/components/gallery/album-view";

// Las galerías nunca deben indexarse en buscadores.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PublicGalleryPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  const gallery = await getGalleryByToken(token);

  if (!gallery) {
    return <Centered title="Galería no disponible" subtitle="El enlace no es válido o fue eliminado." />;
  }
  if (gallery.status === "closed" || gallery.status === "draft") {
    return (
      <Centered
        title={gallery.title}
        subtitle="Esta galería no está disponible en este momento."
      />
    );
  }

  if (!(await hasGalleryAccess(gallery))) {
    return <PasswordGate token={token} title={gallery.title} error={error === "1"} />;
  }

  const supabase = createServiceClient();
  const { data: photosData } = await supabase
    .from("gallery_photos")
    .select("*")
    .eq("gallery_id", gallery.id)
    .order("order_index", { ascending: true });
  const photos = (photosData ?? []) as GalleryPhoto[];

  if (photos.length === 0) {
    return <Centered title={gallery.title} subtitle="Todavía no hay fotos en esta galería." />;
  }

  if (gallery.type === "selection") {
    return (
      <SelectionGallery
        token={token}
        title={gallery.title}
        photos={photos}
        limit={gallery.selection_limit}
        alreadySubmitted={gallery.status === "submitted"}
      />
    );
  }

  if (gallery.delivery_format === "album") {
    return (
      <AlbumView
        token={token}
        title={gallery.title}
        photos={photos}
        allowDownloads={gallery.allow_downloads}
      />
    );
  }

  return (
    <DeliveryGallery
      token={token}
      title={gallery.title}
      photos={photos}
      allowDownloads={gallery.allow_downloads}
    />
  );
}

function Centered({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="font-heading text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </main>
  );
}
