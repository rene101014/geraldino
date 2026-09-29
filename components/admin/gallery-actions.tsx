"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RefreshCw, Link2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  syncGalleryPhotos,
  setGalleryStatus,
} from "@/app/admin/(dashboard)/galerias/actions";
import { GALLERY_STATUS_LABELS, type Gallery } from "@/lib/data/galleries";

export function GalleryActions({ gallery }: { gallery: Gallery }) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [pending, startTransition] = useTransition();

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await syncGalleryPhotos(gallery.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`${res.count} foto(s) sincronizada(s) desde Drive`);
        router.refresh();
      }
    } finally {
      setSyncing(false);
    }
  }

  function copyLink() {
    const url = `${window.location.origin}/g/${gallery.token}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Link copiado"),
      () => toast.error("No se pudo copiar"),
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        defaultValue={gallery.status}
        onValueChange={(value) => {
          startTransition(() => setGalleryStatus(gallery.id, value));
          toast.success("Estado actualizado");
        }}
      >
        <SelectTrigger className="w-[180px]" disabled={pending}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(GALLERY_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
        <RefreshCw className={`mr-1 size-4 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "Sincronizando…" : "Sincronizar fotos"}
      </Button>

      <Button variant="outline" size="sm" onClick={copyLink}>
        <Link2 className="mr-1 size-4" />
        Copiar link
      </Button>

      <Button asChild variant="outline" size="sm">
        <a href={`/g/${gallery.token}`} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-1 size-4" />
          Ver galería
        </a>
      </Button>
    </div>
  );
}
