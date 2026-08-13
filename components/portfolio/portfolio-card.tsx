"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { Volume2 } from "lucide-react";
import { storagePublicUrl } from "@/lib/storage/public-url";
import type { PortfolioItem } from "@/lib/data/portfolio";

export function PortfolioCard({
  item,
  onOpen,
  index = 0,
}: {
  item: PortfolioItem;
  onOpen: () => void;
  index?: number;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Cada tile se mueve a un ritmo/dirección ligeramente distinto según su
  // columna, para que el grid se sienta vivo con el scroll (no solo los
  // videos reproduciéndose) — inspirado en el grid de trabajo de btanc.do.
  const range = 10 + (index % 3) * 4;
  const direction = index % 2 === 0 ? 1 : -1;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${-range * direction}%`, `${range * direction}%`],
  );

  const thumbPath = item.thumbnail_path ?? item.storage_path;
  const thumbUrl = thumbPath ? storagePublicUrl("portfolio", thumbPath) : null;
  const videoUrl =
    item.media_type === "video" && item.storage_path
      ? storagePublicUrl("portfolio", item.storage_path)
      : null;

  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      className="group relative block aspect-[4/5] w-full overflow-hidden bg-muted text-left sm:aspect-square"
    >
      <motion.div style={{ y }} className="absolute -top-[15%] -bottom-[15%] inset-x-0">
        {videoUrl ? (
          <video
            src={videoUrl}
            poster={thumbUrl ?? undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
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
      </motion.div>

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
