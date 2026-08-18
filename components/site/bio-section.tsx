import Link from "next/link";
import { Reveal } from "@/components/site/reveal";

// Bio y CTA final vivían en dos <section> separadas (cada una con su
// propio borde y halo decorativo). Se fusionaron en una sola: menos DOM,
// menos capas que pintar, mismo contenido.
export function BioSection({
  heading,
  body,
  founderName,
}: {
  heading: string;
  body: string;
  founderName: string;
}) {
  const paragraphs = body.split(/\n\n+/).filter(Boolean);

  return (
    <section className="border-t border-border px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[280px_1fr] md:gap-16">
          <Reveal>
            <div className="md:sticky md:top-28">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                04 — Perfil
              </p>
              <h2 className="font-heading mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                {heading}
              </h2>
              <p className="mt-4 text-sm text-foreground/50">{founderName}</p>
            </div>
          </Reveal>

          <div className="space-y-6">
            {paragraphs.map((paragraph, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <p
                  className={
                    i === 0
                      ? "text-xl leading-relaxed text-foreground md:text-2xl"
                      : "max-w-2xl text-base leading-relaxed text-foreground/70"
                  }
                >
                  {paragraph}
                </p>
              </Reveal>
            ))}

            <Reveal delay={paragraphs.length * 0.06}>
              <div className="mt-10 border-t border-border pt-10">
                <h3 className="font-heading text-balance text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
                  Cuéntame qué estás filmando y lo llevamos a cámara.
                </h3>
                <div className="mt-6 flex flex-wrap items-center gap-4">
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
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
