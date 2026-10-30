import { supabase } from "../lib/supabase.js";

const CLIENT_COLUMNS =
  "id, specialist_id, full_name, birth_date, gender, email, phone, address, notes, guardian_consent, created_at";

function normalizeClientEmail(email) {
  const value = String(email ?? "").trim().toLowerCase();
  return value || null;
}

function normalizeOptionalText(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

function clientPayload(client) {
  return {
    full_name: String(client.fullName ?? "").trim(),
    birth_date: client.birthDate,
    gender: client.gender,
    email: normalizeClientEmail(client.email),
    phone: normalizeOptionalText(client.phone),
    address: normalizeOptionalText(client.address),
    notes: normalizeOptionalText(client.notes),
    guardian_consent: Boolean(client.guardianConsent)
  };
}

export async function fetchMyClients() {
  const { data, error } = await supabase
    .from("specialist_clients")
    .select(CLIENT_COLUMNS)
    .order("full_name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createClient(client) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const specialistId = userData.user?.id;
  if (!specialistId) throw new Error("forbidden");

  const { data, error } = await supabase
    .from("specialist_clients")
    .insert({
      specialist_id: specialistId,
      ...clientPayload(client)
    })
    .select(CLIENT_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}

/** Danışan kaydını güncelle (ad, doğum, cinsiyet, e-posta, telefon, adres, not). */
export async function updateClient(clientId, client) {
  const payload = clientPayload(client);
  if (!payload.full_name) throw new Error("invalid_name");
  if (!payload.birth_date) throw new Error("invalid_birth");
  if (!payload.gender) throw new Error("invalid_gender");

  const { data, error } = await supabase
    .from("specialist_clients")
    .update(payload)
    .eq("id", clientId)
    .select(CLIENT_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}

export async function updateClientEmail(clientId, email) {
  const normalized = normalizeClientEmail(email);
  if (!normalized) throw new Error("invalid_email");
  const { data, error } = await supabase
    .from("specialist_clients")
    .update({ email: normalized })
    .eq("id", clientId)
    .select(CLIENT_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}

/** Psikolog kendi danışanını; süper admin herhangi birini silebilir (RLS). */
export async function deleteClient(clientId) {
  const { error } = await supabase.from("specialist_clients").delete().eq("id", clientId);
  if (error) throw error;
}

/** Süper admin — tüm danışanlar (specialist adı ile). */
export async function fetchAllClientsForAdmin({ limit = 500 } = {}) {
  const { data, error } = await supabase
    .from("specialist_clients")
    .select(
      `${CLIENT_COLUMNS}, specialist:profiles!specialist_id(full_name, email)`
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
