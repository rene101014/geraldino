import type { Metadata } from "next";
import { getServices } from "@/lib/data/services";
import { getSiteContent } from "@/lib/data/content";
import { getSiteUrl } from "@/lib/seo/site-url";
import { ContactForm } from "@/components/site/contact-form";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Agenda una llamada con Geraldino para tu próximo proyecto audiovisual.",
  alternates: { canonical: `${getSiteUrl()}/contacto` },
};

export default async function ContactoPage({
  searchParams,
}: {
  searchParams: Promise<{ servicio?: string }>;
}) {
  const [{ servicio }, services, content] = await Promise.all([
    searchParams,
    getServices(),
    getSiteContent(),
  ]);

  const initialService = services.find((s) => s.slug === servicio)?.title;

  return (
    <main className="px-6 pb-20 pt-36 md:pb-28 md:pt-44">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            Contacto
          </p>
          <h1 className="font-heading mt-4 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Hablemos de tu proyecto
          </h1>
          <p className="mt-6 max-w-sm text-foreground/60">
            Cuéntame qué necesitas y en qué fecha lo necesitas. Te respondo
            personalmente para agendar una llamada.
          </p>

          <dl className="mt-10 space-y-4 text-sm">
            {content?.contact_email ? (
              <div>
                <dt className="font-mono text-xs uppercase tracking-wider text-foreground/40">
                  Email
                </dt>
                <dd className="mt-1">
                  <a href={`mailto:${content.contact_email}`} className="hover:text-primary">
                    {content.contact_email}
                  </a>
                </dd>
              </div>
            ) : null}
            {content?.contact_phone ? (
              <div>
                <dt className="font-mono text-xs uppercase tracking-wider text-foreground/40">
                  Teléfono
                </dt>
                <dd className="mt-1">{content.contact_phone}</dd>
              </div>
            ) : null}
            {content?.address ? (
              <div>
                <dt className="font-mono text-xs uppercase tracking-wider text-foreground/40">
                  Ubicación
                </dt>
                <dd className="mt-1">{content.address}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <ContactForm
          services={services.map((s) => s.title)}
          initialService={initialService}
        />
      </div>
    </main>
  );
}
