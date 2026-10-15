-- Bireysel test satın alma: 1 test = 1500 TL, hesap başına toplam en fazla 5 test.
-- Fatura bilgisi siparişle birlikte kaydedilir ve test kredisi hesaba eklenir.
-- Supabase SQL Editor'da FocusPro-Yeni projesinde bir kez çalıştırın.

create table if not exists public.individual_test_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  quantity integer not null check (quantity >= 1 and quantity <= 5),
  unit_price_tl integer not null check (unit_price_tl > 0),
  total_tl integer not null check (total_tl > 0),
  invoice_type text not null check (invoice_type in ('individual', 'company')),
  invoice_name text not null,
  tax_id text not null,
  tax_office text,
  email text not null,
  phone text not null,
  city text not null,
  district text not null,
  address text not null,
  created_at timestamptz not null default now()
);

create index if not exists individual_test_purchases_user_idx
  on public.individual_test_purchases (user_id, created_at desc);

alter table public.individual_test_purchases enable row level security;

drop policy if exists individual_purchases_select on public.individual_test_purchases;
create policy individual_purchases_select on public.individual_test_purchases
  for select using (auth.uid() = user_id or public.is_admin());

create or replace function public.get_individual_purchase_quota()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role public.user_role;
  v_bought integer;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select role into v_role from public.profiles where id = v_uid;
  if v_role is null then
    raise exception 'profile_not_found';
  end if;
  if v_role <> 'individual' then
    raise exception 'individual_only';
  end if;

  select coalesce(sum(quantity), 0) into v_bought
  from public.individual_test_purchases
  where user_id = v_uid;

  return jsonb_build_object(
    'limit', 5,
    'purchased', v_bought,
    'remaining', greatest(0, 5 - v_bought),
    'unit_price_tl', 1500
  );
end;
$$;

create or replace function public.purchase_individual_tests(
  p_quantity integer,
  p_invoice_type text,
  p_invoice_name text,
  p_tax_id text,
  p_tax_office text,
  p_email text,
  p_phone text,
  p_city text,
  p_district text,
  p_address text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role public.user_role;
  v_bought integer;
  v_remaining integer;
  v_credits integer;
  v_name text := nullif(trim(p_invoice_name), '');
  v_type text := lower(trim(coalesce(p_invoice_type, '')));
  v_tax text := regexp_replace(coalesce(p_tax_id, ''), '\D', '', 'g');
  v_office text := nullif(trim(coalesce(p_tax_office, '')), '');
  v_email text := lower(trim(coalesce(p_email, '')));
  v_phone text := nullif(trim(coalesce(p_phone, '')), '');
  v_city text := nullif(trim(coalesce(p_city, '')), '');
  v_district text := nullif(trim(coalesce(p_district, '')), '');
  v_address text := nullif(trim(coalesce(p_address, '')), '');
  v_id uuid;
  v_total integer;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select role, test_credits
  into v_role, v_credits
  from public.profiles
  where id = v_uid
  for update;

  if v_role is null then
    raise exception 'profile_not_found';
  end if;
  if v_role <> 'individual' then
    raise exception 'individual_only';
  end if;

  select coalesce(sum(quantity), 0) into v_bought
  from public.individual_test_purchases
  where user_id = v_uid;

  v_remaining := 5 - v_bought;
  if v_remaining < 1 or p_quantity is null or p_quantity < 1 or p_quantity > v_remaining then
    raise exception 'purchase_limit';
  end if;

  if v_name is null or char_length(v_name) > 160 then
    raise exception 'invalid_invoice';
  end if;
  if v_type not in ('individual', 'company') then
    raise exception 'invalid_invoice';
  end if;
  if v_type = 'individual' and v_tax !~ '^[1-9][0-9]{10}$' then
    raise exception 'invalid_tax_id';
  end if;
  if v_type = 'company' and v_tax !~ '^[0-9]{10}$' then
    raise exception 'invalid_tax_id';
  end if;
  if v_type = 'company' and v_office is null then
    raise exception 'invalid_invoice';
  end if;
  if v_email !~ '^[^@]+@[^@]+\.[^@]+$' or char_length(v_email) > 160 then
    raise exception 'invalid_invoice';
  end if;
  if v_phone is null or char_length(regexp_replace(v_phone, '\D', '', 'g')) < 10 or char_length(v_phone) > 30 then
    raise exception 'invalid_invoice';
  end if;
  if v_city is null or v_district is null or v_address is null then
    raise exception 'invalid_invoice';
  end if;
  if char_length(v_city) > 80 or char_length(v_district) > 80 or char_length(v_address) > 400 then
    raise exception 'invalid_invoice';
  end if;
  if v_office is not null and char_length(v_office) > 120 then
    raise exception 'invalid_invoice';
  end if;

  v_total := p_quantity * 1500;

  insert into public.individual_test_purchases (
    user_id,
    quantity,
    unit_price_tl,
    total_tl,
    invoice_type,
    invoice_name,
    tax_id,
    tax_office,
    email,
    phone,
    city,
    district,
    address
  )
  values (
    v_uid,
    p_quantity,
    1500,
    v_total,
    v_type,
    v_name,
    v_tax,
    case when v_type = 'company' then v_office else null end,
    v_email,
    v_phone,
    v_city,
    v_district,
    v_address
  )
  returning id into v_id;

  update public.profiles
  set test_credits = test_credits + p_quantity
  where id = v_uid
  returning test_credits into v_credits;

  insert into public.credit_transactions (user_id, delta, reason)
  values (v_uid, p_quantity, 'individual_purchase');

  return jsonb_build_object(
    'id', v_id,
    'quantity', p_quantity,
    'unit_price_tl', 1500,
    'total_tl', v_total,
    'credits', v_credits,
    'purchased', v_bought + p_quantity,
    'remaining', v_remaining - p_quantity
  );
end;
$$;

revoke all on function public.get_individual_purchase_quota() from public;
revoke all on function public.purchase_individual_tests(integer, text, text, text, text, text, text, text, text, text) from public;
grant execute on function public.get_individual_purchase_quota() to authenticated;
grant execute on function public.purchase_individual_tests(integer, text, text, text, text, text, text, text, text, text) to authenticated;
