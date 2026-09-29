"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, Link2, Lock, Globe, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { deleteGallery } from "@/app/admin/(dashboard)/galerias/actions";
import {
  GALLERY_STATUS_LABELS,
  GALLERY_TYPE_LABELS,
  type Gallery,
} from "@/lib/data/galleries";

export function GalleriesList({ galleries }: { galleries: Gallery[] }) {
  if (galleries.length === 0) {
    return (
      <p className="mt-10 text-sm text-muted-foreground">
        Todavía no has creado galerías. Usa &quot;Nueva galería&quot; para empezar.
      </p>
    );
  }

  return (
    <div className="mt-8 divide-y divide-border rounded-xl border border-border">
      {galleries.map((g) => (
        <GalleryRow key={g.id} gallery={g} />
      ))}
    </div>
  );
}

function GalleryRow({ gallery }: { gallery: Gallery }) {
  const [pending, startTransition] = useTransition();

  function copyLink() {
    const url = `${window.location.origin}/g/${gallery.token}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Link copiado"),
      () => toast.error("No se pudo copiar el link"),
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <Link
        href={`/admin/galerias/${gallery.id}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        {gallery.visibility === "private" ? (
          <Lock className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <Globe className="size-4 shrink-0 text-muted-foreground" />
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{gallery.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {gallery.client_name || "Sin cliente"}
          </p>
        </div>
      </Link>

      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="secondary">
          {GALLERY_TYPE_LABELS[gallery.type] ?? gallery.type}
        </Badge>
        <Badge variant="outline" className="hidden sm:inline-flex">
          {GALLERY_STATUS_LABELS[gallery.status] ?? gallery.status}
        </Badge>

        <Button variant="ghost" size="icon" onClick={copyLink} title="Copiar link">
          <Link2 className="size-4" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" title="Eliminar">
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar &quot;{gallery.title}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                Se borra la galería y las selecciones del cliente. Las fotos en tu
                Google Drive no se tocan. No se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                disabled={pending}
                onClick={() => {
                  startTransition(() => deleteGallery(gallery.id));
                  toast.success("Galería eliminada");
                }}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Link href={`/admin/galerias/${gallery.id}`}>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
