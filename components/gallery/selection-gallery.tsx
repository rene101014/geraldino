"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Check, CheckCircle2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { GalleryPhoto } from "@/lib/data/galleries";

export function SelectionGallery({
  token,
  title,
  photos,
  limit,
  alreadySubmitted,
}: {
  token: string;
  title: string;
  photos: GalleryPhoto[];
  limit: number | null;
  alreadySubmitted: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [clientName, setClientName] = useState("");
  const [note, setNote] = useState("");

  const count = selected.size;
  const atLimit = limit != null && count >= limit;

  const toggle = useCallback(
    (fileId: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(fileId)) {
          next.delete(fileId);
        } else {
          if (limit != null && next.size >= limit) {
            toast.error(`El cupo es de ${limit} fotos.`);
            return prev;
          }
          next.add(fileId);
        }
        return next;
      });
    },
    [limit],
  );

  // Navegación del visor con teclado.
  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prev = useCallback(
    () => setLightbox((i) => (i == null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length],
  );
  const next = useCallback(
    () => setLightbox((i) => (i == null ? i : (i + 1) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (lightbox == null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === " ") {
        e.preventDefault();
        if (lightbox != null) toggle(photos[lightbox].drive_file_id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, closeLightbox, prev, next, toggle, photos]);

  async function submit() {
    setSending(true);
    try {
      const res = await fetch(`/api/g/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds: [...selected], clientName, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "No se pudo enviar.");
        return;
      }
      setDialogOpen(false);
      setDone(true);
    } catch {
      toast.error("No se pudo enviar. Revisa tu conexión.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <CheckCircle2 className="size-12 text-green-500" />
        <h1 className="font-heading text-2xl font-semibold">¡Selección enviada!</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Recibimos tus {count} foto(s) elegidas. Nos pondremos en contacto para
          los siguientes pasos. ¡Gracias!
        </p>
      </main>
    );
  }

  const current = lightbox != null ? photos[lightbox] : null;
  const currentSelected = current ? selected.has(current.drive_file_id) : false;

  return (
    <main className="mx-auto max-w-7xl px-3 pb-28 pt-8 sm:px-6">
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toca una foto para verla en grande y elegirla.
          {limit != null
            ? ` Puedes elegir hasta ${limit}.`
            : " Elige todas las que quieras."}
        </p>
        {alreadySubmitted && (
          <p className="mt-2 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            Ya recibimos una selección tuya. Si envías otra, se sumará como una
            nueva.
          </p>
        )}
      </header>

      {/* Grid grande: pocas columnas y miniaturas nítidas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((p, index) => {
          const isSel = selected.has(p.drive_file_id);
          return (
            <div
              key={p.id}
              className={`group relative overflow-hidden rounded-lg border-2 transition-all ${
                isSel ? "border-primary" : "border-transparent"
              }`}
            >
              <button
                type="button"
                onClick={() => setLightbox(index)}
                className="block aspect-[4/5] w-full cursor-zoom-in"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/g/${token}/photo/${p.drive_file_id}?size=1200`}
                  alt={p.filename}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </button>

              {/* Check rápido (no abre el visor) */}
              <button
                type="button"
                onClick={() => toggle(p.drive_file_id)}
                disabled={!isSel && atLimit}
                title={isSel ? "Quitar" : "Elegir"}
                className={`absolute right-2 top-2 flex size-9 items-center justify-center rounded-full transition-all ${
                  isSel
                    ? "bg-primary text-primary-foreground"
                    : "bg-black/45 text-white hover:bg-black/70"
                } ${!isSel && atLimit ? "cursor-not-allowed opacity-40" : ""}`}
              >
                <Check className="size-5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Barra fija inferior */}
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <p className="text-sm">
            <span className="font-semibold">{count}</span>
            {limit != null ? ` / ${limit}` : ""} seleccionada(s)
          </p>
          <Button disabled={count === 0} onClick={() => setDialogOpen(true)}>
            Enviar selección
          </Button>
        </div>
      </div>

      {/* Visor a pantalla completa */}
      {current && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
          <div className="flex items-center justify-between px-4 py-3 text-white/90">
            <span className="text-sm">
              {(lightbox ?? 0) + 1} de {photos.length}
            </span>
            <button onClick={closeLightbox} className="hover:text-white" title="Cerrar">
              <X className="size-7" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2">
            <button
              onClick={prev}
              className="absolute left-2 z-10 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              title="Anterior"
            >
              <ChevronLeft className="size-6" />
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/g/${token}/photo/${current.drive_file_id}?size=2000`}
              alt={current.filename}
              className="max-h-full max-w-full object-contain"
            />

            <button
              onClick={next}
              className="absolute right-2 z-10 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              title="Siguiente"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>

          <div className="flex justify-center px-4 py-5">
            <Button
              size="lg"
              variant={currentSelected ? "secondary" : "default"}
              disabled={!currentSelected && atLimit}
              onClick={() => toggle(current.drive_file_id)}
              className="min-w-56"
            >
              {currentSelected ? (
                <>
                  <Check className="mr-1 size-5" />
                  Elegida — quitar
                </>
              ) : (
                "Elegir esta foto"
              )}
            </Button>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar tu selección</DialogTitle>
            <DialogDescription>
              Elegiste {count} foto(s). Déjanos tu nombre y cualquier comentario.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Tu nombre (opcional)</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Comentario (opcional)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej: prioriza las de exteriores…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={submit} disabled={sending}>
              {sending ? "Enviando…" : "Confirmar y enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
