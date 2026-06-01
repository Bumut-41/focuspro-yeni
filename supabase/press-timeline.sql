-- Admin-only basış zaman çizelgesi (normal kullanıcılar SELECT yapamaz).
create table if not exists public.test_press_timelines (
  session_id uuid primary key references public.test_sessions (id) on delete cascade,
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.test_press_timelines enable row level security;

drop policy if exists press_timeline_admin_select on public.test_press_timelines;
create policy press_timeline_admin_select on public.test_press_timelines
  for select using (public.is_admin());

-- complete_test_session: basış çizelgesi kaydı
create or replace function public.complete_test_session(
  p_participant_name text,
  p_participant_age integer,
  p_participant_birth_date date,
  p_participant_gender text,
  p_profile_key text,
  p_logs jsonb,
  p_metrics jsonb,
  p_target jsonb,
  p_press_timeline jsonb default '[]'::jsonb
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

  if p_press_timeline is not null and jsonb_array_length(p_press_timeline) > 0 then
    insert into public.test_press_timelines (session_id, timeline)
    values (v_id, p_press_timeline)
    on conflict (session_id) do update set timeline = excluded.timeline;
  end if;

  return v_id;
end;
$$;
