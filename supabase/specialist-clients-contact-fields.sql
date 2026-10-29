-- Danışan: telefon, adres, açıklama (uzman düzenleyebilir).
-- Supabase SQL Editor veya: npx supabase db query --linked -f ...

alter table public.specialist_clients
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists notes text;

comment on column public.specialist_clients.phone is 'Danışan telefon (isteğe bağlı)';
comment on column public.specialist_clients.address is 'Danışan adres (isteğe bağlı)';
comment on column public.specialist_clients.notes is 'Uzman açıklama / not (isteğe bağlı)';
