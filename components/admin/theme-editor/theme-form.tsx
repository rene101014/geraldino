"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { updateTheme, type ThemeFormState } from "@/app/admin/(dashboard)/tema/actions";

const initialState: ThemeFormState = { error: null, success: false };

type ColorFieldProps = {
  name: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
};

function ColorField({ name, label, hint, value, onChange }: ColorFieldProps) {
  return (
    <div className="flex items-center gap-4">
      <label className="relative size-12 shrink-0 cursor-pointer overflow-hidden rounded-full border border-border shadow-sm">
        <input
          type="color"
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute -inset-2 cursor-pointer"
          aria-label={label}
        />
      </label>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
        <p className="font-mono text-xs uppercase text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

export function ThemeForm({
  background: initialBackground,
  foreground: initialForeground,
  accent: initialAccent,
  radius: initialRadius,
}: {
  background: string;
  foreground: string;
  accent: string;
  radius: number;
}) {
  const [state, formAction, pending] = useActionState(updateTheme, initialState);
  const [background, setBackground] = useState(initialBackground);
  const [foreground, setForeground] = useState(initialForeground);
  const [accent, setAccent] = useState(initialAccent);
  const [radius, setRadius] = useState(initialRadius);

  useEffect(() => {
    if (state.success) toast.success("Tema actualizado");
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <form action={formAction} className="space-y-8">
        <input type="hidden" name="background" value={background} />
        <input type="hidden" name="foreground" value={foreground} />
        <input type="hidden" name="accent" value={accent} />
        <input type="hidden" name="radius" value={radius} />

        <div className="space-y-5">
          <ColorField
            name="background-picker"
            label="Fondo"
            hint="Color base del sitio"
            value={background}
            onChange={setBackground}
          />
          <ColorField
            name="foreground-picker"
            label="Texto"
            hint="Color principal de texto"
            value={foreground}
            onChange={setForeground}
          />
          <ColorField
            name="accent-picker"
            label="Acento"
            hint="Botones, enlaces activos, detalles"
            value={accent}
            onChange={setAccent}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Esquinas</Label>
            <span className="text-xs text-muted-foreground">{radius.toFixed(2)}rem</span>
          </div>
          <Slider
            min={0}
            max={1.5}
            step={0.05}
            value={[radius]}
            onValueChange={([v]) => setRadius(v)}
          />
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </form>

      <ThemePreview background={background} foreground={foreground} accent={accent} radius={radius} />
    </div>
  );
}

function ThemePreview({
  background,
  foreground,
  accent,
  radius,
}: {
  background: string;
  foreground: string;
  accent: string;
  radius: number;
}) {
  return (
    <div
      className="rounded-2xl border border-border p-8"
      style={{ background, color: foreground }}
    >
      <p className="text-xs font-medium uppercase tracking-widest opacity-60">
        Vista previa
      </p>
      <h3 className="font-heading mt-3 text-2xl font-semibold">Geraldino</h3>
      <p className="mt-2 max-w-sm text-sm opacity-80">
        Así se ve el texto y el fondo del sitio con esta combinación de colores.
      </p>
      <button
        type="button"
        className="mt-6 px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
        style={{ background: accent, borderRadius: `${radius}rem` }}
      >
        Botón de acento
      </button>
    </div>
  );
}
