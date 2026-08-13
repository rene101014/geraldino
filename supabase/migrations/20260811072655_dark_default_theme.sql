-- Cambia el default de marca a negro dominante (referencia: casas
-- productoras como btanc.do) en vez de blanco dominante. Los valores se
-- calcularon con lib/theme/color.ts#deriveTheme a partir de fondo casi
-- negro + texto casi blanco + el mismo naranja de acento, así que son
-- exactamente lo que produciría el admin si eligiera esos 3 colores.
alter table public.site_theme
  alter column background set default '0.09 0.004 75',
  alter column foreground set default '0.97 0.003 75',
  alter column secondary set default '0.17 0 0',
  alter column secondary_foreground set default '0.97 0.003 75',
  alter column accent set default '0.22 0.0342 41',
  alter column accent_foreground set default '0.97 0.003 75',
  alter column muted set default '0.17 0 0',
  alter column muted_foreground set default '0.574 0 0',
  alter column border set default '0.1956 0 0',
  alter column input set default '0.1956 0 0',
  alter column primary_foreground set default '0.145 0 0',
  alter column radius set default 0.5;

update public.site_theme
set background = '0.09 0.004 75',
    foreground = '0.97 0.003 75',
    secondary = '0.17 0 0',
    secondary_foreground = '0.97 0.003 75',
    accent = '0.22 0.0342 41',
    accent_foreground = '0.97 0.003 75',
    muted = '0.17 0 0',
    muted_foreground = '0.574 0 0',
    border = '0.1956 0 0',
    input = '0.1956 0 0',
    primary_foreground = '0.145 0 0',
    radius = 0.5
where id = 1;
