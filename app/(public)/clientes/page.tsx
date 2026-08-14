import type { Metadata } from "next";
import { getClients } from "@/lib/data/clients";
import { getSiteUrl } from "@/lib/seo/site-url";
import { ClientLogoWall } from "@/components/site/client-logo-wall";

// ISR: generada una vez y servida desde el edge cache de Vercel. Se
// regenera a los 5 min o cuando el admin invalida los tags.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Clientes",
  description: "Marcas y negocios que han trabajado con Geraldino.",
  alternates: { canonical: `${getSiteUrl()}/clientes` },
};

export default async function ClientesPage() {
  const clients = await getClients();

  return (
    <main className="px-6 pb-20 pt-36 md:pb-28 md:pt-44">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
          Clientes
        </p>
        <h1 className="font-heading mt-4 text-balance max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
          Con quién se ha trabajado
        </h1>

        <ClientLogoWall clients={clients} />
      </div>
    </main>
  );
}
