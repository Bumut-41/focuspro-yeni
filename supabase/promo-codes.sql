-- Bireysel satın alma promosyon kodları (süper admin yönetir).
-- Supabase SQL Editor'da FocusPro-Yeni projesinde bir kez çalıştırın.

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(10, 2) not null check (discount_value > 0),
  active boolean not null default true,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promo_codes_code_unique unique (code),
  constraint promo_codes_percent_range check (
    discount_type <> 'percent' or (discount_value > 0 and discount_value <= 100)
  ),
  constraint promo_codes_fixed_range check (
    discount_type <> 'fixed' or (discount_value >= 1 and discount_value < 1500)
  )
);

create index if not exists promo_codes_active_idx on public.promo_codes (active, code);

alter table public.individual_test_purchases
  add column if not exists promo_code_id uuid references public.promo_codes (id) on delete set null;

alter table public.individual_test_purchases
  add column if not exists discount_tl integer;

alter table public.individual_test_purchases
  add column if not exists original_total_tl integer;

create or replace function public.normalize_promo_code(p_code text)
returns text
language sql
immutable
as $$
  select nullif(upper(trim(regexp_replace(coalesce(p_code, ''), '\s+', ' ', 'g'))), '');
$$;

create or replace function public.promo_codes_normalize_bi()
returns trigger
language plpgsql
as $$
begin
  new.code := public.normalize_promo_code(new.code);
  if new.code is null then
    raise exception 'invalid_promo_code';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists promo_codes_normalize_bi on public.promo_codes;
create trigger promo_codes_normalize_bi
  before insert or update on public.promo_codes
  for each row execute function public.promo_codes_normalize_bi();

alter table public.promo_codes enable row level security;

drop policy if exists promo_codes_super_admin on public.promo_codes;
create policy promo_codes_super_admin on public.promo_codes
  for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

grant select, insert, update, delete on table public.promo_codes to authenticated;

-- Bireysel kullanıcı: kodu doğrula ve indirimli tutarı hesapla
create or replace function public.validate_promo_code(
  p_code text,
  p_quantity integer default 1
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role public.user_role;
  v_code text := public.normalize_promo_code(p_code);
  v_row public.promo_codes%rowtype;
  v_unit integer := 1500;
  v_qty integer := greatest(coalesce(p_quantity, 1), 1);
  v_discount_unit numeric := 0;
  v_unit_after integer;
  v_before integer;
  v_after integer;
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

  if v_code is null then
    return jsonb_build_object('ok', false, 'error', 'invalid_promo_code');
  end if;

  select * into v_row
  from public.promo_codes
  where code = v_code and active = true
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'promo_not_found');
  end if;

  if v_row.discount_type = 'percent' then
    v_discount_unit := round(v_unit * (v_row.discount_value / 100.0), 2);
  else
    v_discount_unit := v_row.discount_value;
  end if;

  if v_discount_unit >= v_unit then
    v_discount_unit := v_unit - 1;
  end if;
  if v_discount_unit < 0 then
    v_discount_unit := 0;
  end if;

  v_unit_after := greatest(1, round(v_unit - v_discount_unit)::integer);
  v_before := v_unit * v_qty;
  v_after := v_unit_after * v_qty;

  return jsonb_build_object(
    'ok', true,
    'id', v_row.id,
    'code', v_row.code,
    'discount_type', v_row.discount_type,
    'discount_value', v_row.discount_value,
    'unit_price_tl', v_unit,
    'unit_price_after_tl', v_unit_after,
    'discount_per_unit_tl', v_unit - v_unit_after,
    'total_before_tl', v_before,
    'total_after_tl', v_after,
    'discount_total_tl', v_before - v_after
  );
end;
$$;

revoke all on function public.validate_promo_code(text, integer) from public;
grant execute on function public.validate_promo_code(text, integer) to authenticated;
grant execute on function public.normalize_promo_code(text) to authenticated;
