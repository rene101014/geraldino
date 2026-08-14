import Link from "next/link";
import { Reveal } from "@/components/site/reveal";

export function Hero({
  brandName,
  founderName,
  heroTitle,
  heroSubtitle,
  heroCtaLabel,
}: {
  brandName: string;
  founderName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaLabel: string;
}) {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-36 md:pt-44">
      {/* Los halos usaban size-[42rem]/blur-[140px] y size-[36rem]/blur-[160px].
          Un filtro de desenfoque de ese radio sobre un elemento de ~670px
          obliga a WebKit a rasterizar un buffer enorme fuera de pantalla en
          cada repintado, lo que en iPhone se traduce en scroll trabado.
          Se reduce el radio y el tamaño manteniendo el mismo efecto visual. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-0 size-[26rem] rounded-full bg-primary/25 blur-[80px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/3 size-[22rem] rounded-full bg-primary/10 blur-[90px]"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="flex items-start justify-between">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-foreground/50">
              Casa productora audiovisual — República Dominicana
            </p>
          </Reveal>
          <span className="hidden font-mono text-xs text-foreground/30 md:block">
            N° 01
          </span>
        </div>

        <Reveal delay={0.08}>
          <h1 className="font-heading mt-6 text-balance text-[clamp(3.25rem,10vw,8.5rem)] font-black leading-[0.9] tracking-tighter">
            {heroTitle === brandName ? (
              brandName
            ) : (
              <>
                {brandName}
                <span className="block font-light italic text-foreground/30">
                  {heroTitle}
                </span>
              </>
            )}
          </h1>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
          <Reveal delay={0.16}>
            <p className="max-w-xl text-lg leading-relaxed text-foreground/70 md:text-xl">
              {heroSubtitle}
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="flex flex-col items-start gap-4 md:items-end">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/portafolio"
                  className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
                >
                  {heroCtaLabel}
                </Link>
                <Link
                  href="/contacto"
                  className="rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-foreground/30"
                >
                  Hablemos
                </Link>
              </div>
              <p className="font-mono text-xs text-foreground/40">
                Dirección creativa — {founderName}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
