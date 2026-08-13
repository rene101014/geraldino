"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { createPortfolioItem } from "@/app/admin/(dashboard)/portafolio/actions";

function extensionOf(file: File) {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts.pop() : "bin";
}

async function uploadToPortfolioBucket(file: File) {
  const supabase = createClient();
  const path = `${crypto.randomUUID()}.${extensionOf(file)}`;
  const { error } = await supabase.storage.from("portfolio").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export function MediaUploader({ categories }: { categories: string[] }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const mediaType = file?.type.startsWith("video/") ? "video" : "image";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      toast.error("Selecciona una foto o video.");
      return;
    }
    if (mediaType === "video" && !posterFile) {
      toast.error("Los videos necesitan una imagen de portada.");
      return;
    }

    setUploading(true);
    try {
      const storagePath = await uploadToPortfolioBucket(file);
      const thumbnailPath = posterFile
        ? await uploadToPortfolioBucket(posterFile)
        : "";

      const formData = new FormData(formRef.current!);
      formData.set("media_type", mediaType);
      formData.set("storage_path", storagePath);
      formData.set("thumbnail_path", thumbnailPath);

      const result = await createPortfolioItem({ error: null, success: false }, formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Pieza publicada");
        setOpen(false);
        setFile(null);
        setPosterFile(null);
        formRef.current?.reset();
      }
    } catch {
      toast.error("No se pudo subir el archivo. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-1 size-4" />
          Subir pieza
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subir al portafolio</DialogTitle>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Foto o video</Label>
            <Input
              id="file"
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {mediaType === "video" && file ? (
            <div className="space-y-2">
              <Label htmlFor="poster">Imagen de portada del video</Label>
              <Input
                id="poster"
                type="file"
                accept="image/*"
                onChange={(e) => setPosterFile(e.target.files?.[0] ?? null)}
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea id="description" name="description" rows={2} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select name="category" required>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Elige una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={uploading}>
              {uploading ? "Subiendo…" : "Publicar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
