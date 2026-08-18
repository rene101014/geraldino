"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import Image from "next/image";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { createPortfolioItem } from "@/app/admin/(dashboard)/portafolio/actions";
import { extractVimeoId, fetchVimeoOEmbed } from "@/lib/video/vimeo";

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
  const [source, setSource] = useState<"file" | "vimeo">("file");
  const [file, setFile] = useState<File | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [title, setTitle] = useState("");
  const [vimeoInput, setVimeoInput] = useState("");
  const [vimeoId, setVimeoId] = useState<string | null>(null);
  const [vimeoThumb, setVimeoThumb] = useState<string | null>(null);
  const [lookingUpVimeo, setLookingUpVimeo] = useState(false);

  const mediaType = source === "vimeo" ? "video" : file?.type.startsWith("video/") ? "video" : "image";

  async function handleVimeoBlur() {
    const id = extractVimeoId(vimeoInput);
    setVimeoId(id);
    if (!id) {
      setVimeoThumb(null);
      return;
    }
    setLookingUpVimeo(true);
    try {
      const meta = await fetchVimeoOEmbed(id);
      if (meta) {
        setVimeoThumb(meta.thumbnail_url);
        if (!title) setTitle(meta.title);
      } else {
        toast.error("No se encontró ese video en Vimeo.");
      }
    } finally {
      setLookingUpVimeo(false);
    }
  }

  function resetForm() {
    setFile(null);
    setPosterFile(null);
    setTitle("");
    setVimeoInput("");
    setVimeoId(null);
    setVimeoThumb(null);
    setSource("file");
    formRef.current?.reset();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(formRef.current!);

    if (source === "vimeo") {
      if (!vimeoId) {
        toast.error("Pega un link o ID de Vimeo válido.");
        return;
      }
      formData.set("media_type", "video");
      formData.set("provider", "vimeo");
      formData.set("external_id", vimeoId);
      formData.set("thumbnail_path", vimeoThumb ?? "");
      formData.set("storage_path", "");

      setUploading(true);
      try {
        const result = await createPortfolioItem({ error: null, success: false }, formData);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Pieza publicada");
          setOpen(false);
          resetForm();
        }
      } finally {
        setUploading(false);
      }
      return;
    }

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

      formData.set("media_type", mediaType);
      formData.set("provider", "supabase");
      formData.set("storage_path", storagePath);
      formData.set("thumbnail_path", thumbnailPath);

      const result = await createPortfolioItem({ error: null, success: false }, formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Pieza publicada");
        setOpen(false);
        resetForm();
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
          <Tabs value={source} onValueChange={(v) => setSource(v as "file" | "vimeo")}>
            <TabsList className="w-full">
              <TabsTrigger value="file" className="flex-1">
                Archivo
              </TabsTrigger>
              <TabsTrigger value="vimeo" className="flex-1">
                Video de Vimeo
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {source === "vimeo" ? (
            <div className="space-y-2">
              <Label htmlFor="vimeo-url">Link o ID del video en Vimeo</Label>
              <Input
                id="vimeo-url"
                placeholder="https://vimeo.com/123456789"
                value={vimeoInput}
                onChange={(e) => setVimeoInput(e.target.value)}
                onBlur={handleVimeoBlur}
              />
              {lookingUpVimeo ? (
                <p className="text-xs text-muted-foreground">Buscando el video…</p>
              ) : vimeoThumb ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                  <Image src={vimeoThumb} alt="" fill className="object-cover" />
                </div>
              ) : null}
            </div>
          ) : (
            <>
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
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
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
