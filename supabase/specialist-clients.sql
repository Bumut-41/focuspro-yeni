-- Uzmanın kaydettiği danışanlar. Supabase SQL Editor'da bir kez çalıştırın.

create table if not exists public.specialist_clients (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid not null references public.profiles (id) on delete cascade,
  full_name text not null,
  birth_date date not null,
  gender text not null check (gender in ('Kadın', 'Erkek')),
  email text,
  guardian_consent boolean not null default false,
  created_at timestamptz not null default now(),
  constraint specialist_clients_email_lower check (email = lower(trim(email)))
  -- Aynı e-posta birden fazla danışanda kullanılabilir (aile / ortak kutu)
);

create index if not exists specialist_clients_owner_idx
  on public.specialist_clients (specialist_id, created_at desc);

alter table public.specialist_clients enable row level security;

drop policy if exists specialist_clients_own on public.specialist_clients;
create policy specialist_clients_own on public.specialist_clients
  for all
  to authenticated
  using (auth.uid() = specialist_id)
  with check (auth.uid() = specialist_id and public.is_psychologist());

grant select, insert, update, delete on table public.specialist_clients to authenticated;
