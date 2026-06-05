-- KULLANICI SİLME — test yapmış kullanıcılar dahil
-- Supabase SQL Editor: kutuya yapıştır → Run → Success
--
-- NOT: PDF'ler SQL ile silinemez; site kodu Storage API ile siler.
-- Bu dosyayı çalıştırdıktan sonra güncel site (Vercel) deploy edilmiş olmalı.

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

-- Storage API ile silme için Super Admin delete izni
drop policy if exists reports_super_admin_delete on storage.objects;
create policy reports_super_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'reports' and public.is_super_admin());

drop policy if exists storage_super_admin_delete on storage.objects;
create policy storage_super_admin_delete on storage.objects
  for delete to authenticated
  using (public.is_super_admin());

drop policy if exists profiles_super_admin_delete on public.profiles;
create policy profiles_super_admin_delete on public.profiles
  for delete to authenticated
  using (public.is_super_admin());

create or replace function public.super_admin_delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
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

  -- PDF'ler site tarafında Storage API ile silinmiş olmalı (SQL ile storage silinemez)

  delete from public.profiles
  where id = p_user_id;
  get diagnostics v_deleted = row_count;

  if v_deleted = 0 then
    raise exception 'delete_failed: profil silinemedi';
  end if;

  begin
    delete from auth.users where id = p_user_id;
    get diagnostics v_deleted = row_count;
  exception
    when others then
      raise exception 'delete_failed: %', sqlerrm;
  end;

  if v_deleted = 0 then
    raise exception 'delete_failed: auth hesabi silinemedi';
  end if;
end;
$$;

grant execute on function public.super_admin_delete_user(uuid) to authenticated;
