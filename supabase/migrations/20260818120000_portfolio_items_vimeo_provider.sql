alter table public.portfolio_items
  drop constraint portfolio_items_provider_check,
  add constraint portfolio_items_provider_check
    check (provider in ('supabase', 'cloudflare_stream', 'external_url', 'vimeo'));
