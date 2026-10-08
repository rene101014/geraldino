"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, UserPlus } from "lucide-react";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { createAccount, updateAccount } from "@/app/admin/(dashboard)/crm/actions";
import type { CrmAccount } from "@/lib/data/crm";

type AgencyOption = { id: string; name: string };

export function CrmAccountForm({
  account,
  defaultType = "particular",
  parentId,
  parentName,
  agencies = [],
  trigger = "new",
}: {
  account?: CrmAccount;
  defaultType?: "agencia" | "particular";
  // Cuando se añade un sub-cliente desde la ficha de una agencia.
  parentId?: string;
  parentName?: string;
  agencies?: AgencyOption[];
  // 'new' = botón primario; 'subcliente' = botón de alta rápida; 'edit' = lápiz.
  trigger?: "new" | "subcliente" | "edit";
}) {
  const isEdit = !!account;
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Si hay parentId fijo (alta de sub-cliente), el tipo es siempre particular.
  const lockType = !!parentId;
  const [type, setType] = useState<string>(account?.type ?? defaultType);
  const [status, setStatus] = useState<string>(account?.status ?? "activo");
  const [parent, setParent] = useState<string>(
    parentId ?? account?.parent_id ?? "",
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData(formRef.current!);
      formData.set("type", lockType ? "particular" : type);
      formData.set("status", status);
      formData.set("parent_id", lockType ? parentId! : parent);

      const result = isEdit
        ? await updateAccount(account!.id, { error: null, success: false }, formData)
        : await createAccount({ error: null, success: false }, formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(isEdit ? "Cliente actualizado" : "Cliente creado");
      setOpen(false);
      if (isEdit) {
        router.refresh();
      } else if (result.id) {
        router.push(`/admin/crm/${result.id}`);
      }
    } finally {
      setSaving(false);
    }
  }

  const title = isEdit
    ? "Editar cliente"
    : parentId
      ? `Agregar sub-cliente a ${parentName ?? "la agencia"}`
      : type === "agencia"
        ? "Nueva agencia"
        : "Nuevo cliente";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger === "edit" ? (
          <Button variant="outline" size="sm">
            <Pencil className="mr-1 size-4" />
            Editar
          </Button>
        ) : trigger === "subcliente" ? (
          <Button variant="outline" size="sm">
            <UserPlus className="mr-1 size-4" />
            Agregar sub-cliente
          </Button>
        ) : (
          <Button variant={defaultType === "agencia" ? "outline" : "default"}>
            <Plus className="mr-1 size-4" />
            {defaultType === "agencia" ? "Nueva agencia" : "Nuevo cliente"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {parentId
              ? "Este cliente quedará bajo la agencia seleccionada."
              : "Agencias agrupan sub-clientes; los particulares son clientes directos."}
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          {!lockType && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particular">Cliente particular</SelectItem>
                    <SelectItem value="agencia">Agencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Un particular puede colgar de una agencia (sub-cliente). */}
              {type === "particular" && agencies.length > 0 && (
                <div className="space-y-2">
                  <Label>Agencia (opcional)</Label>
                  <Select
                    value={parent || "none"}
                    onValueChange={(v) => setParent(v === "none" ? "" : v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Cliente directo</SelectItem>
                      {agencies.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre {type === "agencia" ? "de la agencia" : "del cliente"}</Label>
            <Input id="name" name="name" defaultValue={account?.name} required />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact_name">Persona de contacto</Label>
              <Input
                id="contact_name"
                name="contact_name"
                defaultValue={account?.contact_name ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={account?.email ?? ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" name="phone" defaultValue={account?.phone ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                defaultValue={account?.whatsapp ?? ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rnc">RNC / Identificación fiscal</Label>
              <Input id="rnc" name="rnc" defaultValue={account?.rnc ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website_url">Sitio web</Label>
              <Input
                id="website_url"
                name="website_url"
                placeholder="https://…"
                defaultValue={account?.website_url ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" name="address" defaultValue={account?.address ?? ""} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="prospecto">Prospecto</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={account?.notes ?? ""}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
