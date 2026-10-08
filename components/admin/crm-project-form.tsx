"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
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
import { createProject, updateProject } from "@/app/admin/(dashboard)/crm/actions";
import { PROJECT_STATUS_LABELS, type CrmProject } from "@/lib/data/crm";

type ServiceOption = { id: string; title: string };

export function CrmProjectForm({
  accountId,
  services,
  project,
}: {
  accountId: string;
  services: ServiceOption[];
  project?: CrmProject;
}) {
  const isEdit = !!project;
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState<string>(project?.status ?? "propuesta");
  const [service, setService] = useState<string>(project?.service_id ?? "");
  const [currency, setCurrency] = useState<string>(project?.currency ?? "DOP");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData(formRef.current!);
      formData.set("account_id", accountId);
      formData.set("status", status);
      formData.set("service_id", service);
      formData.set("currency", currency);

      const result = isEdit
        ? await updateProject(project!.id, { error: null, success: false }, formData)
        : await createProject({ error: null, success: false }, formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(isEdit ? "Trabajo actualizado" : "Trabajo creado");
      setOpen(false);
      router.refresh();
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
          <Button size="sm">
            <Plus className="mr-1 size-4" />
            Nuevo trabajo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar trabajo" : "Nuevo trabajo"}</DialogTitle>
          <DialogDescription>
            Un trabajo agrupa el estado y las galerías de entrega de un proyecto.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" defaultValue={project?.title} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={project?.description ?? ""}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Servicio</Label>
              <Select
                value={service || "none"}
                onValueChange={(v) => setService(v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin especificar</SelectItem>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Inicio</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                defaultValue={project?.start_date ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Entrega</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                defaultValue={project?.due_date ?? ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="budget_amount">Presupuesto</Label>
              <Input
                id="budget_amount"
                name="budget_amount"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                defaultValue={project?.budget_amount ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label>Moneda</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOP">DOP (RD$)</SelectItem>
                  <SelectItem value="USD">USD (US$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={2}
              defaultValue={project?.notes ?? ""}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear trabajo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
