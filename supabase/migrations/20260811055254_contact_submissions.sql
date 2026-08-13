create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  service_interest text,
  budget_range text,
  message text not null,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'closed', 'spam')),
  email_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index contact_submissions_status_idx
  on public.contact_submissions (status, created_at desc);
