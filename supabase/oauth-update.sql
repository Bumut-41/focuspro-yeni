-- Google / Microsoft / Apple ile giriş için (mevcut projede bir kez çalıştırın)

alter table public.profiles
  add column if not exists profile_completed boolean not null default true;

alter table public.profiles
  alter column birth_date drop not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
  v_name text;
  v_birth date;
  v_completed boolean;
begin
  v_role := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'individual');
  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    split_part(coalesce(new.email, ''), '@', 1),
    'Kullanıcı'
  );
  v_birth := nullif(new.raw_user_meta_data->>'birth_date', '')::date;
  v_completed := v_birth is not null;

  insert into public.profiles (id, role, full_name, birth_date, test_credits, profile_completed)
  values (new.id, v_role, v_name, v_birth, 999999, v_completed)
  on conflict (id) do update set
    full_name = excluded.full_name
  where public.profiles.profile_completed = false;

  return new;
end;
$$;
