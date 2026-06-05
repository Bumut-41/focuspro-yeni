-- Super Admin: rol, e-posta listesi, manuel kredi, kullanıcı silme
--
-- ÖNEMLİ — İKİ ADIM:
--   1) super-admin-01-enum.sql  → Run (tek başına)
--   2) Bu dosya (super-admin.sql) → Run
--
-- Hata "unsafe use of new value super_admin" alırsanız: Adım 1 atlanmış veya
-- aynı sekmede birleştirilmiş demektir; önce 01-enum dosyasını ayrı çalıştırın.

-- is_admin = yönetici paneli + tüm admin RPC/RLS (super_admin DAHİL).
-- Super Admin ek olarak: super_admin_set_credits, super_admin_delete_user, super_admin rol atama.
-- Devralınan admin yetkileri: admin_add_credits, admin_set_user_role, admin_list_profiles,
-- tüm test_sessions/test_press_timelines görüntüleme, reports storage okuma.
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

-- Admin listesi (e-posta dahil)
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

-- Rol güncelleme (super_admin rolü yalnızca super_admin atayabilir)
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

-- Super admin: krediyi doğrudan ayarla (0+)
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

-- Super Admin: Storage'da başka kullanıcının dosyasını silebilir (RLS)
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

drop policy if exists sessions_super_admin_delete on public.test_sessions;
create policy sessions_super_admin_delete on public.test_sessions
  for delete to authenticated
  using (public.is_super_admin());

drop policy if exists press_timeline_super_admin_delete on public.test_press_timelines;
create policy press_timeline_super_admin_delete on public.test_press_timelines
  for delete to authenticated
  using (public.is_super_admin());

drop policy if exists credit_tx_super_admin_delete on public.credit_transactions;
create policy credit_tx_super_admin_delete on public.credit_transactions
  for delete to authenticated
  using (public.is_super_admin());

-- Super admin: kullanıcıyı sil (PDF'ler site tarafında Storage API ile silinir)
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

grant execute on function public.super_admin_set_credits(uuid, integer) to authenticated;
grant execute on function public.super_admin_delete_user(uuid) to authenticated;
grant execute on function public.admin_list_profiles() to authenticated;

-- İlk super admin (e-postanızı yazın):
-- update public.profiles set role = 'super_admin'
-- where id = (select id from auth.users where email = 'SIZIN@EMAIL.com');
