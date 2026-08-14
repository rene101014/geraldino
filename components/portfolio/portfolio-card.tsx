"use client";

import Image from "next/image";
import { Volume2 } from "lucide-react";
import { storagePublicUrl } from "@/lib/storage/public-url";
import type { PortfolioItem } from "@/lib/data/portfolio";

// Antes este tile usaba motion/react (useScroll + useTransform) para un
// efecto parallax por columna. Es el mismo patrón que causaba el bug de
// Reveal en iOS Safari (contenido/tiles que aparecían y desaparecían con
// el scroll, botones que dejaban de responder). Se quitó por la misma
// razón: ver components/site/reveal.tsx.
export function PortfolioCard({
  item,
  onOpen,
}: {
  item: PortfolioItem;
  onOpen: () => void;
  index?: number;
}) {
  const thumbPath = item.thumbnail_path ?? item.storage_path;
  const thumbUrl = thumbPath ? storagePublicUrl("portfolio", thumbPath) : null;
  const videoUrl =
    item.media_type === "video" && item.storage_path
      ? storagePublicUrl("portfolio", item.storage_path)
      : null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block aspect-[4/5] w-full overflow-hidden bg-muted text-left sm:aspect-square"
    >
      <div className="absolute inset-0">
        {videoUrl ? (
          <video
            src={videoUrl}
            poster={thumbUrl ?? undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : thumbUrl ? (
          <Image
            src={thumbUrl}
            alt={item.title}
            fill
            sizes="(min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : null}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" />

      {item.media_type === "video" ? (
        <span
          aria-hidden="true"
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur"
        >
          <Volume2 className="size-4" />
        </span>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-white/70">
          {item.category}
        </p>
        <p className="font-heading text-white">{item.title}</p>
      </div>
    </button>
  );
}
