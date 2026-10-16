import { supabase } from "../lib/supabase.js";

export function normalizePromoCodeInput(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

export async function validatePromoCode(code, quantity = 1) {
  const { data, error } = await supabase.rpc("validate_promo_code", {
    p_code: normalizePromoCodeInput(code),
    p_quantity: quantity
  });
  if (error) throw error;
  return data;
}

export async function fetchPromoCodes() {
  const { data, error } = await supabase
    .from("promo_codes")
    .select("id, code, discount_type, discount_value, active, note, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createPromoCode({ code, discountType, discountValue, note, active = true }) {
  const { data, error } = await supabase
    .from("promo_codes")
    .insert({
      code: normalizePromoCodeInput(code),
      discount_type: discountType,
      discount_value: Number(discountValue),
      note: note?.trim() || null,
      active: Boolean(active)
    })
    .select("id, code, discount_type, discount_value, active, note, created_at, updated_at")
    .single();
  if (error) throw error;
  return data;
}

export async function updatePromoCode(id, patch) {
  const next = { ...patch, updated_at: new Date().toISOString() };
  if (patch.code != null) next.code = normalizePromoCodeInput(patch.code);
  if (patch.discount_type != null) next.discount_type = patch.discount_type;
  if (patch.discount_value != null) next.discount_value = Number(patch.discount_value);
  if (patch.note !== undefined) next.note = patch.note?.trim() || null;
  if (patch.active != null) next.active = Boolean(patch.active);

  const { data, error } = await supabase
    .from("promo_codes")
    .update(next)
    .eq("id", id)
    .select("id, code, discount_type, discount_value, active, note, created_at, updated_at")
    .single();
  if (error) throw error;
  return data;
}

export async function deletePromoCode(id) {
  const { error } = await supabase.from("promo_codes").delete().eq("id", id);
  if (error) throw error;
}
