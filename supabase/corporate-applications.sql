-- Kurumsal başvuru formu. Supabase SQL Editor'da bir kez çalıştırın.

create table if not exists public.corporate_applications (
  id uuid primary key default gen_random_uuid(),
  organization_name text not null,
  contact_name text not null,
  role text not null,
  phone text not null,
  email text not null,
  country_code text not null,
  city text not null,
  institution_type text not null,
  expert_count integer,
  monthly_clients integer,
  message text,
  created_at timestamptz not null default now()
);

alter table public.corporate_applications enable row level security;

drop policy if exists "public insert corporate applications" on public.corporate_applications;
create policy "public insert corporate applications"
  on public.corporate_applications
  for insert
  to anon, authenticated
  with check (true);

revoke all on table public.corporate_applications from anon, authenticated;
grant insert on table public.corporate_applications to anon, authenticated;
