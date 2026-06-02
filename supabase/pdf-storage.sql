-- PDF raporları: oturum sahibi güncelleyebilsin; admin tüm raporları okuyabilsin.

drop policy if exists sessions_update_own on public.test_sessions;
create policy sessions_update_own on public.test_sessions
  for update using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists reports_admin_read on storage.objects;
create policy reports_admin_read on storage.objects
  for select using (bucket_id = 'reports' and public.is_admin());
