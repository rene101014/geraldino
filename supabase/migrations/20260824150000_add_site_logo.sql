alter table public.site_content
  add column logo_path text;

update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
where id = 'site';
