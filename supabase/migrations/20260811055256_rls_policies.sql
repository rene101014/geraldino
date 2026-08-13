alter table public.site_theme enable row level security;
alter table public.site_content enable row level security;
alter table public.services enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.clients enable row level security;
alter table public.social_links enable row level security;
alter table public.contact_submissions enable row level security;

-- site_theme / site_content: lectura pública, escritura solo admin autenticado.
create policy "public_select_theme" on public.site_theme
  for select to anon, authenticated using (true);
create policy "admin_update_theme" on public.site_theme
  for update to authenticated using (true) with check (true);

create policy "public_select_content" on public.site_content
  for select to anon, authenticated using (true);
create policy "admin_update_content" on public.site_content
  for update to authenticated using (true) with check (true);

-- services
create policy "public_select_published_services" on public.services
  for select to anon using (published = true);
create policy "admin_full_services" on public.services
  for all to authenticated using (true) with check (true);

-- portfolio_items
create policy "public_select_published_portfolio" on public.portfolio_items
  for select to anon using (published = true);
create policy "admin_full_portfolio" on public.portfolio_items
  for all to authenticated using (true) with check (true);

-- clients
create policy "public_select_published_clients" on public.clients
  for select to anon using (published = true);
create policy "admin_full_clients" on public.clients
  for all to authenticated using (true) with check (true);

-- social_links
create policy "public_select_visible_social" on public.social_links
  for select to anon using (visible = true);
create policy "admin_full_social" on public.social_links
  for all to authenticated using (true) with check (true);

-- contact_submissions: anon SOLO puede insertar, nunca leer.
create policy "anon_insert_lead" on public.contact_submissions
  for insert to anon with check (true);
create policy "admin_full_leads" on public.contact_submissions
  for all to authenticated using (true) with check (true);

-- Grants explícitos (defensivo, no depender de privilegios implícitos del proyecto).
grant usage on schema public to anon, authenticated;
grant select on public.site_theme, public.site_content,
  public.services, public.portfolio_items, public.clients, public.social_links
  to anon;
grant insert on public.contact_submissions to anon;
grant all on public.site_theme, public.site_content, public.services,
  public.portfolio_items, public.clients, public.social_links,
  public.contact_submissions to authenticated;
