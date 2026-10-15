-- Bireysel kullanıcının kendi testi bitince bakiyeden 1 test düşer.
-- Davetle girilen test düşülmez; o kredi davet gönderilirken uzmandan alınmıştır.
-- Supabase SQL Editor'da FocusPro-Yeni projesinde bir kez çalıştırın.

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
  v_role public.user_role;
  v_credits integer;
  v_inv public.test_invites%rowtype;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select role into v_role from public.profiles where id = v_uid;
  if v_role is null then
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
  elsif v_role = 'individual' then
    select test_credits into v_credits
    from public.profiles
    where id = v_uid
    for update;
    if coalesce(v_credits, 0) < 1 then
      raise exception 'no_credits';
    end if;
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
  elsif v_role = 'individual' then
    update public.profiles
    set test_credits = test_credits - 1
    where id = v_uid;

    insert into public.credit_transactions (user_id, delta, reason)
    values (v_uid, -1, 'individual_test');
  end if;

  return jsonb_build_object('id', v_id, 'owner_id', v_owner);
end;
$$;

grant execute on function public.complete_test_session(
  text, integer, date, text, text, jsonb, jsonb, jsonb, jsonb, uuid
) to authenticated;
