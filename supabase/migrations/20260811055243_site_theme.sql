-- Paleta de colores del sitio, editable desde /admin/tema.
-- Cada columna guarda el triplete OKLCH (sin el wrapper "oklch(...)"), el mismo
-- formato que usa Tailwind v4 / shadcn en app/globals.css, para inyectarlo
-- directamente como variables CSS sin conversión de espacio de color.
create table public.site_theme (
  id smallint primary key default 1,
  background text not null default '1 0 0',
  foreground text not null default '0.145 0 0',
  "primary" text not null default '0.68 0.19 41',
  primary_foreground text not null default '1 0 0',
  secondary text not null default '0.97 0 0',
  secondary_foreground text not null default '0.205 0 0',
  accent text not null default '0.97 0 0',
  accent_foreground text not null default '0.205 0 0',
  muted text not null default '0.97 0 0',
  muted_foreground text not null default '0.556 0 0',
  border text not null default '0.922 0 0',
  input text not null default '0.922 0 0',
  ring text not null default '0.68 0.19 41',
  radius numeric(3, 2) not null default 0.625,
  updated_at timestamptz not null default now(),
  constraint site_theme_singleton check (id = 1)
);

insert into public.site_theme (id) values (1);
