import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import type { Service } from "@/lib/data/services";

export function ServicesIndex({ services }: { services: Service[] }) {
  const items = services.filter((s) => !s.is_addon);
  const addon = services.find((s) => s.is_addon);

  return (
    <section className="border-t border-border px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                03 — Servicios
              </p>
              <h2 className="font-heading mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                Qué se produce
              </h2>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 border-t border-border">
          {items.map((service, i) => (
            <Reveal key={service.id} delay={Math.min(i * 0.05, 0.3)}>
              <Link
                href={`/contacto?servicio=${service.slug}`}
                className="group relative flex flex-col gap-2 border-b border-border py-6 transition-colors sm:flex-row sm:items-center sm:gap-8 sm:py-7"
              >
                <span className="font-mono text-sm text-foreground/30 sm:w-10">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-heading text-xl font-medium tracking-tight transition-colors group-hover:text-primary sm:w-72 sm:text-2xl">
                  {service.title}
                </span>
                <span className="text-sm text-foreground/55 sm:flex-1">
                  {service.description}
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-5 shrink-0 text-foreground/25 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                />
                <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            </Reveal>
          ))}
        </div>

        {addon ? (
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-dashed border-primary/40 bg-accent px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Plus aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <p className="font-heading text-lg font-medium">
                    {addon.title}
                  </p>
                  <p className="mt-1 max-w-xl text-sm text-foreground/60">
                    {addon.description}
                  </p>
                </div>
              </div>
              <Link
                href={`/contacto?servicio=${addon.slug}`}
                className="shrink-0 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
              >
                Sumar a mi proyecto
              </Link>
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
