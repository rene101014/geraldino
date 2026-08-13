create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  description text,
  media_type text not null check (media_type in ('image', 'video')),
  -- Abstrae el origen del archivo reproducible. Hoy todo vive en Supabase
  -- Storage; 'cloudflare_stream' queda listo para cuando el video se migre
  -- a un servicio especializado sin tocar el resto del sitio.
  provider text not null default 'supabase'
    check (provider in ('supabase', 'cloudflare_stream', 'external_url')),
  storage_path text,
  external_id text,
  external_url text,
  thumbnail_path text,
  category text,
  service_id uuid references public.services(id) on delete set null,
  tags text[] not null default '{}',
  width integer,
  height integer,
  duration_seconds integer,
  is_featured boolean not null default false,
  is_placeholder boolean not null default false,
  order_index integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index portfolio_items_published_order_idx
  on public.portfolio_items (published, order_index);
create index portfolio_items_category_idx
  on public.portfolio_items (category);
