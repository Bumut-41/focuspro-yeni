-- Bekleyen daveti e-posta ile otomatik bağla.
-- Token kaybolsa / kullanıcı panele doğrudan girse bile davetli test açılır;
-- bireysel kredi istenmez (kredi davet oluşturulurken psikologdan düşmüştür).

create or replace function public.get_active_invite_for_user()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_user_email text;
  v_inv public.test_invites%rowtype;
begin
  if v_uid is null then
    return null;
  end if;

  -- 1) Zaten kabul edilmiş aktif davet
  select * into v_inv
  from public.test_invites
  where taker_id = v_uid
    and status = 'accepted'
    and expires_at > now()
  order by accepted_at desc nulls last
  limit 1;

  if found then
    return jsonb_build_object(
      'id', v_inv.id,
      'token', v_inv.token,
      'psychologist_id', v_inv.psychologist_id,
      'recipient_email', v_inv.recipient_email,
      'expires_at', v_inv.expires_at,
      'status', v_inv.status
    );
  end if;

  -- 2) Bireysel kullanıcı + e-postaya gelen bekleyen davet → otomatik kabul
  if exists (select 1 from public.profiles where id = v_uid and role <> 'individual') then
    return null;
  end if;

  select lower(email) into v_user_email from auth.users where id = v_uid;
  if v_user_email is null or length(trim(v_user_email)) = 0 then
    return null;
  end if;

  select * into v_inv
  from public.test_invites
  where recipient_email = v_user_email
    and status = 'pending'
    and expires_at > now()
    and (taker_id is null or taker_id = v_uid)
  order by created_at desc
  limit 1
  for update;

  if not found then
    return null;
  end if;

  update public.test_invites
  set status = 'accepted',
      taker_id = v_uid,
      accepted_at = coalesce(accepted_at, now())
  where id = v_inv.id
  returning * into v_inv;

  return jsonb_build_object(
    'id', v_inv.id,
    'token', v_inv.token,
    'psychologist_id', v_inv.psychologist_id,
    'recipient_email', v_inv.recipient_email,
    'expires_at', v_inv.expires_at,
    'status', v_inv.status
  );
end;
$$;

grant execute on function public.get_active_invite_for_user() to authenticated;
