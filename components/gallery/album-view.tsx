"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GalleryPhoto } from "@/lib/data/galleries";

// Álbum diseñado: portada + páginas alternadas (una a sangre completa, luego
// pares). Presentación de scroll vertical, fondo oscuro tipo revista.
export function AlbumView({
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
  const src = (p: GalleryPhoto, size: number) =>
    `/api/g/${token}/photo/${p.drive_file_id}?size=${size}`;

  function downloadOne(p: GalleryPhoto) {
    const a = document.createElement("a");
    a.href = `/api/g/${token}/photo/${p.drive_file_id}?download=1`;
    a.download = p.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const [cover, ...rest] = photos;

  // Agrupamos el resto en páginas: alterna 1 grande y pares.
  const spreads: GalleryPhoto[][] = [];
  let i = 0;
  let toggle = true;
  while (i < rest.length) {
    if (toggle) {
      spreads.push([rest[i]]);
      i += 1;
    } else {
      spreads.push(rest.slice(i, i + 2));
      i += 2;
    }
    toggle = !toggle;
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Portada */}
      <section className="relative flex h-screen items-end justify-center overflow-hidden">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src(cover, 1600)}
            alt={title}
            className="absolute inset-0 size-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="relative mb-16 text-center">
          <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h1>
        </div>
      </section>

      {/* Páginas */}
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-16 sm:space-y-16 sm:py-24">
        {spreads.map((spread, idx) => (
          <div
            key={idx}
            className={
              spread.length === 2
                ? "grid grid-cols-2 gap-3 sm:gap-6"
                : "flex justify-center"
            }
          >
            {spread.map((p) => (
              <figure key={p.id} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src(p, 1400)}
                  alt={p.filename}
                  loading="lazy"
                  className="w-full rounded-sm object-contain shadow-2xl"
                />
                {allowDownloads && (
                  <button
                    type="button"
                    onClick={() => downloadOne(p)}
                    title="Descargar"
                    className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Download className="size-4" />
                  </button>
                )}
              </figure>
            ))}
          </div>
        ))}
      </div>

      <footer className="pb-16 text-center text-xs text-neutral-500">
        {title}
      </footer>
    </main>
  );
}
