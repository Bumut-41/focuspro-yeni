-- Test raporu e-posta durumu (gönderildi / iletilmedi nedeni)
-- Supabase SQL Editor'da bir kez çalıştırın.

alter table public.test_sessions
  add column if not exists report_email_sent_at timestamptz;

alter table public.test_sessions
  add column if not exists report_email_to text;

alter table public.test_sessions
  add column if not exists report_email_status text;

alter table public.test_sessions
  add column if not exists report_email_error_code text;

alter table public.test_sessions
  add column if not exists report_email_error_detail text;

comment on column public.test_sessions.report_email_sent_at is
  'Test raporu PDF e-postaya gönderildiği an.';
comment on column public.test_sessions.report_email_to is
  'Raporun gönderildiği e-posta adresleri (virgülle).';
comment on column public.test_sessions.report_email_status is
  'pending | sent | failed';
comment on column public.test_sessions.report_email_error_code is
  'İletilmeme kodu: pdf_not_saved, pdf_not_ready, email_not_configured, send_failed, ...';
comment on column public.test_sessions.report_email_error_detail is
  'İletilmeme ayrıntısı (teknik mesaj).';

create or replace function public.record_report_email_status(
  p_session_id uuid,
  p_status text,
  p_emails text default null,
  p_error_code text default null,
  p_error_detail text default null
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
  if p_status not in ('pending', 'sent', 'failed') then
    raise exception 'invalid_status';
  end if;

  select owner_id, taker_id into v_owner, v_taker
  from public.test_sessions
  where id = p_session_id;

  if v_owner is null then
    raise exception 'session_not_found';
  end if;

  if v_uid is distinct from v_owner
     and v_uid is distinct from v_taker
     and not public.is_admin() then
    raise exception 'forbidden';
  end if;

  if p_status = 'sent' then
    update public.test_sessions
    set
      report_email_status = 'sent',
      report_email_sent_at = coalesce(report_email_sent_at, now()),
      report_email_to = nullif(trim(coalesce(p_emails, '')), ''),
      report_email_error_code = null,
      report_email_error_detail = null
    where id = p_session_id;
  elsif p_status = 'pending' then
    update public.test_sessions
    set
      report_email_status = 'pending',
      report_email_error_code = null,
      report_email_error_detail = null
    where id = p_session_id
      and report_email_sent_at is null;
  else
    update public.test_sessions
    set
      report_email_status = 'failed',
      report_email_to = coalesce(nullif(trim(coalesce(p_emails, '')), ''), report_email_to),
      report_email_error_code = coalesce(nullif(trim(coalesce(p_error_code, '')), ''), 'unexpected'),
      report_email_error_detail = nullif(trim(coalesce(p_error_detail, '')), '')
    where id = p_session_id
      and report_email_sent_at is null;
  end if;
end;
$$;

grant execute on function public.record_report_email_status(uuid, text, text, text, text) to authenticated;
