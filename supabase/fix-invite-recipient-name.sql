-- Davet listesinde hangi danışana gönderildiği görünsün.
-- recipient_name: o anki danışan adı (silinse / e-posta değişse bile kayıt kalır)
-- client_id: isteğe bağlı specialist_clients bağlantısı

alter table public.test_invites
  add column if not exists client_id uuid references public.specialist_clients (id) on delete set null;

alter table public.test_invites
  add column if not exists recipient_name text;

create index if not exists test_invites_client_idx on public.test_invites (client_id);

comment on column public.test_invites.recipient_name is
  'Davet oluşturulurken kaydedilen danışan adı (liste için)';
comment on column public.test_invites.client_id is
  'İsteğe bağlı specialist_clients kaydı';

-- Eski davetleri e-posta + uzman eşleşmesiyle doldur
update public.test_invites i
set recipient_name = c.full_name,
    client_id = coalesce(i.client_id, c.id)
from (
  select distinct on (specialist_id, email)
    id, specialist_id, email, full_name
  from public.specialist_clients
  where email is not null
  order by specialist_id, email, created_at desc
) c
where i.recipient_name is null
  and i.psychologist_id = c.specialist_id
  and i.recipient_email = c.email;

-- Eski tek-argüman imzasını kaldır (PGRST overload belirsizliği)
drop function if exists public.create_test_invite(text);

create or replace function public.create_test_invite(
  p_recipient_email text,
  p_client_id uuid default null,
  p_recipient_name text default null
)
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
  v_client_id uuid := p_client_id;
  v_name text := nullif(trim(coalesce(p_recipient_name, '')), '');
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

  if v_client_id is not null then
    select full_name into v_name
    from public.specialist_clients
    where id = v_client_id
      and specialist_id = v_uid;
    if not found then
      raise exception 'client_not_found';
    end if;
  elsif v_name is null then
    select full_name, id into v_name, v_client_id
    from public.specialist_clients
    where specialist_id = v_uid
      and email = v_email
    order by created_at desc
    limit 1;
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

  insert into public.test_invites (
    token, psychologist_id, recipient_email, recipient_name, client_id, expires_at
  )
  values (v_token, v_uid, v_email, v_name, v_client_id, v_expires)
  returning id into v_id;

  return jsonb_build_object(
    'id', v_id,
    'token', v_token,
    'recipient_email', v_email,
    'recipient_name', v_name,
    'client_id', v_client_id,
    'expires_at', v_expires
  );
end;
$$;

grant execute on function public.create_test_invite(text, uuid, text) to authenticated;
