"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Trash2, Video as VideoIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { mediaUrl } from "@/lib/storage/public-url";
import {
  togglePortfolioPublished,
  togglePortfolioFeatured,
  togglePortfolioCaption,
  deletePortfolioItem,
} from "@/app/admin/(dashboard)/portafolio/actions";
import type { PortfolioItem } from "@/lib/data/portfolio";

export function PortfolioList({ items }: { items: PortfolioItem[] }) {
  if (items.length === 0) {
    return (
      <p className="mt-10 text-sm text-muted-foreground">
        Todavía no has subido ninguna pieza. Usa &quot;Subir pieza&quot; para
        empezar.
      </p>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <PortfolioListItem key={item.id} item={item} />
      ))}
    </div>
  );
}

function PortfolioListItem({ item }: { item: PortfolioItem }) {
  const [published, setPublished] = useState(item.published);
  const [featured, setFeatured] = useState(item.is_featured);
  const [showCaption, setShowCaption] = useState(item.show_caption);
  const [pending, startTransition] = useTransition();
  const thumbPath = item.thumbnail_path ?? item.storage_path;
  const thumbUrl = thumbPath ? mediaUrl("portfolio", thumbPath) : null;

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="relative aspect-video bg-muted">
        {thumbUrl ? (
          <Image
            src={thumbUrl}
            alt={item.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : null}
        {item.media_type === "video" ? (
          <span className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white">
            <VideoIcon className="size-3.5" />
          </span>
        ) : null}
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.title}</p>
            <p className="truncate text-xs text-muted-foreground">{item.category}</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar &quot;{item.title}&quot;?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se borra del portafolio y del almacenamiento. No se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    startTransition(() => deletePortfolioItem(item.id));
                    toast.success("Pieza eliminada");
                  }}
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <label className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            Publicado
            <Switch
              checked={published}
              disabled={pending}
              onCheckedChange={(value) => {
                setPublished(value);
                startTransition(() => togglePortfolioPublished(item.id, value));
              }}
            />
          </label>
          <label className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            Destacado en inicio
            <Switch
              checked={featured}
              disabled={pending}
              onCheckedChange={(value) => {
                setFeatured(value);
                startTransition(() => togglePortfolioFeatured(item.id, value));
              }}
            />
          </label>
          <label className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            Mostrar nombre y categoría
            <Switch
              checked={showCaption}
              disabled={pending}
              onCheckedChange={(value) => {
                setShowCaption(value);
                startTransition(() => togglePortfolioCaption(item.id, value));
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
