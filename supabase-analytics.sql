create table if not exists public.analytics_events (
  event_id text primary key,
  event_name text not null,
  session_id text not null,
  page_id text not null,
  path text not null,
  referrer_host text,
  properties jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  constraint analytics_event_name_check check (event_name in ('page_view', 'navigation_click', 'workflow_open', 'case_study_open', 'book_sprint_click', 'cohort_toggle', 'proof_tab_change', 'decision_trace_change')),
  constraint analytics_event_path_check check (length(path) between 1 and 240 and left(path, 1) = '/'),
  constraint analytics_event_properties_check check (jsonb_typeof(properties) = 'object')
);

alter table public.analytics_events drop constraint if exists analytics_event_name_check;
alter table public.analytics_events add constraint analytics_event_name_check check (event_name in ('page_view', 'navigation_click', 'workflow_open', 'case_study_open', 'book_sprint_click', 'cohort_toggle', 'proof_tab_change', 'decision_trace_change'));

create table if not exists public.analytics_bookings (
  calendly_invitee_id text primary key,
  calendly_event_id text not null,
  attribution_id text,
  scheduled_at timestamptz,
  status text,
  qualified boolean not null default false,
  qualified_at timestamptz,
  qualified_by text,
  qualification_reason text,
  synced_at timestamptz not null default now()
);

create table if not exists public.analytics_daily (
  metric_date date not null,
  event_name text not null,
  path text not null,
  event_count integer not null,
  unique_sessions integer not null,
  created_at timestamptz not null default now(),
  unique (metric_date, event_name, path)
);

create table if not exists public.analytics_sync_state (
  source text primary key,
  last_success_at timestamptz,
  booking_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;
alter table public.analytics_bookings enable row level security;
alter table public.analytics_daily enable row level security;
alter table public.analytics_sync_state enable row level security;

revoke all on public.analytics_events from anon, authenticated;
revoke all on public.analytics_bookings from anon, authenticated;
revoke all on public.analytics_daily from anon, authenticated;
revoke all on public.analytics_sync_state from anon, authenticated;
grant all on public.analytics_events to service_role;
grant all on public.analytics_bookings to service_role;
grant all on public.analytics_daily to service_role;
grant all on public.analytics_sync_state to service_role;

create index if not exists analytics_events_received_idx on public.analytics_events (received_at desc);
create index if not exists analytics_events_name_path_idx on public.analytics_events (event_name, path);
create index if not exists analytics_bookings_attribution_idx on public.analytics_bookings (attribution_id);
create index if not exists analytics_daily_date_idx on public.analytics_daily (metric_date desc);
