-- Uzman test paketleri. Fiyatlar KDV hariçtir. KDV %20.
-- 10 test: 1000 TL, 20 test: 900 TL, 50 test: 800 TL, 100 test: 700 TL (test başı).
-- Supabase SQL Editor'da FocusPro-Yeni projesinde bir kez çalıştırın.

create table if not exists public.specialist_test_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  quantity integer not null check (quantity in (10, 20, 50, 100)),
  unit_price_tl integer not null check (unit_price_tl > 0),
  net_tl integer not null check (net_tl > 0),
  vat_rate integer not null check (vat_rate >= 0),
  vat_tl integer not null check (vat_tl >= 0),
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

create index if not exists specialist_test_purchases_user_idx
  on public.specialist_test_purchases (user_id, created_at desc);

alter table public.specialist_test_purchases enable row level security;

drop policy if exists specialist_purchases_select on public.specialist_test_purchases;
create policy specialist_purchases_select on public.specialist_test_purchases
  for select using (auth.uid() = user_id or public.is_admin());

create or replace function public.purchase_specialist_tests(
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
  v_unit integer;
  v_net integer;
  v_vat integer;
  v_total integer;
  v_id uuid;
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
  if v_role <> 'psychologist' then
    raise exception 'specialist_only';
  end if;

  v_unit := case p_quantity
    when 10 then 1000
    when 20 then 900
    when 50 then 800
    when 100 then 700
    else null
  end;
  if v_unit is null then
    raise exception 'invalid_pack';
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

  v_net := p_quantity * v_unit;
  v_vat := v_net * 20 / 100;
  v_total := v_net + v_vat;

  insert into public.specialist_test_purchases (
    user_id,
    quantity,
    unit_price_tl,
    net_tl,
    vat_rate,
    vat_tl,
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
    v_unit,
    v_net,
    20,
    v_vat,
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
  values (v_uid, p_quantity, 'specialist_purchase');

  return jsonb_build_object(
    'id', v_id,
    'quantity', p_quantity,
    'unit_price_tl', v_unit,
    'net_tl', v_net,
    'vat_rate', 20,
    'vat_tl', v_vat,
    'total_tl', v_total,
    'credits', v_credits
  );
end;
$$;

revoke all on function public.purchase_specialist_tests(integer, text, text, text, text, text, text, text, text, text) from public;
grant execute on function public.purchase_specialist_tests(integer, text, text, text, text, text, text, text, text, text) to authenticated;
grant select on table public.specialist_test_purchases to authenticated;
