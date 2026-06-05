-- ADIM 1 — Önce BUNU tek başına çalıştırın (Run), sonra super-admin.sql.
-- PostgreSQL: yeni enum değeri aynı sorguda kullanılamaz; ayrı commit gerekir.

do $$ begin
  alter type public.user_role add value 'super_admin';
exception
  when duplicate_object then null;
end $$;
