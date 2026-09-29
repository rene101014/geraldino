"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, CheckCircle2 } from "lucide-react";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [clientName, setClientName] = useState("");
  const [note, setNote] = useState("");

  const count = selected.size;
  const atLimit = limit != null && count >= limit;

  function toggle(fileId: string) {
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
  }

  async function submit() {
    setSending(true);
    try {
      const res = await fetch(`/api/g/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileIds: [...selected],
          clientName,
          note,
        }),
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

  return (
    <main className="mx-auto max-w-6xl px-4 pb-28 pt-8">
      <header className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toca las fotos que quieres elegir.
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

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((p) => {
          const isSel = selected.has(p.drive_file_id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.drive_file_id)}
              disabled={!isSel && atLimit}
              className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                isSel ? "border-primary" : "border-transparent"
              } ${!isSel && atLimit ? "opacity-50" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/g/${token}/photo/${p.drive_file_id}?size=600`}
                alt={p.filename}
                loading="lazy"
                className="size-full object-cover"
              />
              <span
                className={`absolute right-2 top-2 flex size-6 items-center justify-center rounded-full transition-all ${
                  isSel
                    ? "bg-primary text-primary-foreground"
                    : "bg-black/40 text-white opacity-0 group-hover:opacity-100"
                }`}
              >
                <Check className="size-4" />
              </span>
            </button>
          );
        })}
      </div>

      {/* Barra fija inferior */}
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <p className="text-sm">
            <span className="font-semibold">{count}</span>
            {limit != null ? ` / ${limit}` : ""} seleccionada(s)
          </p>
          <Button disabled={count === 0} onClick={() => setDialogOpen(true)}>
            Enviar selección
          </Button>
        </div>
      </div>

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
