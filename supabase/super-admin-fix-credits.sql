-- Super Admin kredi güncelleme
--
-- SIRAYLA:
--   1) super-admin-01-enum.sql  → henüz çalıştırmadıysanız ÖNCE bunu ayrı Run
--   2) Bu dosya                 → sonra Run

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'super_admin'
  );
$$;

create or replace function public.super_admin_set_credits(
  p_user_id uuid,
  p_credits integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old integer;
  v_new integer;
  v_delta integer;
begin
  if not public.is_super_admin() then
    raise exception 'forbidden';
  end if;

  if p_user_id is null or p_credits is null or p_credits < 0 then
    raise exception 'invalid_amount';
  end if;

  select test_credits into v_old from public.profiles where id = p_user_id;
  if v_old is null then
    raise exception 'user_not_found';
  end if;

  update public.profiles
  set test_credits = p_credits
  where id = p_user_id
  returning test_credits into v_new;

  v_delta := p_credits - v_old;
  if v_delta <> 0 then
    insert into public.credit_transactions (user_id, delta, reason)
    values (p_user_id, v_delta, 'super_admin_set');
  end if;

  return v_new;
end;
$$;

-- Kullanıcı listesi (e-posta sütunu için)
create or replace function public.admin_list_profiles()
returns table (
  id uuid,
  full_name text,
  email text,
  role public.user_role,
  test_credits integer,
  birth_date date,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.full_name,
    u.email::text,
    p.role,
    p.test_credits,
    p.birth_date,
    p.created_at
  from public.profiles p
  join auth.users u on u.id = p.id
  where public.is_admin()
  order by p.created_at desc;
$$;

grant execute on function public.super_admin_set_credits(uuid, integer) to authenticated;
grant execute on function public.admin_list_profiles() to authenticated;
