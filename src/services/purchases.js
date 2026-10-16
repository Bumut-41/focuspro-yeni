import { supabase } from "../lib/supabase.js";
import { triggerBlobDownload } from "../lib/triggerBlobDownload.js";

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

function csvCell(value) {
  const text = value == null ? "" : String(value);
  if (text.startsWith("=")) return text;
  if (/[;"\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function excelText(value) {
  const text = value == null ? "" : String(value).trim();
  if (!text) return "";
  return `="${text.replace(/"/g, '""')}"`;
}

export function downloadPurchasesCsv(rows, labels) {
  const header = [
    labels.date,
    labels.invoiceType,
    labels.name,
    labels.taxId,
    labels.taxOffice,
    labels.email,
    labels.phone,
    labels.city,
    labels.district,
    labels.address,
    labels.quantity,
    labels.unitPrice,
    labels.total,
    labels.id
  ];
  const lines = [header.map(csvCell).join(";")];
  for (const row of rows) {
    const typeLabel = row.invoice_type === "company" ? labels.company : labels.individual;
    lines.push(
      [
        row.created_at ? new Date(row.created_at).toLocaleString("tr-TR") : "",
        typeLabel,
        row.invoice_name || "",
        excelText(row.tax_id),
        row.tax_office || "",
        row.email || "",
        excelText(row.phone),
        row.city || "",
        row.district || "",
        row.address || "",
        row.quantity ?? "",
        row.unit_price_tl ?? "",
        row.total_tl ?? "",
        row.id || ""
      ]
        .map(csvCell)
        .join(";")
    );
  }
  const blob = new Blob([`\uFEFF${lines.join("\r\n")}`], { type: "text/csv;charset=utf-8" });
  const day = new Date().toISOString().slice(0, 10);
  triggerBlobDownload(blob, `focusprolab-faturalar-${day}.csv`);
}

export const SPECIALIST_VAT_RATE = 20;

export const SPECIALIST_PACKS = [
  { quantity: 10, unitPriceTl: 1000 },
  { quantity: 20, unitPriceTl: 900 },
  { quantity: 50, unitPriceTl: 800 },
  { quantity: 100, unitPriceTl: 700 }
];

export function specialistPackTotals(pack) {
  const net = pack.quantity * pack.unitPriceTl;
  const vat = Math.round((net * SPECIALIST_VAT_RATE) / 100);
  return { net, vat, total: net + vat, vatRate: SPECIALIST_VAT_RATE };
}

export async function purchaseSpecialistTests(input) {
  const { data, error } = await supabase.rpc("purchase_specialist_tests", {
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

export async function fetchSpecialistPurchases(limit = 5000) {
  const { data, error } = await supabase
    .from("specialist_test_purchases")
    .select(
      "id, quantity, unit_price_tl, net_tl, vat_rate, vat_tl, total_tl, invoice_type, invoice_name, tax_id, tax_office, email, phone, city, district, address, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export function downloadSpecialistPurchasesCsv(rows, labels) {
  const header = [
    labels.date,
    labels.invoiceType,
    labels.name,
    labels.taxId,
    labels.taxOffice,
    labels.email,
    labels.phone,
    labels.city,
    labels.district,
    labels.address,
    labels.quantity,
    labels.unitPrice,
    labels.net,
    labels.vatRate,
    labels.vat,
    labels.total,
    labels.id
  ];
  const lines = [header.map(csvCell).join(";")];
  for (const row of rows) {
    const typeLabel = row.invoice_type === "company" ? labels.company : labels.individual;
    lines.push(
      [
        row.created_at ? new Date(row.created_at).toLocaleString("tr-TR") : "",
        typeLabel,
        row.invoice_name || "",
        excelText(row.tax_id),
        row.tax_office || "",
        row.email || "",
        excelText(row.phone),
        row.city || "",
        row.district || "",
        row.address || "",
        row.quantity ?? "",
        row.unit_price_tl ?? "",
        row.net_tl ?? "",
        row.vat_rate ?? "",
        row.vat_tl ?? "",
        row.total_tl ?? "",
        row.id || ""
      ]
        .map(csvCell)
        .join(";")
    );
  }
  const blob = new Blob([`\uFEFF${lines.join("\r\n")}`], { type: "text/csv;charset=utf-8" });
  const day = new Date().toISOString().slice(0, 10);
  triggerBlobDownload(blob, `focusprolab-uzman-faturalar-${day}.csv`);
}
