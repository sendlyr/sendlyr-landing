create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),
  name text not null,
  email text not null,
  company text not null,
  product_url text,
  message text,
  source text,
  user_agent text,
  ip text
);

alter table public.leads enable row level security;

create index if not exists leads_submitted_at_idx on public.leads (submitted_at desc);
create index if not exists leads_email_idx on public.leads (email);
