"use client";

import { useActionState } from "react";
import {
  createCampaign,
  type CampaignState,
} from "@/app/admin/(dashboard)/campanas/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface ListOption {
  id: string;
  name: string;
}

const initial: CampaignState = { error: null };

export function CampaignForm({
  lists,
  defaultFromName,
  defaultFromEmail,
}: {
  lists: ListOption[];
  defaultFromName: string;
  defaultFromEmail: string;
}) {
  const [state, action, pending] = useActionState(createCampaign, initial);

  return (
    <form action={action} className="mt-6 max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre interno</Label>
        <Input id="name" name="name" placeholder="Newsletter octubre" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subject">Asunto</Label>
        <Input id="subject" name="subject" placeholder="Lo nuevo de este mes 🎉" required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="from_name">Nombre del remitente</Label>
          <Input id="from_name" name="from_name" defaultValue={defaultFromName} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="from_email">Email del remitente</Label>
          <Input
            id="from_email"
            name="from_email"
            type="email"
            defaultValue={defaultFromEmail}
            placeholder="hola@tudominio.com"
            required
          />
          <p className="text-xs text-muted-foreground">
            Debe estar verificado en Amazon SES.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reply_to">Responder a (opcional)</Label>
        <Input id="reply_to" name="reply_to" type="email" placeholder="respuestas@tudominio.com" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="list_id">Lista destino</Label>
        <select
          id="list_id"
          name="list_id"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          defaultValue=""
        >
          <option value="">Todos los suscriptores activos</option>
          {lists.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="html">Cuerpo del correo (HTML)</Label>
        <Textarea
          id="html"
          name="html"
          rows={14}
          className="font-mono text-xs"
          placeholder={'<h1>Hola {{name}}</h1>\n<p>Tu contenido…</p>\n<p><a href="{{unsubscribe_url}}">Darse de baja</a></p>'}
          required
        />
        <p className="text-xs text-muted-foreground">
          Variables disponibles: <code>{"{{name}}"}</code>, <code>{"{{email}}"}</code> y{" "}
          <code>{"{{unsubscribe_url}}"}</code> (obligatoria por ley; si no la pones, se
          agrega igual en la cabecera del correo).
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Creando…" : "Crear borrador"}
        </Button>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>
    </form>
  );
}
