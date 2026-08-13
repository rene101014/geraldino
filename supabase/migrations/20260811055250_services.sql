create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  icon text,
  is_addon boolean not null default false,
  order_index integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.services (slug, title, description, is_addon, order_index) values
  ('creacion-de-reels', 'Creación de Reels', 'Piezas verticales pensadas para retener y convertir en redes sociales.', false, 1),
  ('creacion-de-anuncios', 'Creación de anuncios', 'Anuncios de video y foto listos para pauta en Meta, TikTok y YouTube.', false, 2),
  ('campanas-publicitarias', 'Campañas publicitarias', 'Campañas completas: concepto, producción y set de piezas para cada plataforma.', false, 3),
  ('fotografia-de-productos', 'Fotografía de productos', 'Fotografía de producto en máxima calidad para catálogo, e-commerce y pauta.', false, 4),
  ('fotografia-de-vehiculos', 'Fotografía de vehículos', 'Sesiones de vehículos para concesionarios y marcas automotrices.', false, 5),
  ('fotografia-gastronomica', 'Fotografía gastronómica', 'Fotografía de gastronomía para menús, redes y campañas de restaurantes.', false, 6),
  ('fotografia-corporativa', 'Fotografía corporativa', 'Retratos y fotografía corporativa para equipos, marcas y perfiles ejecutivos.', false, 7),
  ('podcast', 'Podcast', 'Producción audiovisual de podcast, de la grabación al corte final.', false, 8),
  ('asesoria-creativa', 'Asesoría creativa', 'Dirección creativa del proyecto completo. Se suma a cualquier otro servicio.', true, 9);
