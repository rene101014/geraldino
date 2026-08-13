"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { createClientRecord } from "@/app/admin/(dashboard)/clientes/actions";

function extensionOf(file: File) {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts.pop() : "bin";
}

export function ClientForm() {
  const [open, setOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      let logoPath = "";
      if (logoFile) {
        const supabase = createSupabaseClient();
        const path = `${crypto.randomUUID()}.${extensionOf(logoFile)}`;
        const { error } = await supabase.storage.from("clients").upload(path, logoFile, {
          cacheControl: "3600",
          upsert: false,
        });
        if (error) throw error;
        logoPath = path;
      }

      const formData = new FormData(formRef.current!);
      formData.set("logo_path", logoPath);

      const result = await createClientRecord({ error: null, success: false }, formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Cliente agregado");
        setOpen(false);
        setLogoFile(null);
        formRef.current?.reset();
      }
    } catch {
      toast.error("No se pudo subir el logo. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 size-4" />
          Agregar cliente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar cliente</DialogTitle>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website_url">Sitio web (opcional)</Label>
            <Input id="website_url" name="website_url" type="url" placeholder="https://" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo (opcional)</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">
              Sin logo se muestra un monograma con el nombre.
            </p>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
