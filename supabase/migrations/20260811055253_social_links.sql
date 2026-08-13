create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text not null default '',
  order_index integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

-- Filas placeholder ocultas (visible = false) para que el footer tenga
-- entradas listas en /admin/contenido: el dueño solo pega la URL real y
-- activa "visible" cuando quiera publicarlas.
insert into public.social_links (platform, url, order_index, visible) values
  ('instagram', '', 1, false),
  ('whatsapp', '', 2, false),
  ('email', '', 3, false);
