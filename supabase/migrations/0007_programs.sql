-- ============================================================================
-- 0007 — Programs / cohorts
--
-- Programs are dated, cohort-based offerings (live/online programs D-MATHS
-- hosts) — distinct from the self-paced course catalogue. Visitors can reserve
-- a spot; D-MATHS manages programs and reads registrations from the admin
-- portal.
-- ============================================================================

create table public.programs (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  title               text not null,
  subtitle            text,
  description         text,
  cover_url           text,
  format              text not null default 'Online live',   -- e.g. Online live, Hybrid
  location            text,                                   -- e.g. Zoom, Lagos
  price               numeric(12,2) not null default 0,
  currency            text not null default 'NGN',
  discount_price      numeric(12,2),
  capacity            integer,                                -- null = unlimited
  start_date          date,
  end_date            date,
  enrollment_deadline date,
  status              text not null default 'draft'
                        check (status in ('draft','published')),
  is_featured         boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index idx_programs_status on public.programs(status);
create index idx_programs_start on public.programs(start_date);

create table public.program_registrations (
  id           uuid primary key default gen_random_uuid(),
  program_id   uuid not null references public.programs(id) on delete cascade,
  user_id      uuid references public.profiles(id) on delete set null,
  name         text not null,
  email        citext not null,
  note         text,
  created_at   timestamptz not null default now(),
  unique (program_id, email)
);

create index idx_program_registrations_program
  on public.program_registrations(program_id);

-- updated_at maintenance for programs (reuses the shared trigger function).
create trigger set_updated_at before update on public.programs
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
alter table public.programs enable row level security;
alter table public.program_registrations enable row level security;

-- Published programs are public; admins see and manage everything.
create policy "Published programs are public"
  on public.programs for select
  using (status = 'published' or public.is_admin());
create policy "Admins manage programs" on public.programs for all
  using (public.is_admin()) with check (public.is_admin());

-- Anyone may reserve a spot; only admins may read the registration list.
create policy "Anyone can register for a program"
  on public.program_registrations for insert
  with check (true);
create policy "Admins read registrations"
  on public.program_registrations for select
  using (public.is_admin());
create policy "Admins manage registrations"
  on public.program_registrations for delete
  using (public.is_admin());
