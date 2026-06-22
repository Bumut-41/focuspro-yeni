-- Psikolog davet akışı: kredi → e-posta daveti → katılımcı kayıt → test → sonuç psikologda
-- Supabase SQL Editor'da bir kez çalıştırın (admin-only-session-read.sql sonrası).

create type public.invite_status as enum ('pending', 'accepted', 'completed', 'expired', 'cancelled');

create table if not exists public.test_invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  psychologist_id uuid not null references public.profiles (id) on delete cascade,
  recipient_email text not null,
  status public.invite_status not null default 'pending',
  taker_id uuid references public.profiles (id) on delete set null,
  session_id uuid references public.test_sessions (id) on delete set null,
  expires_at timestamptz not null default (now() + interval '3 days'),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  completed_at timestamptz,
  constraint test_invites_email_lower check (recipient_email = lower(trim(recipient_email)))
);

create index if not exists test_invites_psychologist_idx on public.test_invites (psychologist_id, created_at desc);
create index if not exists test_invites_token_idx on public.test_invites (token);

alter table public.test_sessions
  add column if not exists taker_id uuid references public.profiles (id) on delete set null,
  add column if not exists invite_id uuid references public.test_invites (id) on delete set null;

create index if not exists test_sessions_taker_idx on public.test_sessions (taker_id);

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

-- Oturum okuma: admin veya oturum sahibi (psikolog); katılımcı (taker) okuyamaz
drop policy if exists sessions_select on public.test_sessions;
create policy sessions_select on public.test_sessions
  for select using (public.is_admin() or auth.uid() = owner_id);

-- PDF yükleme: oturum sahibi veya davetli katılımcı (test bitişinde)
drop policy if exists sessions_insert on public.test_sessions;
create policy sessions_insert on public.test_sessions
  for insert with check (auth.uid() = owner_id or auth.uid() = taker_id);

drop policy if exists sessions_update_owner on public.test_sessions;
create policy sessions_update_owner on public.test_sessions
  for update using (public.is_admin() or auth.uid() = owner_id or auth.uid() = taker_id)
  with check (public.is_admin() or auth.uid() = owner_id or auth.uid() = taker_id);

-- Storage: psikolog klasörüne davetli katılımcı da PDF yükleyebilir
drop policy if exists reports_owner_insert on storage.objects;
create policy reports_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'reports'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.test_sessions s
        where s.owner_id::text = (storage.foldername(name))[1]
          and s.taker_id = auth.uid()
          and s.id::text = split_part((storage.foldername(name))[2], '.', 1)
      )
      or exists (
        select 1 from public.test_sessions s
        where s.owner_id::text = (storage.foldername(name))[1]
          and s.taker_id = auth.uid()
          and (s.id::text || '-admin') = split_part((storage.foldername(name))[2], '.', 1)
      )
    )
  );

drop policy if exists reports_owner_update on storage.objects;
create policy reports_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'reports'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.test_sessions s
        where s.owner_id::text = (storage.foldername(name))[1]
          and s.taker_id = auth.uid()
      )
    )
  )
  with check (
    bucket_id = 'reports'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.test_sessions s
        where s.owner_id::text = (storage.foldername(name))[1]
          and s.taker_id = auth.uid()
      )
    )
  );

-- Basış çizelgesi: oturum sahibi psikolog da okuyabilir
drop policy if exists press_timeline_admin_select on public.test_press_timelines;
create policy press_timeline_admin_select on public.test_press_timelines
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.test_sessions s
      where s.id = session_id and s.owner_id = auth.uid()
    )
  );

-- Psikolog kendi PDF klasörünü okuyabilir (katılımcı davet akışında owner = psikolog)
drop policy if exists reports_owner_select on storage.objects;
create policy reports_owner_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

alter table public.test_invites enable row level security;

drop policy if exists invites_psychologist_select on public.test_invites;
create policy invites_psychologist_select on public.test_invites
  for select using (public.is_admin() or psychologist_id = auth.uid());

-- Davet oluştur (1 kredi düşer, 3 gün geçerli)
create or replace function public.create_test_invite(p_recipient_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := lower(trim(p_recipient_email));
  v_credits integer;
  v_token text;
  v_id uuid;
  v_expires timestamptz := now() + interval '3 days';
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if not public.is_psychologist() then
    raise exception 'forbidden';
  end if;
  if v_email !~ '^[^@]+@[^@]+\.[^@]+$' then
    raise exception 'invalid_email';
  end if;

  select test_credits into v_credits from public.profiles where id = v_uid for update;
  if v_credits is null then
    raise exception 'profile_not_found';
  end if;
  if v_credits < 1 then
    raise exception 'no_credits';
  end if;

  update public.profiles set test_credits = test_credits - 1 where id = v_uid;

  insert into public.credit_transactions (user_id, delta, reason)
  values (v_uid, -1, 'invite_created');

  v_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');

  insert into public.test_invites (token, psychologist_id, recipient_email, expires_at)
  values (v_token, v_uid, v_email, v_expires)
  returning id into v_id;

  return jsonb_build_object(
    'id', v_id,
    'token', v_token,
    'recipient_email', v_email,
    'expires_at', v_expires
  );
end;
$$;

-- Davet bilgisi (herkese açık — token ile)
create or replace function public.get_invite_by_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inv public.test_invites%rowtype;
  v_psych_name text;
begin
  select * into v_inv from public.test_invites where token = p_token;
  if not found then
    raise exception 'invite_not_found';
  end if;

  if v_inv.expires_at < now() and v_inv.status in ('pending', 'accepted') then
    update public.test_invites set status = 'expired' where id = v_inv.id;
    v_inv.status := 'expired';
  end if;

  select full_name into v_psych_name from public.profiles where id = v_inv.psychologist_id;

  return jsonb_build_object(
    'id', v_inv.id,
    'token', v_inv.token,
    'recipient_email', v_inv.recipient_email,
    'status', v_inv.status,
    'expires_at', v_inv.expires_at,
    'psychologist_name', coalesce(v_psych_name, 'Uzman'),
    'expired', v_inv.status = 'expired' or v_inv.expires_at < now(),
    'completed', v_inv.status = 'completed'
  );
end;
$$;

-- Giriş/kayıt sonrası daveti kullanıcıya bağla
create or replace function public.accept_test_invite(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_inv public.test_invites%rowtype;
  v_user_email text;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_inv from public.test_invites where token = p_token for update;
  if not found then
    raise exception 'invite_not_found';
  end if;

  if v_inv.expires_at < now() then
    update public.test_invites set status = 'expired' where id = v_inv.id;
    raise exception 'invite_expired';
  end if;

  if v_inv.status = 'completed' then
    raise exception 'invite_already_used';
  end if;

  if v_inv.status = 'cancelled' then
    raise exception 'invite_cancelled';
  end if;

  select lower(email) into v_user_email from auth.users where id = v_uid;
  if v_user_email is distinct from v_inv.recipient_email then
    raise exception 'email_mismatch';
  end if;

  if exists (select 1 from public.profiles where id = v_uid and role <> 'individual') then
    raise exception 'invite_individual_only';
  end if;

  if v_inv.taker_id is not null and v_inv.taker_id <> v_uid then
    raise exception 'invite_taken';
  end if;

  if v_inv.status = 'accepted' and v_inv.taker_id = v_uid then
    return jsonb_build_object('ok', true, 'invite_id', v_inv.id);
  end if;

  if v_inv.status not in ('pending', 'accepted') then
    raise exception 'invite_invalid_status';
  end if;

  update public.test_invites
  set status = 'accepted', taker_id = v_uid, accepted_at = coalesce(accepted_at, now())
  where id = v_inv.id;

  return jsonb_build_object('ok', true, 'invite_id', v_inv.id);
end;
$$;

-- Aktif davet (test sayfası)
create or replace function public.get_active_invite_for_user()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_inv public.test_invites%rowtype;
begin
  if v_uid is null then
    return null;
  end if;

  select * into v_inv
  from public.test_invites
  where taker_id = v_uid
    and status = 'accepted'
    and expires_at > now()
  order by accepted_at desc nulls last
  limit 1;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'id', v_inv.id,
    'token', v_inv.token,
    'psychologist_id', v_inv.psychologist_id,
    'recipient_email', v_inv.recipient_email,
    'expires_at', v_inv.expires_at
  );
end;
$$;

-- Test oturumu kaydet (davet destekli)
create or replace function public.complete_test_session(
  p_participant_name text,
  p_participant_age integer,
  p_participant_birth_date date,
  p_participant_gender text,
  p_profile_key text,
  p_logs jsonb,
  p_metrics jsonb,
  p_target jsonb,
  p_press_timeline jsonb default '[]'::jsonb,
  p_invite_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
  v_owner uuid;
  v_inv public.test_invites%rowtype;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (select 1 from public.profiles where id = v_uid) then
    raise exception 'profile_not_found';
  end if;

  v_owner := v_uid;

  if p_invite_id is not null then
    select * into v_inv from public.test_invites where id = p_invite_id for update;
    if not found then
      raise exception 'invite_not_found';
    end if;
    if v_inv.taker_id is distinct from v_uid then
      raise exception 'forbidden';
    end if;
    if v_inv.status not in ('accepted') then
      raise exception 'invite_invalid_status';
    end if;
    if v_inv.expires_at < now() then
      raise exception 'invite_expired';
    end if;
    v_owner := v_inv.psychologist_id;
  end if;

  insert into public.test_sessions (
    owner_id,
    taker_id,
    invite_id,
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
    v_owner,
    case when p_invite_id is not null then v_uid else null end,
    p_invite_id,
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

  if p_press_timeline is not null and jsonb_array_length(p_press_timeline) > 0 then
    insert into public.test_press_timelines (session_id, timeline)
    values (v_id, p_press_timeline)
    on conflict (session_id) do update set timeline = excluded.timeline;
  end if;

  if p_invite_id is not null then
    update public.test_invites
    set status = 'completed', session_id = v_id, completed_at = now()
    where id = p_invite_id;
  end if;

  return jsonb_build_object('id', v_id, 'owner_id', v_owner);
end;
$$;

grant execute on function public.create_test_invite(text) to authenticated;
grant execute on function public.get_invite_by_token(text) to anon, authenticated;
grant execute on function public.accept_test_invite(text) to authenticated;
grant execute on function public.get_active_invite_for_user() to authenticated;
grant execute on function public.complete_test_session(
  text, integer, date, text, text, jsonb, jsonb, jsonb, jsonb, uuid
) to authenticated;
