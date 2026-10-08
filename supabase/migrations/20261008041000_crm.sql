-- Módulo CRM: gestión de clientes para entregar trabajos y, más adelante,
-- cotizar. Dos tipos de cliente: 'agencia' y 'particular'. Las agencias
-- agrupan sub-clientes (las marcas/clientes a los que el estudio les trabaja)
-- mediante parent_id autorreferenciado.
--
-- OJO: la tabla pública `clients` (showcase de logos) NO es esto. El CRM vive
-- en tablas `crm_*` aparte. Mismo criterio defensivo del resto del esquema:
-- uso admin (authenticated) + service_role; el público (anon) no tiene acceso.

-- =====================================================================
-- 1. Cuentas: clientes (particulares) y agencias, con jerarquía
-- =====================================================================
create table public.crm_accounts (
  id uuid primary key default gen_random_uuid(),
  -- 'agencia' = puede tener sub-clientes; 'particular' = cliente directo.
  type text not null default 'particular'
    check (type in ('agencia', 'particular')),
  -- Agencia padre cuando esta fila es un sub-cliente. NULL = nivel superior
  -- (agencia o cliente directo). La regla "parent solo puede ser una agencia y
  -- una agencia no puede tener parent" se valida en la capa de servidor.
  parent_id uuid references public.crm_accounts(id) on delete cascade,
  name text not null,
  contact_name text,
  email text,
  phone text,
  whatsapp text,
  -- Identificación fiscal (RNC) para futura facturación/cotización.
  rnc text,
  address text,
  website_url text,
  notes text,
  status text not null default 'activo'
    check (status in ('activo', 'prospecto', 'inactivo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_accounts_type_idx on public.crm_accounts (type);
create index crm_accounts_parent_idx on public.crm_accounts (parent_id);
create index crm_accounts_status_idx
  on public.crm_accounts (status, created_at desc);

-- =====================================================================
-- 2. Trabajos (proyectos): lo que el estudio le hace a un cliente
-- =====================================================================
create table public.crm_projects (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null
    references public.crm_accounts(id) on delete cascade,
  title text not null,
  description text,
  -- Tipo de trabajo tomado del catálogo público de servicios (opcional).
  service_id uuid references public.services(id) on delete set null,
  status text not null default 'propuesta'
    check (status in ('propuesta', 'en_progreso', 'entregado', 'cerrado', 'cancelado')),
  start_date date,
  due_date date,
  budget_amount numeric(12, 2),
  currency text not null default 'DOP'
    check (currency in ('DOP', 'USD')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_projects_account_idx on public.crm_projects (account_id);
create index crm_projects_status_idx on public.crm_projects (status);

-- =====================================================================
-- 3. Enlace de galerías a trabajos (aditivo: no toca columnas existentes)
--    Una galería puede pertenecer a un trabajo del CRM. Soft link.
-- =====================================================================
alter table public.galleries
  add column project_id uuid references public.crm_projects(id) on delete set null;

create index galleries_project_idx on public.galleries (project_id);

-- =====================================================================
-- 4. Triggers updated_at (reutiliza public.set_updated_at()).
-- =====================================================================
create trigger trg_crm_accounts_updated_at
  before update on public.crm_accounts
  for each row execute function public.set_updated_at();

create trigger trg_crm_projects_updated_at
  before update on public.crm_projects
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 5. RLS: admin autenticado con acceso total; público (anon) sin acceso.
-- =====================================================================
alter table public.crm_accounts enable row level security;
alter table public.crm_projects enable row level security;

create policy "admin_full_crm_accounts" on public.crm_accounts
  for all to authenticated using (true) with check (true);
create policy "admin_full_crm_projects" on public.crm_projects
  for all to authenticated using (true) with check (true);

-- Grants explícitos (defensivo, igual que el resto del esquema).
grant all on public.crm_accounts, public.crm_projects
  to authenticated, service_role;
