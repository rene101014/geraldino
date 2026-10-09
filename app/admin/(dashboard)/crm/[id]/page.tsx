import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  MessageCircle,
  Globe,
  MapPin,
  FileText,
  ReceiptText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ACCOUNT_STATUS_LABELS,
  ACCOUNT_TYPE_LABELS,
  type CrmAccount,
  type CrmProject,
} from "@/lib/data/crm";
import type { Gallery } from "@/lib/data/galleries";
import { CrmAccountForm } from "@/components/admin/crm-account-form";
import { CrmAccountDelete } from "@/components/admin/crm-account-delete";
import { CrmProjectForm } from "@/components/admin/crm-project-form";
import { CrmProjectsList } from "@/components/admin/crm-projects-list";

export default async function CrmAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: account } = await supabase
    .from("crm_accounts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!account) notFound();
  const acc = account as CrmAccount;
  const isAgency = acc.type === "agencia";

  // Datos en paralelo: sub-clientes (si agencia), agencia padre (si sub-cliente),
  // trabajos, servicios publicados y todas las agencias (para el form de edición).
  const [childrenRes, parentRes, projectsRes, servicesRes, agenciesRes] =
    await Promise.all([
      isAgency
        ? supabase
            .from("crm_accounts")
            .select("*")
            .eq("parent_id", id)
            .order("name")
        : Promise.resolve({ data: [] as CrmAccount[] }),
      acc.parent_id
        ? supabase
            .from("crm_accounts")
            .select("id, name")
            .eq("id", acc.parent_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("crm_projects")
        .select("*")
        .eq("account_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("services")
        .select("id, title")
        .eq("published", true)
        .order("order_index"),
      supabase.from("crm_accounts").select("id, name").eq("type", "agencia"),
    ]);

  const children = (childrenRes.data ?? []) as CrmAccount[];
  const parent = parentRes.data as { id: string; name: string } | null;
  const projects = (projectsRes.data ?? []) as CrmProject[];
  const services = (servicesRes.data ?? []) as { id: string; title: string }[];
  const agencies = (agenciesRes.data ?? []) as { id: string; name: string }[];

  // Galerías: las enlazadas a los trabajos de este cliente + las libres (sin
  // trabajo) para poder enlazarlas.
  const projectIds = projects.map((p) => p.id);
  const [linkedRes, unlinkedRes] = await Promise.all([
    projectIds.length > 0
      ? supabase.from("galleries").select("*").in("project_id", projectIds)
      : Promise.resolve({ data: [] as Gallery[] }),
    supabase
      .from("galleries")
      .select("*")
      .is("project_id", null)
      .order("created_at", { ascending: false }),
  ]);
  const linkedGalleries = (linkedRes.data ?? []) as Gallery[];
  const unlinkedGalleries = (unlinkedRes.data ?? []) as Gallery[];

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/crm"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver al CRM
      </Link>

      {/* Encabezado */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {isAgency ? (
              <Building2 className="size-5 text-muted-foreground" />
            ) : (
              <User className="size-5 text-muted-foreground" />
            )}
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {acc.name}
            </h1>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {ACCOUNT_TYPE_LABELS[acc.type] ?? acc.type}
            </Badge>
            <Badge variant="outline">
              {ACCOUNT_STATUS_LABELS[acc.status] ?? acc.status}
            </Badge>
            {parent && (
              <Link
                href={`/admin/crm/${parent.id}`}
                className="text-xs text-muted-foreground hover:underline"
              >
                Sub-cliente de {parent.name}
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="sm">
            <Link href={`/admin/cotizaciones/nueva?account=${acc.id}`}>
              <ReceiptText className="mr-1 size-4" />
              Nueva cotización
            </Link>
          </Button>
          <CrmAccountForm account={acc} agencies={agencies} trigger="edit" />
          <CrmAccountDelete id={acc.id} name={acc.name} isAgency={isAgency} />
        </div>
      </div>

      {/* Datos de contacto */}
      <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
        <ContactField icon={User} label="Contacto" value={acc.contact_name} />
        <ContactField icon={Mail} label="Email" value={acc.email} />
        <ContactField icon={Phone} label="Teléfono" value={acc.phone} />
        <ContactField icon={MessageCircle} label="WhatsApp" value={acc.whatsapp} />
        <ContactField icon={FileText} label="RNC" value={acc.rnc} />
        <ContactField icon={Globe} label="Sitio web" value={acc.website_url} />
        <ContactField icon={MapPin} label="Dirección" value={acc.address} />
      </div>
      {acc.notes && (
        <p className="mt-3 rounded-lg border border-border bg-muted/40 p-4 text-sm text-foreground/80">
          {acc.notes}
        </p>
      )}

      {/* Sub-clientes (solo agencias) */}
      {isAgency && (
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">
              Sub-clientes{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({children.length})
              </span>
            </h2>
            <CrmAccountForm
              parentId={acc.id}
              parentName={acc.name}
              trigger="subcliente"
            />
          </div>

          {children.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Esta agencia aún no tiene sub-clientes.
            </p>
          ) : (
            <div className="mt-3 divide-y divide-border rounded-xl border border-border">
              {children.map((child) => (
                <Link
                  key={child.id}
                  href={`/admin/crm/${child.id}`}
                  className="flex items-center justify-between gap-3 p-3 hover:bg-muted/40"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <User className="size-4 text-muted-foreground" />
                    {child.name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {ACCOUNT_STATUS_LABELS[child.status] ?? child.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Trabajos */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">
            Trabajos{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({projects.length})
            </span>
          </h2>
          <CrmProjectForm accountId={acc.id} services={services} />
        </div>

        <div className="mt-4">
          <CrmProjectsList
            accountId={acc.id}
            projects={projects}
            services={services}
            galleries={linkedGalleries}
            unlinkedGalleries={unlinkedGalleries}
          />
        </div>
      </section>
    </div>
  );
}

function ContactField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm">{value}</p>
      </div>
    </div>
  );
}
