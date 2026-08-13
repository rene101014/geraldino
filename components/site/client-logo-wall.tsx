import Image from "next/image";
import { storagePublicUrl } from "@/lib/storage/public-url";
import type { Client } from "@/lib/data/clients";

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function ClientLogoWall({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return (
      <div className="mt-16 rounded-2xl border border-dashed border-border px-8 py-16 text-center">
        <p className="font-heading text-xl font-medium">
          La lista de clientes se está actualizando
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Pronto vas a ver aquí las marcas que han trabajado con Geraldino.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} />
      ))}
    </div>
  );
}

function ClientCard({ client }: { client: Client }) {
  const content = (
    <div className="group flex aspect-[3/2] flex-col items-center justify-center gap-3 rounded-xl border border-border p-6 transition-colors hover:border-foreground/30">
      {client.logo_path ? (
        <div className="relative h-12 w-full grayscale transition-all duration-300 group-hover:grayscale-0">
          <Image
            src={storagePublicUrl("clients", client.logo_path)}
            alt={client.name}
            fill
            sizes="200px"
            className="object-contain"
          />
        </div>
      ) : (
        <span className="flex size-12 items-center justify-center rounded-full bg-muted font-heading text-lg font-semibold text-foreground/70">
          {initialsOf(client.name)}
        </span>
      )}
      <span className="text-center text-sm font-medium text-foreground/70">
        {client.name}
      </span>
    </div>
  );

  if (client.website_url) {
    return (
      <a href={client.website_url} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}
