"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GalleryPhoto } from "@/lib/data/galleries";

export function DeliveryGallery({
  token,
  title,
  photos,
  allowDownloads,
}: {
  token: string;
  title: string;
  photos: GalleryPhoto[];
  allowDownloads: boolean;
}) {
  const [lightbox, setLightbox] = useState<GalleryPhoto | null>(null);

  function downloadOne(p: GalleryPhoto) {
    const a = document.createElement("a");
    a.href = `/api/g/${token}/photo/${p.drive_file_id}?download=1`;
    a.download = p.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function downloadAll() {
    toast.info("Iniciando descarga de todas las fotos…");
    for (const p of photos) {
      downloadOne(p);
      // Pequeña pausa para que el navegador no bloquee descargas múltiples.
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {photos.length} foto(s).
            {allowDownloads ? " Puedes descargarlas." : ""}
          </p>
        </div>
        {allowDownloads && (
          <Button onClick={downloadAll} variant="outline">
            <Download className="mr-1 size-4" />
            Descargar todas
          </Button>
        )}
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((p) => (
          <div key={p.id} className="group relative aspect-square overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/g/${token}/photo/${p.drive_file_id}?size=600`}
              alt={p.filename}
              loading="lazy"
              onClick={() => setLightbox(p)}
              className="size-full cursor-zoom-in object-cover"
            />
            {allowDownloads && (
              <button
                type="button"
                onClick={() => downloadOne(p)}
                title="Descargar"
                className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Download className="size-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-4 top-4 text-white/80 hover:text-white"
            onClick={() => setLightbox(null)}
          >
            <X className="size-7" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/g/${token}/photo/${lightbox.drive_file_id}?size=1600`}
            alt={lightbox.filename}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {allowDownloads && (
            <Button
              className="absolute bottom-4 left-1/2 -translate-x-1/2"
              onClick={(e) => {
                e.stopPropagation();
                downloadOne(lightbox);
              }}
            >
              <Download className="mr-1 size-4" />
              Descargar
            </Button>
          )}
        </div>
      )}
    </main>
  );
}
