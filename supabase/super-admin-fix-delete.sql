-- Kullanıcı silme düzeltmesi (Storage PDF engeli + satır kontrolü)
-- Supabase SQL Editor'da bir kez çalıştırın.

create or replace function public.super_admin_delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth, storage
as $$
declare
  v_deleted int;
begin
  if not public.is_super_admin() then
    raise exception 'forbidden';
  end if;

  if p_user_id is null then
    raise exception 'invalid_args';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'cannot_delete_self';
  end if;

  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'user_not_found';
  end if;

  delete from storage.objects
  where bucket_id = 'reports'
    and (
      owner = p_user_id
      or (storage.foldername(name))[1] = p_user_id::text
    );

  delete from auth.users where id = p_user_id;
  get diagnostics v_deleted = row_count;

  if v_deleted = 0 then
    delete from public.profiles where id = p_user_id;
    get diagnostics v_deleted = row_count;
    if v_deleted = 0 then
      raise exception 'delete_failed';
    end if;
  end if;
end;
$$;

grant execute on function public.super_admin_delete_user(uuid) to authenticated;
