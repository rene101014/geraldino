"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { updateLeadStatus } from "@/app/admin/(dashboard)/leads/actions";
import type { Database } from "@/types/database.types";

type Lead = Database["public"]["Tables"]["contact_submissions"]["Row"];

const STATUS_LABEL: Record<string, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  closed: "Cerrado",
  spam: "Spam",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  new: "default",
  contacted: "secondary",
  closed: "outline",
  spam: "outline",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const [openLead, setOpenLead] = useState<Lead | null>(null);

  if (leads.length === 0) {
    return (
      <p className="mt-10 text-sm text-muted-foreground">
        Todavía no has recibido mensajes desde el formulario de contacto.
      </p>
    );
  }

  return (
    <>
      <Table className="mt-8">
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Servicio</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="w-40">Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <LeadRow key={lead.id} lead={lead} onOpen={() => setOpenLead(lead)} />
          ))}
        </TableBody>
      </Table>

      <Sheet open={!!openLead} onOpenChange={(open) => !open && setOpenLead(null)}>
        <SheetContent>
          {openLead ? (
            <>
              <SheetHeader>
                <SheetTitle>{openLead.name}</SheetTitle>
                <SheetDescription>
                  <a href={`mailto:${openLead.email}`} className="hover:text-primary">
                    {openLead.email}
                  </a>
                  {openLead.phone ? ` · ${openLead.phone}` : ""}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4 text-sm">
                {openLead.service_interest ? (
                  <p>
                    <span className="text-muted-foreground">Servicio: </span>
                    {openLead.service_interest}
                  </p>
                ) : null}
                {openLead.budget_range ? (
                  <p>
                    <span className="text-muted-foreground">Presupuesto: </span>
                    {openLead.budget_range}
                  </p>
                ) : null}
                <p className="whitespace-pre-wrap leading-relaxed">{openLead.message}</p>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}

function LeadRow({ lead, onOpen }: { lead: Lead; onOpen: () => void }) {
  const [status, setStatus] = useState(lead.status);
  const [, startTransition] = useTransition();

  return (
    <TableRow className="cursor-pointer" onClick={onOpen}>
      <TableCell>
        <p className="font-medium">{lead.name}</p>
        <p className="text-xs text-muted-foreground">{lead.email}</p>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {lead.service_interest ?? "—"}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(lead.created_at)}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Select
          value={status}
          onValueChange={(value) => {
            const previous = status;
            setStatus(value);
            startTransition(async () => {
              try {
                await updateLeadStatus(lead.id, value);
              } catch {
                setStatus(previous);
                toast.error("No se pudo actualizar el estado. Intenta de nuevo.");
              }
            });
          }}
        >
          <SelectTrigger size="sm" className="w-full">
            <SelectValue>
              <Badge variant={STATUS_VARIANT[status] ?? "outline"}>
                {STATUS_LABEL[status] ?? status}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
    </TableRow>
  );
}
