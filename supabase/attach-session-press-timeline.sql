-- Teşekkür ekranı hızı: oturum önce kaydolur, basış çizelgesi ayrı (hafif) RPC ile gelir.
-- Supabase SQL Editor'da BİR KEZ çalıştırın.
-- complete_test_session imzasına dokunmaz (overload yok).

create or replace function public.attach_session_press_timeline(
  p_session_id uuid,
  p_timeline jsonb default '[]'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_owner uuid;
  v_taker uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  if p_session_id is null then
    raise exception 'session_required';
  end if;

  if p_timeline is null or jsonb_typeof(p_timeline) <> 'array' or jsonb_array_length(p_timeline) = 0 then
    return;
  end if;

  select owner_id, taker_id into v_owner, v_taker
  from public.test_sessions
  where id = p_session_id;

  if not found then
    raise exception 'session_not_found';
  end if;

  if v_uid is distinct from v_owner and v_uid is distinct from v_taker and not public.is_admin() then
    raise exception 'forbidden';
  end if;

  insert into public.test_press_timelines (session_id, timeline)
  values (p_session_id, p_timeline)
  on conflict (session_id) do update set timeline = excluded.timeline;
end;
$$;

grant execute on function public.attach_session_press_timeline(uuid, jsonb) to authenticated;
