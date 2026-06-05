-- Admin: kullanıcı rolü güncelleme
-- NOT: super-admin.sql çalıştırıldıysa admin_set_user_role orada güncellenir.
-- Sadece eski kurulumlar için veya super-admin öncesi:

create or replace function public.admin_set_user_role(
  p_user_id uuid,
  p_role public.user_role
)
returns public.user_role
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new public.user_role;
  v_current public.user_role;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  if p_user_id is null or p_role is null then
    raise exception 'invalid_args';
  end if;

  if p_role = 'super_admin' and not public.is_super_admin() then
    raise exception 'forbidden_super_admin_role';
  end if;

  select role into v_current from public.profiles where id = p_user_id;
  if v_current is null then
    raise exception 'user_not_found';
  end if;

  if p_user_id = auth.uid() and p_role is distinct from v_current then
    raise exception 'cannot_change_own_role';
  end if;

  update public.profiles
  set role = p_role
  where id = p_user_id
  returning role into v_new;

  return v_new;
end;
$$;
