-- Süper admin tüm danışan kayıtlarını görebilir / silebilir.
-- Psikolog kendi danışanlarını zaten specialist_clients_own ile yönetir.

drop policy if exists specialist_clients_super_admin on public.specialist_clients;
create policy specialist_clients_super_admin on public.specialist_clients
  for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());
