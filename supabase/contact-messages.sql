-- İletişim formu. Supabase SQL Editor'da bir kez çalıştırın.

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  profession text,
  organization text,
  location text,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "public insert contact messages" on public.contact_messages;
create policy "public insert contact messages"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admin select contact messages" on public.contact_messages;
create policy "admin select contact messages"
  on public.contact_messages
  for select
  to authenticated
  using (public.is_admin());

revoke all on table public.contact_messages from anon, authenticated;
grant insert on table public.contact_messages to anon, authenticated;
grant select on table public.contact_messages to authenticated;
