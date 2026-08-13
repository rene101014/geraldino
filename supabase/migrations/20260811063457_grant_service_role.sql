-- service_role tiene bypassrls (ignora las políticas RLS), pero eso no
-- sustituye los privilegios SQL estándar de tabla: sin GRANT explícito,
-- las consultas fallan con "permission denied" igual que cualquier otro rol.
-- Se le da acceso completo, como es estándar para el rol de confianza del
-- servidor (scripts de administración, tareas server-side futuras).
grant usage on schema public to service_role;
grant all on public.site_theme, public.site_content, public.services,
  public.portfolio_items, public.clients, public.social_links,
  public.contact_submissions
  to service_role;
