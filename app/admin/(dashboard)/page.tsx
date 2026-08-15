import Link from "next/link";
import { Palette, FileText, Images, Users, Briefcase, Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const SECTIONS = [
  {
    href: "/admin/tema",
    label: "Tema",
    description: "Colores de marca del sitio",
    icon: Palette,
  },
  {
    href: "/admin/contenido",
    label: "Inicio y bio",
    description: "Hero, biografía y datos de contacto",
    icon: FileText,
  },
  {
    href: "/admin/portafolio",
    label: "Portafolio",
    description: "Fotos y videos publicados",
    icon: Images,
    countKey: "portfolio_items" as const,
  },
  {
    href: "/admin/servicios",
    label: "Servicios",
    description: "Servicios ofrecidos y asesoría creativa",
    icon: Briefcase,
    countKey: "services" as const,
  },
  {
    href: "/admin/clientes",
    label: "Clientes",
    description: "Logos y nombres de clientes",
    icon: Users,
    countKey: "clients" as const,
  },
  {
    href: "/admin/leads",
    label: "Mensajes",
    description: "Leads del formulario de contacto",
    icon: Inbox,
    countKey: "contact_submissions" as const,
  },
];

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [portfolio, services, clients, leads] = await Promise.all([
    supabase.from("portfolio_items").select("id", { count: "exact", head: true }),
    supabase.from("services").select("id", { count: "exact", head: true }),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("contact_submissions").select("id", { count: "exact", head: true }),
  ]);

  const firstError = [portfolio, services, clients, leads].find((r) => r.error)?.error;
  if (firstError) {
    throw new Error(`Supabase: no se pudieron leer los conteos del panel: ${firstError.message}`);
  }

  const counts: Record<string, number> = {
    portfolio_items: portfolio.count ?? 0,
    services: services.count ?? 0,
    clients: clients.count ?? 0,
    contact_submissions: leads.count ?? 0,
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Panel
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Gestiona el contenido del sitio sin tocar código.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const count = section.countKey ? counts[section.countKey] : null;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon className="size-5 text-primary" />
                    {count !== null ? (
                      <span className="text-sm font-medium text-muted-foreground">
                        {count}
                      </span>
                    ) : null}
                  </div>
                  <CardTitle className="mt-2">{section.label}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
