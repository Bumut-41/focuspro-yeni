import { supabase } from "../lib/supabase.js";

export const INDIVIDUAL_TEST_PRICE_TL = 1500;
export const INDIVIDUAL_TEST_LIMIT = 5;

export function formatTl(amount, locale) {
  const formatted = new Intl.NumberFormat(locale === "en" ? "en-US" : "tr-TR", {
    maximumFractionDigits: 0
  }).format(Number(amount) || 0);
  return `${formatted} TL`;
}

export async function fetchIndividualPurchaseQuota() {
  const { data, error } = await supabase.rpc("get_individual_purchase_quota");
  if (error) throw error;
  return data;
}

export async function purchaseIndividualTests(input) {
  const { data, error } = await supabase.rpc("purchase_individual_tests", {
    p_quantity: input.quantity,
    p_invoice_type: input.invoiceType,
    p_invoice_name: input.invoiceName,
    p_tax_id: input.taxId,
    p_tax_office: input.taxOffice || null,
    p_email: input.email,
    p_phone: input.phone,
    p_city: input.city,
    p_district: input.district,
    p_address: input.address
  });
  if (error) throw error;
  return data;
}

export async function fetchIndividualPurchases(limit = 200) {
  const { data, error } = await supabase
    .from("individual_test_purchases")
    .select(
      "id, quantity, unit_price_tl, total_tl, invoice_type, invoice_name, tax_id, tax_office, email, phone, city, district, address, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
