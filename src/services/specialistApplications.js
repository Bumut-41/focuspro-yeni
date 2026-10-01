import { supabase } from "../lib/supabase.js";

export async function fetchSpecialistApplications(limit = 200) {
  const { data, error } = await supabase
    .from("specialist_applications")
    .select("id, full_name, profession, phone, email, country_code, city, workplace, message, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
