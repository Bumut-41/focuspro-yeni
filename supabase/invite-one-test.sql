-- Her davet bağlantısı tek kullanımlık. Aynı kişiye yeni davet açılabilir; her açılış 1 kredi düşer.
-- Supabase SQL Editor'da FocusPro-Yeni projesinde bir kez çalıştırın.

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

  if v_inv.expires_at < now() and v_inv.status in ('pending', 'accepted') then
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
    if exists (
      select 1 from public.test_invites
      where taker_id = v_uid and status = 'completed'
    ) then
      return jsonb_build_object('completed', true);
    end if;
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
