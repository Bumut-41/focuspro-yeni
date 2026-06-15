-- Test raporu e-posta gönderimi (send-report-email edge function)
-- Supabase SQL Editor'da bir kez çalıştırın.

alter table public.test_sessions
  add column if not exists report_email_sent_at timestamptz;

comment on column public.test_sessions.report_email_sent_at is
  'Katılımcı test raporu PDF kullanıcı e-postasına gönderildiğinde doldurulur.';
