-- PDF Storage: reports bucket + oturum sahibi yükleme/okuma + admin okuma
-- Supabase SQL Editor'da bir kez çalıştırın.

insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;

drop policy if exists sessions_update_own on public.test_sessions;
create policy sessions_update_own on public.test_sessions
  for update using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists reports_owner_insert on storage.objects;
create policy reports_owner_insert on storage.objects
  for insert with check (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists reports_owner_update on storage.objects;
create policy reports_owner_update on storage.objects
  for update using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists reports_owner_delete on storage.objects;
create policy reports_owner_delete on storage.objects
  for delete using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists reports_owner_select on storage.objects;
create policy reports_owner_select on storage.objects
  for select using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists reports_admin_read on storage.objects;
create policy reports_admin_read on storage.objects
  for select using (bucket_id = 'reports' and public.is_admin());
