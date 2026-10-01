-- Basış çizelgesi yalnızca yöneticide okunur. Uzman paneli test raporunu görür, basış raporunu görmez.
drop policy if exists press_timeline_admin_select on public.test_press_timelines;
create policy press_timeline_admin_select on public.test_press_timelines
  for select using (public.is_admin());
