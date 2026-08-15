import Link from "next/link";
import { Reveal } from "@/components/site/reveal";

export function CtaBand() {
  return (
    <section className="relative overflow-hidden border-t border-border px-6 py-28 md:py-40">
      {/* Mismo ajuste que en hero.tsx: size-[44rem]/blur-[160px] obligaba a
          WebKit a rasterizar un buffer enorme fuera de pantalla en cada
          repintado (scroll trabado en iPhone). Se reduce manteniendo el
          mismo efecto visual. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1/2 top-1/2 size-[27rem] -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/20 blur-[95px]"
      />

      <div className="relative mx-auto max-w-6xl text-center">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            05 — Próximo paso
          </p>
          <h2 className="font-heading mx-auto mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Cuéntame qué estás filmando y lo llevamos a cámara.
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contacto"
              className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              Agendar una llamada
            </Link>
            <Link
              href="/portafolio"
              className="rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-foreground/30"
            >
              Ver portafolio
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
