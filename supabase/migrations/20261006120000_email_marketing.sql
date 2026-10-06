-- Mail-room: email marketing propio sobre Amazon SES.
-- Mismo criterio defensivo que el resto del esquema (galleries / contact_submissions):
-- las tablas son de uso admin (authenticated) + service_role. El público (anon)
-- SOLO puede darse de alta como suscriptor (insert en email_contacts); todo lo demás
-- (envío por lotes, webhook de eventos SES, baja por token) pasa por rutas de
-- servidor que usan service_role y validan por su cuenta.
--
-- Flujo: email_campaigns (la campaña) -> email_sends (una fila por destinatario,
-- hace de cola y de estado individual) -> SES entrega -> SNS notifica al webhook
-- -> email_events (bitácora cruda) y se actualiza la fila de email_sends.
-- Las estadísticas (aperturas, clics, rebotes, bajas) se calculan desde email_sends.

-- =====================================================================
-- 1. Contactos (suscriptores)
-- =====================================================================
create table public.email_contacts (
  id uuid primary key default gen_random_uuid(),
  -- Siempre en minúsculas (se normaliza en la app). Único.
  email text not null unique,
  name text,
  status text not null default 'subscribed'
    check (status in ('subscribed', 'unsubscribed', 'bounced', 'complained')),
  -- Token imposible de adivinar para el enlace de baja /unsubscribe/<token>.
  unsubscribe_token uuid not null default gen_random_uuid() unique,
  -- De dónde salió el contacto (formulario, import, api, etc.).
  source text,
  metadata jsonb not null default '{}'::jsonb,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index email_contacts_status_idx
  on public.email_contacts (status, created_at desc);

-- =====================================================================
-- 2. Listas (segmentación) y su relación con contactos
-- =====================================================================
create table public.email_lists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.email_list_contacts (
  list_id uuid not null references public.email_lists(id) on delete cascade,
  contact_id uuid not null references public.email_contacts(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (list_id, contact_id)
);

create index email_list_contacts_contact_idx
  on public.email_list_contacts (contact_id);

-- =====================================================================
-- 3. Campañas
-- =====================================================================
create table public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  -- Nombre interno (no se envía). El asunto sí.
  name text not null,
  subject text not null,
  from_name text not null default 'Geraldino',
  -- Dirección verificada en SES (ej. hola@geraldino.do).
  from_email text not null,
  reply_to text,
  -- Cuerpo HTML de la campaña. {{unsubscribe_url}} se reemplaza por destinatario.
  html text not null,
  -- Versión texto plano opcional (buena práctica anti-spam).
  text_body text,
  -- Lista objetivo. NULL = todos los contactos 'subscribed'.
  list_id uuid references public.email_lists(id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft', 'queued', 'sending', 'sent', 'failed')),
  -- Instantánea del total de destinatarios al momento de encolar.
  total_recipients integer not null default 0,
  scheduled_at timestamptz,
  queued_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index email_campaigns_status_idx
  on public.email_campaigns (status, created_at desc);

-- =====================================================================
-- 4. Envíos: una fila por (campaña, contacto). Hace de cola y de estado.
-- =====================================================================
create table public.email_sends (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.email_campaigns(id) on delete cascade,
  contact_id uuid references public.email_contacts(id) on delete set null,
  -- Instantánea del email (por si el contacto se borra después).
  email text not null,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed', 'bounced', 'complained')),
  -- ID que devuelve SES al aceptar el mensaje: clave para casar los eventos
  -- del webhook con esta fila.
  ses_message_id text unique,
  error text,
  -- Métricas por destinatario (primer evento + conteo total).
  delivered_at timestamptz,
  opened_at timestamptz,
  open_count integer not null default 0,
  clicked_at timestamptz,
  click_count integer not null default 0,
  -- Se marca cuando el destinatario se da de baja desde ESTA campaña.
  unsubscribed_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  -- Un contacto no se encola dos veces en la misma campaña.
  unique (campaign_id, contact_id)
);

-- Para que el worker tome rápido los pendientes de una campaña.
create index email_sends_queue_idx
  on public.email_sends (campaign_id, status);
-- Para casar eventos del webhook por message id.
create index email_sends_message_idx
  on public.email_sends (ses_message_id);

-- =====================================================================
-- 5. Eventos crudos de SES (vía SNS). Bitácora para auditoría/depuración.
-- =====================================================================
create table public.email_events (
  id bigint generated always as identity primary key,
  send_id uuid references public.email_sends(id) on delete cascade,
  ses_message_id text,
  -- Send / Delivery / Open / Click / Bounce / Complaint / Reject / DeliveryDelay
  event_type text not null,
  -- Para 'Click': la URL pulsada.
  link text,
  user_agent text,
  ip text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index email_events_send_idx
  on public.email_events (send_id, created_at desc);
create index email_events_message_idx
  on public.email_events (ses_message_id);

-- =====================================================================
-- Triggers updated_at (reutiliza public.set_updated_at()).
-- =====================================================================
create trigger trg_email_contacts_updated_at
  before update on public.email_contacts
  for each row execute function public.set_updated_at();

create trigger trg_email_lists_updated_at
  before update on public.email_lists
  for each row execute function public.set_updated_at();

create trigger trg_email_campaigns_updated_at
  before update on public.email_campaigns
  for each row execute function public.set_updated_at();

-- =====================================================================
-- RLS: admin autenticado con acceso total; público (anon) solo alta de contacto.
-- El resto del acceso público (baja por token, webhook) pasa por service_role.
-- =====================================================================
alter table public.email_contacts enable row level security;
alter table public.email_lists enable row level security;
alter table public.email_list_contacts enable row level security;
alter table public.email_campaigns enable row level security;
alter table public.email_sends enable row level security;
alter table public.email_events enable row level security;

-- Alta pública de suscriptor (formulario del sitio). Igual que anon_insert_lead.
create policy "anon_insert_contact" on public.email_contacts
  for insert to anon with check (true);

create policy "admin_full_email_contacts" on public.email_contacts
  for all to authenticated using (true) with check (true);
create policy "admin_full_email_lists" on public.email_lists
  for all to authenticated using (true) with check (true);
create policy "admin_full_email_list_contacts" on public.email_list_contacts
  for all to authenticated using (true) with check (true);
create policy "admin_full_email_campaigns" on public.email_campaigns
  for all to authenticated using (true) with check (true);
create policy "admin_full_email_sends" on public.email_sends
  for all to authenticated using (true) with check (true);
create policy "admin_full_email_events" on public.email_events
  for all to authenticated using (true) with check (true);

-- =====================================================================
-- Grants explícitos (defensivo, igual que el resto del esquema).
-- =====================================================================
grant usage on schema public to anon, authenticated, service_role;

grant insert on public.email_contacts to anon;

grant all on
  public.email_contacts, public.email_lists, public.email_list_contacts,
  public.email_campaigns, public.email_sends, public.email_events
  to authenticated, service_role;
