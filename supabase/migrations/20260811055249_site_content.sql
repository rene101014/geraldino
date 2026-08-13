-- Contenido editable de Inicio (marca, bio, hero) y metadata SEO global.
-- Los defaults son el borrador inicial redactado para el lanzamiento; se
-- editan desde /admin/contenido sin tocar código.
create table public.site_content (
  id smallint primary key default 1,
  brand_name text not null default 'Geraldino',
  founder_name text not null default 'Rene Geraldino',
  hero_title text not null default 'Geraldino',
  hero_subtitle text not null default 'Casa productora audiovisual fundada por Rene Geraldino. Fotografía, video y dirección creativa para marcas que no se conforman con lo esperado.',
  hero_cta_label text not null default 'Ver portafolio',
  bio_heading text not null default 'Sobre Geraldino',
  bio_body text not null default $$Rene Geraldino construyó su nombre frente y detrás de cámara en República Dominicana, hasta convertirlo en una marca que la gente reconoce antes de ver el crédito. Geraldino nace como la extensión natural de ese trabajo: una casa productora donde cada proyecto pasa por la misma mirada que construyó esa reputación.

No es un estudio que ejecuta briefs ajenos. Es dirección creativa de punta a punta, del guion a la luz, del producto a la historia que lo vende. Reels, campañas, fotografía de producto, de vehículos, gastronómica, corporativa y podcast salen del mismo lugar: una idea clara antes de encender la cámara.

Marcas, restaurantes, concesionarios y creadores que necesitan contenido con carácter, no plantillas, trabajan con Geraldino porque el nombre ya respondió por la calidad antes de que empezara el proyecto.$$,
  bio_image_path text,
  meta_title text not null default 'Geraldino — Casa Productora Audiovisual',
  meta_description text not null default 'Geraldino es la casa productora audiovisual de Rene Geraldino en República Dominicana: reels, campañas publicitarias, fotografía de producto, vehículos, gastronomía, fotografía corporativa y podcast.',
  og_image_path text,
  contact_email text,
  contact_phone text,
  contact_whatsapp text,
  address text,
  updated_at timestamptz not null default now(),
  constraint site_content_singleton check (id = 1)
);

insert into public.site_content (id) values (1);
