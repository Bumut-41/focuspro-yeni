-- Psikolog paylaşımı: bağlantı, oturum paylaşımı, davet kodu
-- Supabase SQL Editor'da bir kez çalıştırın.

alter table public.profiles
  add column if not exists share_code text;

create unique index if not exists profiles_share_code_uidx
  on public.profiles (share_code)
  where share_code is not null;

create table if not exists public.psychologist_client_links (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  psychologist_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (client_id, psychologist_id)
);

create index if not exists psychologist_client_links_psych_idx
  on public.psychologist_client_links (psychologist_id, created_at desc);

create table if not exists public.session_shares (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.test_sessions (id) on delete cascade,
  psychologist_id uuid not null references public.profiles (id) on delete cascade,
  shared_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (session_id, psychologist_id)
);

create index if not exists session_shares_psych_idx
  on public.session_shares (psychologist_id, created_at desc);

create index if not exists session_shares_session_idx
  on public.session_shares (session_id);

-- Yardımcılar
create or replace function public.is_psychologist()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'psychologist'
  );
$$;

create or replace function public._gen_share_code()
returns text
language sql
volatile
as $$
  select upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

create or replace function public._resolve_psychologist_id(p_email text, p_code text)
returns uuid
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  v_id uuid;
  v_email text := nullif(trim(lower(p_email)), '');
  v_code text := nullif(upper(trim(p_code)), '');
begin
  if v_email is not null then
    select p.id into v_id
    from public.profiles p
    inner join auth.users u on u.id = p.id
    where p.role = 'psychologist'
      and lower(u.email) = v_email
    limit 1;
    if v_id is not null then
      return v_id;
    end if;
  end if;

  if v_code is not null then
    select p.id into v_id
    from public.profiles p
    where p.role = 'psychologist'
      and p.share_code = v_code
    limit 1;
    if v_id is not null then
      return v_id;
    end if;
  end if;

  return null;
end;
$$;

-- Psikolog: paylaşım kodu oluştur / getir
create or replace function public.ensure_psychologist_share_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_code text;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if not public.is_psychologist() then
    raise exception 'not_psychologist';
  end if;

  select share_code into v_code from public.profiles where id = v_uid;
  if v_code is not null then
    return v_code;
  end if;

  loop
    v_code := public._gen_share_code();
    begin
      update public.profiles set share_code = v_code where id = v_uid;
      exit;
    exception when unique_violation then
      null;
    end;
  end loop;

  return v_code;
end;
$$;

-- Bireysel: psikolog bağlantısı (e-posta veya kod)
create or replace function public.link_psychologist(
  p_email text default null,
  p_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
  v_psych uuid;
  v_name text;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if public.is_psychologist() then
    raise exception 'psychologist_cannot_link';
  end if;

  v_psych := public._resolve_psychologist_id(p_email, p_code);
  if v_psych is null then
    raise exception 'psychologist_not_found';
  end if;
  if v_psych = v_uid then
    raise exception 'cannot_link_self';
  end if;

  insert into public.psychologist_client_links (client_id, psychologist_id)
  values (v_uid, v_psych)
  on conflict (client_id, psychologist_id) do nothing;

  select full_name into v_name from public.profiles where id = v_psych;

  return jsonb_build_object(
    'psychologist_id', v_psych,
    'full_name', v_name
  );
end;
$$;

create or replace function public.unlink_psychologist(p_psychologist_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  delete from public.psychologist_client_links
  where client_id = v_uid and psychologist_id = p_psychologist_id;
end;
$$;

create or replace function public.get_my_psychologist_links()
returns table (
  psychologist_id uuid,
  full_name text,
  email text,
  share_code text,
  linked_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  return query
  select
    p.id,
    p.full_name,
    u.email::text,
    p.share_code,
    l.created_at
  from public.psychologist_client_links l
  inner join public.profiles p on p.id = l.psychologist_id
  inner join auth.users u on u.id = p.id
  where l.client_id = v_uid
  order by l.created_at desc;
end;
$$;

-- Test sonucunu psikologla paylaş
create or replace function public.share_test_session(
  p_session_id uuid,
  p_psychologist_id uuid default null,
  p_email text default null,
  p_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_psych uuid := p_psychologist_id;
  v_name text;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1 from public.test_sessions
    where id = p_session_id and owner_id = v_uid
  ) then
    raise exception 'session_not_found';
  end if;

  if v_psych is null then
    v_psych := public._resolve_psychologist_id(p_email, p_code);
  end if;

  if v_psych is null then
    raise exception 'psychologist_not_found';
  end if;

  if not exists (
    select 1 from public.profiles where id = v_psych and role = 'psychologist'
  ) then
    raise exception 'not_a_psychologist';
  end if;

  insert into public.psychologist_client_links (client_id, psychologist_id)
  values (v_uid, v_psych)
  on conflict (client_id, psychologist_id) do nothing;

  insert into public.session_shares (session_id, psychologist_id, shared_by)
  values (p_session_id, v_psych, v_uid)
  on conflict (session_id, psychologist_id) do nothing;

  select full_name into v_name from public.profiles where id = v_psych;

  return jsonb_build_object(
    'psychologist_id', v_psych,
    'full_name', v_name,
    'session_id', p_session_id
  );
end;
$$;

create or replace function public.get_my_session_shares(p_session_id uuid default null)
returns table (
  session_id uuid,
  psychologist_id uuid,
  psychologist_name text,
  shared_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  return query
  select
    ss.session_id,
    ss.psychologist_id,
    p.full_name,
    ss.created_at
  from public.session_shares ss
  inner join public.profiles p on p.id = ss.psychologist_id
  inner join public.test_sessions ts on ts.id = ss.session_id
  where ss.shared_by = v_uid
    and ts.owner_id = v_uid
    and (p_session_id is null or ss.session_id = p_session_id)
  order by ss.created_at desc;
end;
$$;

-- RLS
alter table public.psychologist_client_links enable row level security;
alter table public.session_shares enable row level security;

drop policy if exists psych_links_client_select on public.psychologist_client_links;
create policy psych_links_client_select on public.psychologist_client_links
  for select using (
    auth.uid() = client_id
    or auth.uid() = psychologist_id
    or public.is_admin()
  );

drop policy if exists session_shares_select on public.session_shares;
create policy session_shares_select on public.session_shares
  for select using (
    auth.uid() = shared_by
    or auth.uid() = psychologist_id
    or public.is_admin()
  );

-- Test oturumları: paylaşılan sonuçlar psikologa görünür
drop policy if exists sessions_select on public.test_sessions;
create policy sessions_select on public.test_sessions
  for select using (
    auth.uid() = owner_id
    or public.is_admin()
    or exists (
      select 1 from public.session_shares ss
      where ss.session_id = test_sessions.id
        and ss.psychologist_id = auth.uid()
    )
  );

-- Danışan adı için sınırlı profil okuma
drop policy if exists profiles_select_shared_clients on public.profiles;
create policy profiles_select_shared_clients on public.profiles
  for select using (
    exists (
      select 1 from public.session_shares ss
      inner join public.test_sessions ts on ts.id = ss.session_id
      where ss.psychologist_id = auth.uid()
        and ts.owner_id = profiles.id
    )
    or exists (
      select 1 from public.psychologist_client_links l
      where l.psychologist_id = auth.uid()
        and l.client_id = profiles.id
    )
  );

-- Paylaşılan PDF okuma (katılımcı raporu)
drop policy if exists reports_psychologist_shared on storage.objects;
create policy reports_psychologist_shared on storage.objects
  for select to authenticated
  using (
    bucket_id = 'reports'
    and exists (
      select 1 from public.test_sessions ts
      inner join public.session_shares ss on ss.session_id = ts.id
      where ss.psychologist_id = auth.uid()
        and ts.pdf_path = name
    )
  );

grant execute on function public.ensure_psychologist_share_code() to authenticated;
grant execute on function public.link_psychologist(text, text) to authenticated;
grant execute on function public.unlink_psychologist(uuid) to authenticated;
grant execute on function public.get_my_psychologist_links() to authenticated;
grant execute on function public.share_test_session(uuid, uuid, text, text) to authenticated;
grant execute on function public.get_my_session_shares(uuid) to authenticated;
