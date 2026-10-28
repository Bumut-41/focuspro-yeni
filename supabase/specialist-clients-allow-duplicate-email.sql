-- Aynı psikolog, aynı e-posta ile birden fazla danışan kaydedebilsin.
-- Supabase SQL Editor'da bir kez çalıştırın.

alter table public.specialist_clients
  drop constraint if exists specialist_clients_unique_email;
