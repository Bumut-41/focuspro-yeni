-- Uzman başvuru formu. Supabase SQL Editor'da bir kez çalıştırın.
-- Daha kısa bir taslak tablo oluşturulduysa bu betik onu yeniler.

drop table if exists public.specialist_applications cascade;

create table public.specialist_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  city text not null,
  birth_date date,
  professions text[] not null,
  profession_other text,
  university text not null,
  department text not null,
  graduation_year integer,
  postgraduate text,
  workplace text,
  experience text,
  practice_areas text,
  diploma_path text,
  certificate_path text,
  purposes text[] not null,
  purpose_other text,
  heard_from text not null,
  heard_other text,
  motivation text,
  created_at timestamptz not null default now()
);

alter table public.specialist_applications enable row level security;

drop policy if exists "public insert specialist applications" on public.specialist_applications;
create policy "public insert specialist applications"
  on public.specialist_applications
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admin select specialist applications" on public.specialist_applications;
create policy "admin select specialist applications"
  on public.specialist_applications
  for select
  to authenticated
  using (public.is_admin());

revoke all on table public.specialist_applications from anon, authenticated;
grant insert on table public.specialist_applications to anon, authenticated;
grant select on table public.specialist_applications to authenticated;

insert into storage.buckets (id, name, public)
values ('specialist-documents', 'specialist-documents', false)
on conflict (id) do nothing;

drop policy if exists specialist_docs_insert on storage.objects;
create policy specialist_docs_insert on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'specialist-documents'
    and (storage.foldername(name))[1] = 'applications'
  );

drop policy if exists specialist_docs_admin_select on storage.objects;
create policy specialist_docs_admin_select on storage.objects
  for select to authenticated
  using (bucket_id = 'specialist-documents' and public.is_admin());
