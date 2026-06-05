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
  const { data, error } = await supabase.rpc("admin_list_profiles");
  if (!error) return data ?? [];
  const fallback = await supabase
    .from("profiles")
    .select("id, full_name, role, test_credits, birth_date, created_at")
    .order("created_at", { ascending: false });
  if (fallback.error) throw fallback.error;
  return (fallback.data ?? []).map((p) => ({ ...p, email: null }));
}

/** Super admin: krediyi doğrudan ayarlar. */
export async function superAdminSetCredits(userId, credits) {
  const { data, error } = await supabase.rpc("super_admin_set_credits", {
    p_user_id: userId,
    p_credits: credits
  });
  if (error) throw error;
  return data;
}

/** Super admin: kullanıcının Storage PDF'lerini siler (SQL ile silinemez). */
async function deleteUserReportPdfs(userId) {
  const paths = new Set();

  const { data: sessions, error: sessionsError } = await supabase
    .from("test_sessions")
    .select("pdf_path, admin_pdf_path")
    .eq("owner_id", userId);
  if (sessionsError) throw sessionsError;

  for (const row of sessions ?? []) {
    if (row.pdf_path) paths.add(row.pdf_path);
    if (row.admin_pdf_path) paths.add(row.admin_pdf_path);
  }

  const { data: listed, error: listError } = await supabase.storage.from("reports").list(userId, {
    limit: 1000
  });
  if (listError) {
    const msg = listError.message ?? "";
    if (!/not found|does not exist/i.test(msg)) throw listError;
  } else {
    for (const file of listed ?? []) {
      if (file?.name) paths.add(`${userId}/${file.name}`);
    }
  }

  const pathList = [...paths];
  if (!pathList.length) return;

  const { error: removeError } = await supabase.storage.from("reports").remove(pathList);
  if (removeError) throw removeError;
}

/** Super admin: kullanıcıyı siler (önce PDF'ler, sonra veritabanı). */
export async function superAdminDeleteUser(userId) {
  await deleteUserReportPdfs(userId);
  const { error } = await supabase.rpc("super_admin_delete_user", {
    p_user_id: userId
  });
  if (error) throw error;
}
