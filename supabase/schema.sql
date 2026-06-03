-- FocusPro-yeni — Üyelik, kredi, test oturumları
-- Supabase SQL Editor'da bir kez çalıştırın.

create type public.user_role as enum ('admin', 'psychologist', 'individual');

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'individual',
  full_name text not null,
  birth_date date,
  test_credits integer not null default 0 check (test_credits >= 0),
  profile_completed boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  delta integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.test_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  participant_name text not null,
  participant_age integer,
  participant_birth_date date,
  participant_gender text,
  profile_key text not null,
  logs jsonb not null,
  metrics jsonb not null,
  target jsonb not null,
  pdf_path text,
  admin_pdf_path text,
  created_at timestamptz not null default now()
);

create index if not exists test_sessions_owner_idx on public.test_sessions (owner_id, created_at desc);

-- Admin basış çizelgesi (ayrı tablo — kullanıcılar SELECT yapamaz; bkz. press-timeline.sql)
create table if not exists public.test_press_timelines (
  session_id uuid primary key references public.test_sessions (id) on delete cascade,
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- Yardımcı: admin mi?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Yeni üye kaydı → profil satırı (18+ uygulama tarafında da kontrol edilir)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
  v_name text;
  v_birth date;
begin
  v_role := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'individual');
  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    split_part(coalesce(new.email, ''), '@', 1),
    'Kullanıcı'
  );
  v_birth := nullif(new.raw_user_meta_data->>'birth_date', '')::date;

  insert into public.profiles (id, role, full_name, birth_date, test_credits, profile_completed)
  values (new.id, v_role, v_name, v_birth, 999999, v_birth is not null)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Test bitince oturum kaydet (şimdilik kredi düşülmez)
create or replace function public.complete_test_session(
  p_participant_name text,
  p_participant_age integer,
  p_participant_birth_date date,
  p_participant_gender text,
  p_profile_key text,
  p_logs jsonb,
  p_metrics jsonb,
  p_target jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (select 1 from public.profiles where id = v_uid) then
    raise exception 'profile_not_found';
  end if;

  -- Şimdilik sınırsız ücretsiz: kredi düşülmez (ücretli dönemde açılacak).

  insert into public.test_sessions (
    owner_id,
    participant_name,
    participant_age,
    participant_birth_date,
    participant_gender,
    profile_key,
    logs,
    metrics,
    target
  )
  values (
    v_uid,
    p_participant_name,
    p_participant_age,
    p_participant_birth_date,
    p_participant_gender,
    p_profile_key,
    p_logs,
    p_metrics,
    p_target
  )
  returning id into v_id;

  return v_id;
end;
$$;

-- Kullanıcı test paketi satın alır (şimdilik demo — ödeme entegrasyonu sonra)
create or replace function public.purchase_test_credits(p_amount integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_new integer;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if p_amount < 1 or p_amount > 500 then
    raise exception 'invalid_amount';
  end if;

  update public.profiles
  set test_credits = test_credits + p_amount
  where id = v_uid
  returning test_credits into v_new;

  insert into public.credit_transactions (user_id, delta, reason)
  values (v_uid, p_amount, 'purchase_demo');

  return v_new;
end;
$$;

-- Admin: kullanıcıya kredi ekler
create or replace function public.admin_add_credits(p_user_id uuid, p_amount integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new integer;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  if p_amount < 1 then
    raise exception 'invalid_amount';
  end if;

  update public.profiles
  set test_credits = test_credits + p_amount
  where id = p_user_id
  returning test_credits into v_new;

  insert into public.credit_transactions (user_id, delta, reason)
  values (p_user_id, p_amount, 'admin_grant');

  return v_new;
end;
$$;

-- İlk admin: Supabase Auth'ta kullanıcı oluşturduktan sonra SQL ile:
-- update public.profiles set role = 'admin', test_credits = 100 where id = 'UUID-BURAYA';

alter table public.profiles enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.test_sessions enable row level security;

create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

create policy credit_tx_select on public.credit_transactions
  for select using (auth.uid() = user_id or public.is_admin());

create policy sessions_select on public.test_sessions
  for select using (auth.uid() = owner_id or public.is_admin());

create policy sessions_insert on public.test_sessions
  for insert with check (auth.uid() = owner_id);

-- Storage (PDF) — isteğe bağlı
insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;

create policy reports_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy reports_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy reports_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy reports_owner_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
    and name !~ '.+-admin\.pdf$'
  );

create policy reports_admin_read on storage.objects
  for select using (bucket_id = 'reports' and public.is_admin());
