-- Test oturumları ve PDF raporları: yalnızca admin / super_admin okuyabilir.
-- Katılımcı testi tamamlayıp kaydedebilir; sonuçları göremez.
-- Supabase SQL Editor'da bir kez çalıştırın.

drop policy if exists sessions_select on public.test_sessions;
create policy sessions_select on public.test_sessions
  for select using (public.is_admin());

-- Katılımcı PDF yükleyebilir; okuma yalnızca admin (reports_admin_read).
drop policy if exists reports_owner_select on storage.objects;
