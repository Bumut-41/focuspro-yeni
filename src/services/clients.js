import { supabase } from "../lib/supabase.js";

export async function fetchMyClients() {
  const { data, error } = await supabase
    .from("specialist_clients")
    .select("id, full_name, birth_date, gender, email, guardian_consent, created_at")
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
      full_name: client.fullName.trim(),
      birth_date: client.birthDate,
      gender: client.gender,
      email: client.email.trim().toLowerCase(),
      guardian_consent: Boolean(client.guardianConsent)
    })
    .select("id, full_name, birth_date, gender, email, guardian_consent, created_at")
    .single();
  if (error) throw error;
  return data;
}
