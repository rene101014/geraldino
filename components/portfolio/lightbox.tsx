"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VideoPlayer } from "@/components/portfolio/video-player/video-player";
import { VimeoEmbed } from "@/components/portfolio/vimeo-embed";
import { resolveVideoSource } from "@/lib/video/resolve-video-source";
import { storagePublicUrl } from "@/lib/storage/public-url";
import type { PortfolioItem } from "@/lib/data/portfolio";

export function Lightbox({
  item,
  onOpenChange,
}: {
  item: PortfolioItem | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-w-4xl gap-0 border-none bg-transparent p-0 shadow-none sm:max-w-4xl [&>button]:top-4 [&>button]:right-4 [&>button]:text-background [&>button]:hover:bg-background/10 [&>button]:hover:text-background"
      >
        <DialogTitle className="sr-only">{item?.title}</DialogTitle>
        {item ? (
          <div className="overflow-hidden rounded-2xl bg-foreground shadow-2xl">
            {item.media_type === "video" ? (
              item.provider === "vimeo" && item.external_id ? (
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <VimeoEmbed id={item.external_id} title={item.title} />
                </div>
              ) : (
                <VideoPlayer
                  source={resolveVideoSource(item)}
                  title={item.title}
                  autoPlay
                  className="rounded-none"
                />
              )
            ) : (
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-black sm:aspect-video">
                <Image
                  src={storagePublicUrl("portfolio", item.storage_path!)}
                  alt={item.title}
                  fill
                  sizes="90vw"
                  className="object-contain"
                  priority
                />
              </div>
            )}

            <div className="flex items-center justify-between px-5 py-4 text-background">
              <div>
                <p className="font-heading text-lg font-medium">{item.title}</p>
                {item.description ? (
                  <p className="text-sm text-background/70">{item.description}</p>
                ) : null}
              </div>
              {item.category ? (
                <span className="font-mono text-xs uppercase tracking-wider text-background/50">
                  {item.category}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
