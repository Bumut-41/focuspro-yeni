-- Bireysel uzman başvurusu. Supabase SQL Editor'da bir kez çalıştırın.

create table if not exists public.specialist_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  profession text not null,
  phone text not null,
  email text not null,
  country_code text not null,
  city text not null,
  workplace text,
  message text,
  created_at timestamptz not null default now()
);

alter table public.specialist_applications enable row level security;

drop policy if exists "public insert specialist applications" on public.specialist_applications;
create policy "public insert specialist applications"
  on public.specialist_applications
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admin select specialist applications" on public.specialist_applications;
create policy "admin select specialist applications"
  on public.specialist_applications
  for select
  to authenticated
  using (public.is_admin());

revoke all on table public.specialist_applications from anon, authenticated;
grant insert on table public.specialist_applications to anon, authenticated;
grant select on table public.specialist_applications to authenticated;
