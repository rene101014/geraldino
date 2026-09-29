-- Módulo de Galerías: entrega de trabajos (álbum/descarga) + selección de
-- fotos por el cliente. Las fotos viven en Google Drive; aquí solo cacheamos
-- metadatos y miniaturas. El acceso público (galería del cliente) NO lee estas
-- tablas directo: pasa por rutas de servidor que validan token + contraseña y
-- usan service_role. Mismo criterio defensivo que contact_submissions.

-- 1. Conexión Google (una sola, la cuenta del estudio). Guarda el refresh token
--    para leer Drive server-side sin que el admin vuelva a iniciar sesión.
create table public.google_tokens (
  id uuid primary key default gen_random_uuid(),
  -- Fila única: solo existe una conexión de Google para todo el sitio.
  singleton boolean not null default true unique,
  access_token text,
  refresh_token text not null,
  token_type text,
  scope text,
  expiry timestamptz,
  google_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Galerías
create table public.galleries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client_name text,
  client_email text,
  client_id uuid references public.clients(id) on delete set null,
  -- 'selection' = el cliente elige fotos; 'delivery' = ver/descargar final.
  type text not null default 'selection'
    check (type in ('selection', 'delivery')),
  -- Solo aplica a delivery: cómo se presenta el trabajo final.
  delivery_format text not null default 'download'
    check (delivery_format in ('download', 'album')),
  visibility text not null default 'private'
    check (visibility in ('public', 'private')),
  -- Hash de la contraseña (solo private). NULL = sin contraseña.
  password_hash text,
  -- Token único e imposible de adivinar para la URL pública /g/<token>.
  token text not null unique,
  -- Carpeta de Google Drive de donde salen las fotos.
  drive_folder_id text,
  drive_folder_name text,
  -- Cupo máximo de fotos que el cliente puede seleccionar. NULL = sin límite.
  selection_limit integer check (selection_limit is null or selection_limit > 0),
  allow_downloads boolean not null default false,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'submitted', 'closed')),
  -- Referencia suave (sin FK) a gallery_photos.id para la portada.
  cover_photo_id uuid,
  expires_at timestamptz,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index galleries_token_idx on public.galleries (token);
create index galleries_status_idx on public.galleries (status);

-- 3. Fotos cacheadas de Drive
create table public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  drive_file_id text not null,
  -- Nombre original del archivo: clave para el puente a Lightroom Classic.
  filename text not null,
  mime_type text,
  thumbnail_url text,
  width integer,
  height integer,
  size_bytes bigint,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  unique (gallery_id, drive_file_id)
);

create index gallery_photos_gallery_idx
  on public.gallery_photos (gallery_id, order_index);

-- 4. Envíos de selección del cliente
create table public.gallery_submissions (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries(id) on delete cascade,
  client_name text,
  client_email text,
  note text,
  selected_count integer not null default 0,
  submitted_at timestamptz not null default now()
);

create index gallery_submissions_gallery_idx
  on public.gallery_submissions (gallery_id);

-- 5. Fotos elegidas en cada envío
create table public.gallery_selection_items (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null
    references public.gallery_submissions(id) on delete cascade,
  gallery_photo_id uuid not null
    references public.gallery_photos(id) on delete cascade,
  -- Desnormalizado para exportar la lista de nombres a Lightroom sin joins.
  filename text not null,
  created_at timestamptz not null default now(),
  unique (submission_id, gallery_photo_id)
);

create index gallery_selection_items_submission_idx
  on public.gallery_selection_items (submission_id);

-- Triggers updated_at (reutiliza public.set_updated_at()).
create trigger trg_google_tokens_updated_at
  before update on public.google_tokens
  for each row execute function public.set_updated_at();

create trigger trg_galleries_updated_at
  before update on public.galleries
  for each row execute function public.set_updated_at();

-- RLS: admin autenticado con acceso total; público (anon) SIN acceso directo.
-- Todo el acceso público a galerías pasa por rutas de servidor con service_role.
alter table public.google_tokens enable row level security;
alter table public.galleries enable row level security;
alter table public.gallery_photos enable row level security;
alter table public.gallery_submissions enable row level security;
alter table public.gallery_selection_items enable row level security;

create policy "admin_full_google_tokens" on public.google_tokens
  for all to authenticated using (true) with check (true);
create policy "admin_full_galleries" on public.galleries
  for all to authenticated using (true) with check (true);
create policy "admin_full_gallery_photos" on public.gallery_photos
  for all to authenticated using (true) with check (true);
create policy "admin_full_gallery_submissions" on public.gallery_submissions
  for all to authenticated using (true) with check (true);
create policy "admin_full_gallery_selection_items" on public.gallery_selection_items
  for all to authenticated using (true) with check (true);

-- Grants explícitos (defensivo, igual que el resto del esquema).
grant usage on schema public to authenticated, service_role;
grant all on
  public.google_tokens, public.galleries, public.gallery_photos,
  public.gallery_submissions, public.gallery_selection_items
  to authenticated, service_role;
