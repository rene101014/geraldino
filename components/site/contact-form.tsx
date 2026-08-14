"use client";

import { useActionState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
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
import { submitContactLead, type ContactState } from "@/app/(public)/contacto/actions";

const BUDGET_RANGES = [
  "Menos de RD$25,000",
  "RD$25,000 – RD$75,000",
  "RD$75,000 – RD$150,000",
  "Más de RD$150,000",
  "Prefiero conversarlo",
];

const initialState: ContactState = { error: null, success: false };

// `services` llega como {slug,title} y el ?servicio= se lee aquí en el
// cliente. Antes la page hacía `await searchParams`, lo que obligaba a
// Next a renderizar /contacto por request y le quitaba el cacheo de CDN.
export function ContactForm({
  services,
}: {
  services: { slug: string; title: string }[];
}) {
  const searchParams = useSearchParams();
  const initialService = services.find(
    (s) => s.slug === searchParams.get("servicio"),
  )?.title;

  const [state, formAction, pending] = useActionState(submitContactLead, initialState);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  if (state.success) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-border p-10 text-center"
      >
        <p className="font-heading text-2xl font-semibold">Mensaje enviado</p>
        <p className="mt-2 text-muted-foreground">
          Gracias por escribir. Rene te responde personalmente en cuanto lo lea.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" autoComplete="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            spellCheck={false}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono (opcional)</Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="service_interest">Servicio de interés</Label>
          <Select name="service_interest" defaultValue={initialService}>
            <SelectTrigger id="service_interest" className="w-full">
              <SelectValue placeholder="Elige un servicio" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.slug} value={service.title}>
                  {service.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget_range">Presupuesto aproximado (opcional)</Label>
        <Select name="budget_range">
          <SelectTrigger id="budget_range" className="w-full">
            <SelectValue placeholder="Elige un rango" />
          </SelectTrigger>
          <SelectContent>
            {BUDGET_RANGES.map((range) => (
              <SelectItem key={range} value={range}>
                {range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Cuéntame sobre tu proyecto</Label>
        <Textarea id="message" name="message" rows={5} required minLength={10} />
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </form>
  );
}
