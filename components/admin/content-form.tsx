"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { mediaUrl } from "@/lib/storage/public-url";
import {
  updateContent,
  type ContentFormState,
} from "@/app/admin/(dashboard)/contenido/actions";
import type { SiteContent } from "@/lib/data/content";

const initialState: ContentFormState = { error: null, success: false };

function extensionOf(file: File) {
  const parts = file.name.split(".");
  return parts.length > 1 ? parts.pop() : "bin";
}

function Field({
  name,
  label,
  defaultValue,
  type = "text",
}: {
  name: string;
  label: string;
  defaultValue: string | null;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue ?? ""} />
    </div>
  );
}

export function ContentForm({ content }: { content: SiteContent }) {
  const [state, formAction, actionPending] = useActionState(updateContent, initialState);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const pending = actionPending || uploading;

  useEffect(() => {
    if (state.success) toast.success("Contenido actualizado");
    if (state.error) toast.error(state.error);
  }, [state]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!logoFile) return;
    e.preventDefault();

    setUploading(true);
    try {
      const supabase = createSupabaseClient();
      const path = `logo-${crypto.randomUUID()}.${extensionOf(logoFile)}`;
      const { error } = await supabase.storage.from("site").upload(path, logoFile, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;

      const formData = new FormData(formRef.current!);
      formData.set("logo_path", path);
      setLogoFile(null);
      formAction(formData);
    } catch {
      toast.error("No se pudo subir el logo. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="max-w-2xl space-y-10">
      <section className="space-y-4">
        <h2 className="font-heading text-lg font-medium">Marca</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field name="brand_name" label="Nombre de marca" defaultValue={content.brand_name} />
          <Field name="founder_name" label="Fundador" defaultValue={content.founder_name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="logo">Logo</Label>
          {content.logo_path ? (
            <div className="flex h-16 w-40 items-center rounded-md border border-border/60 bg-background/60 p-2">
              <Image
                src={mediaUrl("site", content.logo_path)}
                alt="Logo actual"
                width={140}
                height={48}
                className="h-full w-auto object-contain"
              />
            </div>
          ) : null}
          <Input
            id="logo"
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
          />
          <input type="hidden" name="logo_path" defaultValue={content.logo_path ?? ""} />
          <p className="text-xs text-muted-foreground">
            Sin logo se muestra el nombre de marca como texto.
          </p>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-medium">Hero (Inicio)</h2>
        <Field name="hero_title" label="Título" defaultValue={content.hero_title} />
        <div className="space-y-2">
          <Label htmlFor="hero_subtitle">Subtítulo</Label>
          <Textarea
            id="hero_subtitle"
            name="hero_subtitle"
            rows={3}
            defaultValue={content.hero_subtitle}
          />
        </div>
        <Field name="hero_cta_label" label="Texto del botón principal" defaultValue={content.hero_cta_label} />
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-medium">Biografía</h2>
        <Field name="bio_heading" label="Título de la sección" defaultValue={content.bio_heading} />
        <div className="space-y-2">
          <Label htmlFor="bio_body">Texto (separa párrafos con una línea en blanco)</Label>
          <Textarea
            id="bio_body"
            name="bio_body"
            rows={10}
            defaultValue={content.bio_body}
          />
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-medium">Contacto</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field name="contact_email" label="Email" defaultValue={content.contact_email} type="email" />
          <Field name="contact_phone" label="Teléfono" defaultValue={content.contact_phone} />
          <Field name="contact_whatsapp" label="WhatsApp" defaultValue={content.contact_whatsapp} />
          <Field name="address" label="Dirección" defaultValue={content.address} />
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-medium">SEO</h2>
        <Field name="meta_title" label="Título para buscadores" defaultValue={content.meta_title} />
        <div className="space-y-2">
          <Label htmlFor="meta_description">Descripción para buscadores</Label>
          <Textarea
            id="meta_description"
            name="meta_description"
            rows={3}
            defaultValue={content.meta_description}
          />
        </div>
      </section>

      <Button type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
