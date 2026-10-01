import { supabase } from "../lib/supabase.js";

export async function fetchContactMessages(limit = 200) {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, full_name, email, phone, profession, organization, location, subject, message, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
