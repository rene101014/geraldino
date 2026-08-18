"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  updateService,
  toggleServicePublished,
  createService,
  type ServiceFormState,
} from "@/app/admin/(dashboard)/servicios/actions";
import type { Service } from "@/lib/data/services";

const initialState: ServiceFormState = { error: null, success: false };

export function ServicesTable({ services }: { services: Service[] }) {
  const [editing, setEditing] = useState<Service | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-1 size-4" />
          Nuevo servicio
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">Orden</TableHead>
            <TableHead>Servicio</TableHead>
            <TableHead className="w-24">Tipo</TableHead>
            <TableHead className="w-20">Activo</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service) => (
            <ServiceRow key={service.id} service={service} onEdit={setEditing} />
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        {editing ? (
          <EditServiceDialog service={editing} onDone={() => setEditing(null)} />
        ) : null}
      </Dialog>

      <Dialog open={creating} onOpenChange={setCreating}>
        <CreateServiceDialog onDone={() => setCreating(false)} />
      </Dialog>
    </>
  );
}

function ServiceRow({
  service,
  onEdit,
}: {
  service: Service;
  onEdit: (s: Service) => void;
}) {
  const [published, setPublished] = useState(service.published);
  const [, startTransition] = useTransition();

  return (
    <TableRow>
      <TableCell className="font-mono text-xs text-muted-foreground">
        {String(service.order_index).padStart(2, "0")}
      </TableCell>
      <TableCell>
        <p className="font-medium">{service.title}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {service.description}
        </p>
      </TableCell>
      <TableCell>
        {service.is_addon ? <Badge variant="outline">Addon</Badge> : null}
      </TableCell>
      <TableCell>
        <Switch
          checked={published}
          onCheckedChange={(value) => {
            setPublished(value);
            startTransition(() => {
              toggleServicePublished(service.id, value);
            });
          }}
        />
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="icon" onClick={() => onEdit(service)}>
          <Pencil className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function EditServiceDialog({
  service,
  onDone,
}: {
  service: Service;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(updateService, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Servicio actualizado");
      onDone();
    }
    if (state.error) toast.error(state.error);
  }, [state, onDone]);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{service.title}</DialogTitle>
      </DialogHeader>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={service.id} />
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input id="title" name="title" defaultValue={service.title} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={service.description}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="order_index">Orden</Label>
          <Input
            id="order_index"
            name="order_index"
            type="number"
            defaultValue={service.order_index}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch id="published" name="published" defaultChecked={service.published} />
          <Label htmlFor="published">Visible en el sitio</Label>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function CreateServiceDialog({ onDone }: { onDone: () => void }) {
  const [state, formAction, pending] = useActionState(createService, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Servicio creado");
      onDone();
    }
    if (state.error) toast.error(state.error);
  }, [state, onDone]);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Nuevo servicio</DialogTitle>
      </DialogHeader>
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="new-title">Título</Label>
          <Input id="new-title" name="title" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-description">Descripción</Label>
          <Textarea id="new-description" name="description" rows={3} required />
        </div>
        <div className="flex items-center gap-2">
          <Switch id="new-is-addon" name="is_addon" />
          <Label htmlFor="new-is-addon">Es un addon (se suma a otro servicio)</Label>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={pending}>
            {pending ? "Creando…" : "Crear servicio"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
