-- Danışan kaydında e-posta isteğe bağlı. Supabase SQL Editor'da bir kez çalıştırın.
-- (Yanında test için e-posta gerekmez; yalnızca «Testi e-posta ile gönder» için gerekir.)

alter table public.specialist_clients
  alter column email drop not null;

-- Boş string yerine NULL tut (çoklu danışanda unique çakışmasın)
update public.specialist_clients
set email = null
where email is not null and trim(email) = '';
