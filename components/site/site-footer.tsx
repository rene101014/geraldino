import Link from "next/link";
import { AtSign, Mail, MessageCircle } from "lucide-react";
import { getSocialLinks } from "@/lib/data/social-links";

const PLATFORM_ICON = {
  instagram: AtSign,
  whatsapp: MessageCircle,
  email: Mail,
} as const;

const PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  email: "Email",
};

export async function SiteFooter({ brandName }: { brandName: string }) {
  const socialLinks = await getSocialLinks();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="font-heading text-xl font-semibold tracking-tight">
            {brandName}
          </span>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Casa productora audiovisual fundada por Rene Geraldino en
            República Dominicana.
          </p>
        </div>

        <div className="flex flex-col gap-6 md:items-end">
          {socialLinks.length > 0 ? (
            <div className="flex items-center gap-4">
              {socialLinks.map((link) => {
                const Icon =
                  PLATFORM_ICON[link.platform as keyof typeof PLATFORM_ICON];
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={PLATFORM_LABEL[link.platform] ?? link.platform}
                    className="text-foreground/60 transition-colors hover:text-primary"
                  >
                    {Icon ? <Icon className="size-5" /> : link.platform}
                  </a>
                );
              })}
            </div>
          ) : null}

          <nav className="flex items-center gap-6 text-sm text-foreground/60">
            <Link href="/portafolio" className="hover:text-foreground">
              Portafolio
            </Link>
            <Link href="/clientes" className="hover:text-foreground">
              Clientes
            </Link>
            <Link href="/contacto" className="hover:text-foreground">
              Contacto
            </Link>
          </nav>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 font-mono text-xs text-foreground/40">
          <span>© {year} {brandName}</span>
          <span>Santo Domingo, RD</span>
        </div>
      </div>
    </footer>
  );
}
