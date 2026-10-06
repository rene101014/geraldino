"use client";

import { useActionState } from "react";
import {
  addContact,
  importContacts,
  setContactStatus,
  removeContact,
  type ContactState,
} from "@/app/admin/(dashboard)/suscriptores/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface ContactRow {
  id: string;
  email: string;
  name: string | null;
  status: string;
  source: string | null;
  created_at: string;
}

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  subscribed: { label: "Suscrito", variant: "default" },
  unsubscribed: { label: "Dado de baja", variant: "secondary" },
  bounced: { label: "Rebotado", variant: "destructive" },
  complained: { label: "Queja", variant: "destructive" },
};

const initial: ContactState = { error: null, success: false };

export function SubscribersManager({ contacts }: { contacts: ContactRow[] }) {
  const [addState, addAction, addPending] = useActionState(addContact, initial);
  const [importState, importAction, importPending] = useActionState(
    importContacts,
    initial,
  );

  return (
    <div className="mt-6 space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Alta individual */}
        <form action={addAction} className="space-y-3 rounded-lg border border-border p-4">
          <h2 className="font-medium">Agregar un contacto</h2>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="persona@correo.com" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre (opcional)</Label>
            <Input id="name" name="name" placeholder="Nombre" />
          </div>
          <Button type="submit" disabled={addPending}>
            {addPending ? "Agregando…" : "Agregar"}
          </Button>
          {addState.error && <p className="text-sm text-destructive">{addState.error}</p>}
          {addState.success && <p className="text-sm text-green-600">{addState.info}</p>}
        </form>

        {/* Importación masiva */}
        <form action={importAction} className="space-y-3 rounded-lg border border-border p-4">
          <h2 className="font-medium">Importar en masa</h2>
          <div className="space-y-1.5">
            <Label htmlFor="raw">Un email por línea (opcional &quot;email,nombre&quot;)</Label>
            <Textarea
              id="raw"
              name="raw"
              rows={5}
              placeholder={"ana@correo.com,Ana\nluis@correo.com"}
            />
          </div>
          <Button type="submit" variant="secondary" disabled={importPending}>
            {importPending ? "Importando…" : "Importar"}
          </Button>
          {importState.error && <p className="text-sm text-destructive">{importState.error}</p>}
          {importState.success && <p className="text-sm text-green-600">{importState.info}</p>}
        </form>
      </div>

      {/* Tabla de contactos */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Aún no hay suscriptores.
                </TableCell>
              </TableRow>
            )}
            {contacts.map((c) => {
              const s = STATUS_LABEL[c.status] ?? { label: c.status, variant: "outline" as const };
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.email}</TableCell>
                  <TableCell>{c.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.source ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {c.status === "subscribed" ? (
                        <form action={setContactStatus}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="status" value="unsubscribed" />
                          <Button type="submit" variant="ghost" size="sm">
                            Dar de baja
                          </Button>
                        </form>
                      ) : c.status === "unsubscribed" ? (
                        <form action={setContactStatus}>
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="status" value="subscribed" />
                          <Button type="submit" variant="ghost" size="sm">
                            Reactivar
                          </Button>
                        </form>
                      ) : null}
                      <form action={removeContact}>
                        <input type="hidden" name="id" value={c.id} />
                        <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                          Borrar
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
