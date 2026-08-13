"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
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
import { storagePublicUrl } from "@/lib/storage/public-url";
import { toggleClientPublished, deleteClient } from "@/app/admin/(dashboard)/clientes/actions";
import type { Client } from "@/lib/data/clients";

export function ClientsList({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return (
      <p className="mt-10 text-sm text-muted-foreground">
        Todavía no has agregado clientes. Usa &quot;Agregar cliente&quot; para
        empezar.
      </p>
    );
  }

  return (
    <div className="mt-8 divide-y divide-border rounded-xl border border-border">
      {clients.map((client) => (
        <ClientRow key={client.id} client={client} />
      ))}
    </div>
  );
}

function ClientRow({ client }: { client: Client }) {
  const [published, setPublished] = useState(client.published);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-4">
        {client.logo_path ? (
          <div className="relative size-10 shrink-0">
            <Image
              src={storagePublicUrl("clients", client.logo_path)}
              alt={client.name}
              fill
              sizes="40px"
              className="object-contain"
            />
          </div>
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground/70">
            {client.name[0]?.toUpperCase()}
          </span>
        )}
        <div>
          <p className="text-sm font-medium">{client.name}</p>
          {client.website_url ? (
            <p className="text-xs text-muted-foreground">{client.website_url}</p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Switch
          checked={published}
          disabled={pending}
          onCheckedChange={(value) => {
            setPublished(value);
            startTransition(() => toggleClientPublished(client.id, value));
          }}
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar &quot;{client.name}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                Se borra de la lista de clientes. No se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  startTransition(() => deleteClient(client.id));
                  toast.success("Cliente eliminado");
                }}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
