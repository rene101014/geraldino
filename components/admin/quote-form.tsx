"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createQuote, updateQuote } from "@/app/admin/(dashboard)/cotizaciones/actions";
import { computeTotals } from "@/lib/validations/quotes";
import { formatMoney } from "@/lib/data/crm";
import type { QuoteWithItems } from "@/lib/data/quotes";

type AccountOption = { id: string; name: string; email: string | null };
type ServiceOption = { id: string; title: string };
type ItemRow = {
  service_id: string;
  description: string;
  quantity: string;
  unit_price: string;
};

const emptyRow = (): ItemRow => ({
  service_id: "",
  description: "",
  quantity: "1",
  unit_price: "0",
});

export function QuoteForm({
  accounts,
  services,
  quote,
}: {
  accounts: AccountOption[];
  services: ServiceOption[];
  quote?: QuoteWithItems;
}) {
  const isEdit = !!quote;
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [accountId, setAccountId] = useState(quote?.account_id ?? "");
  const [title, setTitle] = useState(quote?.title ?? "");
  const [clientName, setClientName] = useState(quote?.client_name ?? "");
  const [clientEmail, setClientEmail] = useState(quote?.client_email ?? "");
  const [currency, setCurrency] = useState(quote?.currency ?? "DOP");
  const [taxEnabled, setTaxEnabled] = useState(quote?.tax_enabled ?? true);
  const [taxRate, setTaxRate] = useState(String(quote?.tax_rate ?? 18));
  const [discount, setDiscount] = useState(String(quote?.discount ?? 0));
  const [validUntil, setValidUntil] = useState(quote?.valid_until ?? "");
  const [notes, setNotes] = useState(quote?.notes ?? "");
  const [terms, setTerms] = useState(quote?.terms ?? "");

  const [items, setItems] = useState<ItemRow[]>(
    quote?.items.length
      ? quote.items.map((it) => ({
          service_id: it.service_id ?? "",
          description: it.description,
          quantity: String(it.quantity),
          unit_price: String(it.unit_price),
        }))
      : [emptyRow()],
  );

  const totals = useMemo(
    () =>
      computeTotals({
        items: items.map((it) => ({
          quantity: Number(it.quantity) || 0,
          unit_price: Number(it.unit_price) || 0,
        })),
        discount: Number(discount) || 0,
        tax_enabled: taxEnabled,
        tax_rate: Number(taxRate) || 0,
      }),
    [items, discount, taxEnabled, taxRate],
  );

  function updateItem(index: number, patch: Partial<ItemRow>) {
    setItems((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function onPickAccount(value: string) {
    const id = value === "none" ? "" : value;
    setAccountId(id);
    const acc = accounts.find((a) => a.id === id);
    if (acc) {
      if (!clientName) setClientName(acc.name);
      if (!clientEmail && acc.email) setClientEmail(acc.email);
    }
  }

  function onPickService(index: number, value: string) {
    const id = value === "none" ? "" : value;
    const svc = services.find((s) => s.id === id);
    updateItem(index, {
      service_id: id,
      description:
        svc && !items[index].description ? svc.title : items[index].description,
    });
  }

  async function handleSubmit() {
    if (!title.trim()) {
      toast.error("Ponle un título a la cotización");
      return;
    }
    const payload = {
      account_id: accountId || null,
      title,
      client_name: clientName || null,
      client_email: clientEmail || null,
      currency,
      tax_enabled: taxEnabled,
      tax_rate: Number(taxRate) || 0,
      discount: Number(discount) || 0,
      valid_until: validUntil || null,
      notes: notes || null,
      terms: terms || null,
      items: items.map((it) => ({
        service_id: it.service_id || null,
        description: it.description,
        quantity: Number(it.quantity) || 0,
        unit_price: Number(it.unit_price) || 0,
      })),
    };

    setSaving(true);
    try {
      const result = isEdit
        ? await updateQuote(quote!.id, payload)
        : await createQuote(payload);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(isEdit ? "Cotización actualizada" : "Cotización creada");
      router.push(`/admin/cotizaciones/${result.id}`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="space-y-2">
          <Label htmlFor="title">Título de la cotización</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Sesión de producto — Marca X"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Cliente (CRM)</Label>
            <Select value={accountId || "none"} onValueChange={onPickAccount}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin cliente del CRM</SelectItem>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_name">Nombre en la cotización</Label>
            <Input
              id="client_name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client_email">Email del cliente</Label>
            <Input
              id="client_email"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="valid_until">Válida hasta</Label>
            <Input
              id="valid_until"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Ítems */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Ítems</h3>
          <div className="w-32">
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

        <div className="mt-4 space-y-3">
          {items.map((row, index) => {
            const lineTotal =
              (Number(row.quantity) || 0) * (Number(row.unit_price) || 0);
            return (
              <div
                key={index}
                className="grid grid-cols-12 items-end gap-2 rounded-lg border border-border/60 p-3"
              >
                <div className="col-span-12 space-y-1 sm:col-span-5">
                  <Label className="text-xs">Descripción</Label>
                  <Input
                    value={row.description}
                    onChange={(e) =>
                      updateItem(index, { description: e.target.value })
                    }
                    placeholder="Detalle del servicio"
                  />
                  {services.length > 0 && (
                    <Select
                      value={row.service_id || "none"}
                      onValueChange={(v) => onPickService(index, v)}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Desde servicio…" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin servicio</SelectItem>
                        {services.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="col-span-3 space-y-1 sm:col-span-2">
                  <Label className="text-xs">Cantidad</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={row.quantity}
                    onChange={(e) => updateItem(index, { quantity: e.target.value })}
                  />
                </div>
                <div className="col-span-4 space-y-1 sm:col-span-2">
                  <Label className="text-xs">Precio</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={row.unit_price}
                    onChange={(e) =>
                      updateItem(index, { unit_price: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-4 space-y-1 sm:col-span-2">
                  <Label className="text-xs">Total</Label>
                  <p className="truncate py-2 text-sm font-medium">
                    {formatMoney(lineTotal, currency)}
                  </p>
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    disabled={items.length === 1}
                    onClick={() =>
                      setItems((prev) => prev.filter((_, i) => i !== index))
                    }
                    title="Quitar ítem"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => setItems((prev) => [...prev, emptyRow()])}
        >
          <Plus className="mr-1 size-4" />
          Agregar ítem
        </Button>
      </div>

      {/* Totales + impuestos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between rounded-md border border-border p-3">
            <div>
              <Label htmlFor="tax_enabled">Cobrar ITBIS</Label>
              <p className="text-xs text-muted-foreground">
                Impuesto sobre el subtotal menos el descuento.
              </p>
            </div>
            <Switch
              id="tax_enabled"
              checked={taxEnabled}
              onCheckedChange={setTaxEnabled}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax_rate">Tasa de ITBIS (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                disabled={!taxEnabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Descuento ({currency})</Label>
              <Input
                id="discount"
                type="number"
                min={0}
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{formatMoney(totals.subtotal, currency)}</dd>
            </div>
            {Number(discount) > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Descuento</dt>
                <dd>− {formatMoney(Number(discount), currency)}</dd>
              </div>
            )}
            {taxEnabled && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">ITBIS ({taxRate}%)</dt>
                <dd>{formatMoney(totals.taxAmount, currency)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatMoney(totals.total, currency)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Notas y términos */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="notes">Notas (visibles para el cliente)</Label>
          <Textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="terms">Términos y condiciones</Label>
          <Textarea
            id="terms"
            rows={3}
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear cotización"}
        </Button>
      </div>
    </div>
  );
}
