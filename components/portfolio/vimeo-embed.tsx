import { cn } from "@/lib/utils";

export function VimeoEmbed({
  id,
  title,
  background = false,
  className,
}: {
  id: string;
  title: string;
  background?: boolean;
  className?: string;
}) {
  const params = new URLSearchParams({
    title: "0",
    byline: "0",
    portrait: "0",
    dnt: "1",
  });
  if (background) {
    params.set("background", "1");
    params.set("autoplay", "1");
    params.set("loop", "1");
    params.set("muted", "1");
  }

  return (
    <iframe
      src={`https://player.vimeo.com/video/${id}?${params.toString()}`}
      title={title}
      allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      // En modo background el iframe es puramente decorativo (sin
      // controles propios): pointer-events-none deja que el click llegue
      // al <button> del tile y abra el lightbox, igual que con el <video>
      // que reemplaza.
      className={cn("size-full border-0", background && "pointer-events-none", className)}
    />
  );
}
