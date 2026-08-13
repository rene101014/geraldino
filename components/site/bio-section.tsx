import { Reveal } from "@/components/site/reveal";

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
                03 — Perfil
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
          </div>
        </div>
      </div>
    </section>
  );
}
