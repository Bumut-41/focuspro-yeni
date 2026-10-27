-- Test daveti e-posta takip alanları (psikolog + admin paneli)
-- Supabase SQL Editor'da bir kez çalıştırın.

alter table public.test_invites
  add column if not exists invite_email_status text,
  add column if not exists invite_email_sent_at timestamptz,
  add column if not exists invite_email_error_code text,
  add column if not exists invite_email_error_detail text,
  add column if not exists invite_email_provider_id text;

comment on column public.test_invites.invite_email_status is
  'pending | sent | failed | null (henüz gönderim denenmedi)';

create index if not exists test_invites_email_status_idx
  on public.test_invites (invite_email_status, created_at desc);

-- Psikolog kendi davetini, admin tümünü güncelleyebilir
create or replace function public.record_invite_email_status(
  p_invite_id uuid,
  p_status text,
  p_error_code text default null,
  p_error_detail text default null,
  p_provider_id text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_inv public.test_invites%rowtype;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if p_status is null or p_status not in ('pending', 'sent', 'failed') then
    raise exception 'invalid_status';
  end if;

  select * into v_inv from public.test_invites where id = p_invite_id for update;
  if not found then
    raise exception 'invite_not_found';
  end if;

  if v_inv.psychologist_id is distinct from v_uid and not public.is_admin() then
    raise exception 'forbidden';
  end if;

  if p_status = 'sent' then
    update public.test_invites
    set
      invite_email_status = 'sent',
      invite_email_sent_at = now(),
      invite_email_error_code = null,
      invite_email_error_detail = null,
      invite_email_provider_id = coalesce(p_provider_id, invite_email_provider_id)
    where id = p_invite_id;
  elsif p_status = 'pending' then
    update public.test_invites
    set
      invite_email_status = 'pending',
      invite_email_error_code = null,
      invite_email_error_detail = null
    where id = p_invite_id;
  else
    update public.test_invites
    set
      invite_email_status = 'failed',
      invite_email_error_code = left(coalesce(p_error_code, 'send_failed'), 120),
      invite_email_error_detail = left(coalesce(p_error_detail, ''), 500),
      invite_email_provider_id = coalesce(p_provider_id, invite_email_provider_id)
    where id = p_invite_id;
  end if;
end;
$$;

grant execute on function public.record_invite_email_status(uuid, text, text, text, text) to authenticated;
grant execute on function public.record_invite_email_status(uuid, text, text, text, text) to service_role;
