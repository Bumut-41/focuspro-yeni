-- Admin: kullanıcı rolü güncelleme (Supabase SQL Editor'da bir kez çalıştırın).

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
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  if p_user_id is null or p_role is null then
    raise exception 'invalid_args';
  end if;

  if p_user_id = auth.uid() and p_role <> 'admin' then
    raise exception 'cannot_demote_self';
  end if;

  update public.profiles
  set role = p_role
  where id = p_user_id
  returning role into v_new;

  if v_new is null then
    raise exception 'user_not_found';
  end if;

  return v_new;
end;
$$;
