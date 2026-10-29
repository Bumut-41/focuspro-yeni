-- Admin: kayıtlı rapor PDF’lerini yeniden yazabilsin (V4 metin / güncel skor yenileme).
-- Supabase SQL Editor’da bir kez çalıştırın.

drop policy if exists reports_admin_insert on storage.objects;
create policy reports_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'reports' and public.is_admin());

drop policy if exists reports_admin_update on storage.objects;
create policy reports_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'reports' and public.is_admin())
  with check (bucket_id = 'reports' and public.is_admin());
