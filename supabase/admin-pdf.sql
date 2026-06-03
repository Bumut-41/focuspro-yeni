-- Admin basış PDF yolu + depolama: katılımcı -admin.pdf dosyasını okuyamaz.

alter table public.test_sessions
  add column if not exists admin_pdf_path text;

drop policy if exists reports_owner on storage.objects;

create policy reports_owner_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy reports_owner_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy reports_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy reports_owner_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'reports'
    and (storage.foldername(name))[1] = auth.uid()::text
    and name !~ '.+-admin\.pdf$'
  );

drop policy if exists reports_admin_read on storage.objects;
create policy reports_admin_read on storage.objects
  for select using (bucket_id = 'reports' and public.is_admin());
