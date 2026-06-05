import { supabase } from "../lib/supabase.js";

export async function purchaseTestCredits(amount) {
  const { data, error } = await supabase.rpc("purchase_test_credits", { p_amount: amount });
  if (error) throw error;
  return data;
}

export async function adminAddCredits(userId, amount) {
  const { data, error } = await supabase.rpc("admin_add_credits", {
    p_user_id: userId,
    p_amount: amount
  });
  if (error) throw error;
  return data;
}

/** Admin: kullanıcı rolü (admin / psychologist / individual). */
export async function adminSetUserRole(userId, role) {
  const { data, error } = await supabase.rpc("admin_set_user_role", {
    p_user_id: userId,
    p_role: role
  });
  if (error) throw error;
  return data;
}

export async function fetchAllProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, test_credits, birth_date, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
