-- Cotizador (Fase 2 del CRM): cotizaciones con ítems de línea, numeración
-- automática, totales con descuento + ITBIS opcional, y enlace público para
-- que el cliente acepte/rechace. Igual criterio defensivo: uso admin
-- (authenticated) + service_role; el público (anon) NO accede directo —
-- la página /cotizacion/<token> pasa por el servidor con service_role.

-- Secuencia para el número correlativo de cotización (COT-0001, COT-0002, …).
create sequence if not exists public.crm_quote_seq;

-- =====================================================================
-- 1. Cotizaciones
-- =====================================================================
create table public.crm_quotes (
  id uuid primary key default gen_random_uuid(),
  -- Cliente del CRM. set null para conservar la cotización si se borra el
  -- cliente (se guarda snapshot de nombre/email para que sea autocontenida).
  account_id uuid references public.crm_accounts(id) on delete set null,
  -- Trabajo asociado (opcional). Al aceptar se puede crear/enlazar uno.
  project_id uuid references public.crm_projects(id) on delete set null,
  -- Número correlativo legible. Default automático desde la secuencia.
  quote_number text not null unique
    default ('COT-' || lpad(nextval('public.crm_quote_seq')::text, 4, '0')),
  title text not null,
  -- Snapshot del cliente (para PDF / página pública sin depender del CRM).
  client_name text,
  client_email text,
  status text not null default 'borrador'
    check (status in ('borrador', 'enviada', 'aceptada', 'rechazada', 'vencida')),
  currency text not null default 'DOP'
    check (currency in ('DOP', 'USD')),
  -- ITBIS: activable por cotización, tasa configurable (18% por defecto en RD).
  tax_enabled boolean not null default true,
  tax_rate numeric(5, 2) not null default 18,
  discount numeric(12, 2) not null default 0,
  -- Totales calculados en el servidor al guardar (la página pública solo lee).
  subtotal numeric(12, 2) not null default 0,
  tax_amount numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  valid_until date,
  notes text,
  terms text,
  -- Token imposible de adivinar para la URL pública /cotizacion/<token>.
  token text not null unique,
  sent_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index crm_quotes_account_idx on public.crm_quotes (account_id);
create index crm_quotes_status_idx on public.crm_quotes (status, created_at desc);
create index crm_quotes_token_idx on public.crm_quotes (token);

-- =====================================================================
-- 2. Ítems de línea
-- =====================================================================
create table public.crm_quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.crm_quotes(id) on delete cascade,
  -- Servicio del catálogo (opcional, solo para prellenar la descripción).
  service_id uuid references public.services(id) on delete set null,
  description text not null,
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(12, 2) not null default 0,
  line_total numeric(12, 2) not null default 0,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create index crm_quote_items_quote_idx
  on public.crm_quote_items (quote_id, order_index);

-- =====================================================================
-- 3. Trigger updated_at (reutiliza public.set_updated_at()).
-- =====================================================================
create trigger trg_crm_quotes_updated_at
  before update on public.crm_quotes
  for each row execute function public.set_updated_at();

-- =====================================================================
-- 4. RLS: admin autenticado total; público sin acceso directo.
-- =====================================================================
alter table public.crm_quotes enable row level security;
alter table public.crm_quote_items enable row level security;

create policy "admin_full_crm_quotes" on public.crm_quotes
  for all to authenticated using (true) with check (true);
create policy "admin_full_crm_quote_items" on public.crm_quote_items
  for all to authenticated using (true) with check (true);

-- Grants explícitos (defensivo). La secuencia necesita usage para el default.
grant all on public.crm_quotes, public.crm_quote_items
  to authenticated, service_role;
grant usage, select on sequence public.crm_quote_seq
  to authenticated, service_role;
