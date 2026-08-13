insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('portfolio', 'portfolio', true, 314572800,
   array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm']),
  ('clients', 'clients', true, 5242880,
   array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('site', 'site', true, 10485760,
   array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "public_read_marketing_buckets" on storage.objects
  for select to public
  using (bucket_id in ('portfolio', 'clients', 'site'));

create policy "admin_insert_marketing_buckets" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('portfolio', 'clients', 'site'));

create policy "admin_update_marketing_buckets" on storage.objects
  for update to authenticated
  using (bucket_id in ('portfolio', 'clients', 'site'));

create policy "admin_delete_marketing_buckets" on storage.objects
  for delete to authenticated
  using (bucket_id in ('portfolio', 'clients', 'site'));
