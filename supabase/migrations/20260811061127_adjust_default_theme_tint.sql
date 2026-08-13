-- El blanco y negro puros (chroma 0, L 1/0.145) nunca aparecen en materiales
-- reales; se tiñen levísimamente hacia el naranja de marca para que el
-- fondo/texto por defecto se sientan cálidos y no clínicos.
alter table public.site_theme
  alter column background set default '0.99 0.003 75',
  alter column foreground set default '0.16 0.004 75';

update public.site_theme
set background = '0.99 0.003 75',
    foreground = '0.16 0.004 75'
where id = 1
  and background = '1 0 0'
  and foreground = '0.145 0 0';
