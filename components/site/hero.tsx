import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/site/reveal";

export function Hero({
  brandName,
  founderName,
  heroTitle,
  heroSubtitle,
  heroCtaLabel,
  logoUrl,
}: {
  brandName: string;
  founderName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaLabel: string;
  logoUrl?: string | null;
}) {
  return (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden px-6 pb-16 pt-32 md:min-h-[92vh] md:pt-28">
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

      <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-foreground/50">
            Casa productora audiovisual — República Dominicana
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          {logoUrl ? (
            <h1 className="mt-10">
              <Image
                src={logoUrl}
                alt={brandName}
                width={640}
                height={220}
                priority
                className="mx-auto h-[clamp(6.5rem,22vw,15rem)] w-auto object-contain"
              />
            </h1>
          ) : (
            <h1 className="font-heading mt-8 text-balance text-[clamp(3.25rem,10vw,8.5rem)] font-black leading-[0.9] tracking-tighter">
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
          )}
        </Reveal>

        {logoUrl && heroTitle !== brandName ? (
          <Reveal delay={0.14}>
            <p className="mt-6 max-w-2xl font-heading text-2xl font-light italic text-foreground/40 md:text-4xl">
              {heroTitle}
            </p>
          </Reveal>
        ) : null}

        <Reveal delay={0.18}>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-foreground/70 md:text-xl">
            {heroSubtitle}
          </p>
        </Reveal>

        <Reveal delay={0.26}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
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
        </Reveal>

        <Reveal delay={0.32}>
          <p className="mt-8 font-mono text-xs text-foreground/40">
            Dirección creativa — {founderName}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
