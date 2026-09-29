"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { createGallery, updateGallery } from "@/app/admin/(dashboard)/galerias/actions";
import type { Gallery } from "@/lib/data/galleries";

export function GalleryForm({ gallery }: { gallery?: Gallery }) {
  const isEdit = !!gallery;
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [type, setType] = useState<string>(gallery?.type ?? "selection");
  const [deliveryFormat, setDeliveryFormat] = useState<string>(
    gallery?.delivery_format ?? "download",
  );
  const [visibility, setVisibility] = useState<string>(
    gallery?.visibility ?? "private",
  );
  const [allowDownloads, setAllowDownloads] = useState<boolean>(
    gallery?.allow_downloads ?? false,
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData(formRef.current!);
      formData.set("type", type);
      formData.set("delivery_format", deliveryFormat);
      formData.set("visibility", visibility);
      formData.set("allow_downloads", allowDownloads ? "on" : "off");

      const result = isEdit
        ? await updateGallery(gallery!.id, { error: null, success: false }, formData)
        : await createGallery({ error: null, success: false }, formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(isEdit ? "Galería actualizada" : "Galería creada");
      setOpen(false);
      if (isEdit) {
        router.refresh();
      } else if (result.id) {
        router.push(`/admin/galerias/${result.id}`);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline" size="sm">
            <Pencil className="mr-1 size-4" />
            Editar
          </Button>
        ) : (
          <Button>
            <Plus className="mr-1 size-4" />
            Nueva galería
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar galería" : "Nueva galería"}</DialogTitle>
          <DialogDescription>
            Las fotos se leen desde una carpeta de tu Google Drive.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" defaultValue={gallery?.title} required />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client_name">Cliente (opcional)</Label>
              <Input
                id="client_name"
                name="client_name"
                defaultValue={gallery?.client_name ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_email">Email del cliente (opcional)</Label>
              <Input
                id="client_email"
                name="client_email"
                type="email"
                defaultValue={gallery?.client_email ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="drive_folder">Carpeta de Google Drive</Label>
            <Input
              id="drive_folder"
              name="drive_folder"
              placeholder="Pega el enlace de la carpeta o su ID"
              defaultValue={gallery?.drive_folder_id ?? ""}
              required
            />
            <p className="text-xs text-muted-foreground">
              Ej: https://drive.google.com/drive/folders/ABC123…
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="selection">Selección (el cliente elige)</SelectItem>
                  <SelectItem value="delivery">Entrega (trabajo final)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === "delivery" && (
              <div className="space-y-2">
                <Label>Formato de entrega</Label>
                <Select value={deliveryFormat} onValueChange={setDeliveryFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="download">Galería con descarga</SelectItem>
                    <SelectItem value="album">Álbum diseñado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {type === "selection" && (
              <div className="space-y-2">
                <Label htmlFor="selection_limit">Cupo de fotos (opcional)</Label>
                <Input
                  id="selection_limit"
                  name="selection_limit"
                  type="number"
                  min={1}
                  placeholder="Ej: 30"
                  defaultValue={gallery?.selection_limit ?? ""}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Visibilidad</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Privada (link + contraseña)</SelectItem>
                  <SelectItem value="public">Pública (solo el link)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {visibility === "private" && (
              <div className="space-y-2">
                <Label htmlFor="password">
                  Contraseña {isEdit && "(vacío = no cambiar)"}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="text"
                  placeholder={isEdit ? "••••••" : "Para el cliente"}
                />
              </div>
            )}
          </div>

          {type === "delivery" && (
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <div>
                <Label htmlFor="allow_downloads">Permitir descargas</Label>
                <p className="text-xs text-muted-foreground">
                  El cliente podrá descargar las fotos.
                </p>
              </div>
              <Switch
                id="allow_downloads"
                checked={allowDownloads}
                onCheckedChange={setAllowDownloads}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear galería"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
