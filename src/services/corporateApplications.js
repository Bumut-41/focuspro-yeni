import { supabase } from "../lib/supabase.js";

export async function fetchCorporateApplications(limit = 200) {
  const { data, error } = await supabase
    .from("corporate_applications")
    .select(
      "id, organization_name, contact_name, role, phone, email, country_code, city, institution_type, expert_count, monthly_clients, message, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
