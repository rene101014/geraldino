"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, Camera, Link2Off, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CrmProjectForm } from "@/components/admin/crm-project-form";
import { GalleryForm } from "@/components/admin/gallery-form";
import {
  setProjectStatus,
  deleteProject,
  linkGalleryToProject,
} from "@/app/admin/(dashboard)/crm/actions";
import {
  PROJECT_STATUS_LABELS,
  formatMoney,
  type CrmProject,
} from "@/lib/data/crm";
import type { Gallery } from "@/lib/data/galleries";

type ServiceOption = { id: string; title: string };

export function CrmProjectsList({
  accountId,
  projects,
  services,
  galleries,
  unlinkedGalleries,
}: {
  accountId: string;
  projects: CrmProject[];
  services: ServiceOption[];
  galleries: Gallery[];
  unlinkedGalleries: Gallery[];
}) {
  if (projects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sin trabajos todavía. Crea el primero con &quot;Nuevo trabajo&quot;.
      </p>
    );
  }

  const serviceTitle = (id: string | null) =>
    id ? services.find((s) => s.id === id)?.title ?? null : null;

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          accountId={accountId}
          project={project}
          services={services}
          serviceName={serviceTitle(project.service_id)}
          galleries={galleries.filter((g) => g.project_id === project.id)}
          unlinkedGalleries={unlinkedGalleries}
        />
      ))}
    </div>
  );
}

function ProjectCard({
  accountId,
  project,
  services,
  serviceName,
  galleries,
  unlinkedGalleries,
}: {
  accountId: string;
  project: CrmProject;
  services: ServiceOption[];
  serviceName: string | null;
  galleries: Gallery[];
  unlinkedGalleries: Gallery[];
}) {
  const [pending, startTransition] = useTransition();
  const [attaching, setAttaching] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{project.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {serviceName ? `${serviceName} · ` : ""}
            {formatMoney(project.budget_amount, project.currency)}
            {project.due_date ? ` · entrega ${project.due_date}` : ""}
          </p>
          {project.description && (
            <p className="mt-2 text-sm text-foreground/80">{project.description}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Select
            defaultValue={project.status}
            onValueChange={(value) => {
              startTransition(() =>
                setProjectStatus(project.id, accountId, value),
              );
              toast.success("Estado actualizado");
            }}
          >
            <SelectTrigger className="w-[150px]" disabled={pending}>
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

          <CrmProjectForm
            accountId={accountId}
            services={services}
            project={project}
          />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Eliminar trabajo">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  ¿Eliminar &quot;{project.title}&quot;?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Se borra el trabajo. Las galerías enlazadas se conservan (quedan
                  sin trabajo). No se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  disabled={pending}
                  onClick={() => {
                    startTransition(() => deleteProject(project.id, accountId));
                    toast.success("Trabajo eliminado");
                  }}
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Galerías enlazadas a este trabajo */}
      <div className="mt-4 border-t border-border/60 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Camera className="size-3.5" /> Galerías de entrega
          </p>
          <div className="flex items-center gap-2">
            {unlinkedGalleries.length > 0 && (
              <Select
                value=""
                onValueChange={(galleryId) => {
                  setAttaching(true);
                  startTransition(() => {
                    linkGalleryToProject(galleryId, project.id, accountId);
                  });
                  toast.success("Galería enlazada");
                  setAttaching(false);
                }}
              >
                <SelectTrigger className="h-8 w-[200px] text-xs" disabled={attaching}>
                  <SelectValue placeholder="Enlazar galería existente…" />
                </SelectTrigger>
                <SelectContent>
                  {unlinkedGalleries.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <GalleryForm projectId={project.id} triggerLabel="Nueva galería" />
          </div>
        </div>

        {galleries.length === 0 ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ImagePlus className="size-3.5" />
            Sin galerías. Crea una nueva o enlaza una existente.
          </p>
        ) : (
          <ul className="mt-2 space-y-1">
            {galleries.map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-1.5"
              >
                <Link
                  href={`/admin/galerias/${g.id}`}
                  className="truncate text-sm hover:underline"
                >
                  {g.title}
                </Link>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {g.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    title="Quitar del trabajo"
                    disabled={pending}
                    onClick={() => {
                      startTransition(() =>
                        linkGalleryToProject(g.id, null, accountId),
                      );
                      toast.success("Galería desenlazada");
                    }}
                  >
                    <Link2Off className="size-3.5" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
