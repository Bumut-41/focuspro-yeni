/** Sistemdeki kullanıcı rolleri (profiles.role = user_role enum). */

export const USER_ROLES = ["super_admin", "admin", "psychologist", "individual"];

/** Normal yönetici super_admin atayamaz. */
export const ROLES_ASSIGNABLE_BY_ADMIN = ["admin", "psychologist", "individual"];

export const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Yönetici",
  psychologist: "Psikolog",
  individual: "Bireysel"
};

/** Yönetim paneli + tüm admin RPC/RLS yetkileri (is_admin). */
export const ADMIN_PANEL_ROLES = ["admin", "super_admin"];

export const ROLE_DESCRIPTIONS = {
  super_admin:
    "Yöneticinin TÜM yetkileri (panel, tüm testler, kredi ekleme, rol atama, basış raporları) + manuel kredi, kullanıcı silme, Super Admin atama.",
  admin:
    "Yönetim paneli, tüm testler ve kullanıcılar, kredi ekleme, rol atama, basış raporları.",
  psychologist: "Test uygular, kendi panelinde kendi test kayıtlarını ve raporlarını görür.",
  individual: "Test uygular, kendi panelinde yalnızca kendi test kayıtlarını görür."
};

export function roleLabel(role) {
  return ROLE_LABELS[role] ?? role ?? "—";
}

/** Yönetim paneli ve admin API erişimi (super_admin dahil). */
export function hasAdminAccess(role) {
  return ADMIN_PANEL_ROLES.includes(role);
}

export function assignableRoles(isSuperAdmin) {
  return isSuperAdmin ? USER_ROLES : ROLES_ASSIGNABLE_BY_ADMIN;
}

export function formatRoleError(err) {
  const code = err?.message ?? "";
  if (code.includes("cannot_change_own_role")) {
    return "Kendi rolünüzü bu ekrandan değiştiremezsiniz.";
  }
  if (code.includes("forbidden_super_admin_role")) {
    return "Super Admin rolünü yalnızca mevcut bir Super Admin atayabilir.";
  }
  if (code.includes("cannot_delete_self")) return "Kendi hesabınızı silemezsiniz.";
  if (code.includes("delete_failed")) {
    return "Kullanıcı silinemedi. Supabase'te super-admin-fix-delete.sql çalıştırıldı mı?";
  }
  if (code.includes("forbidden")) return "Bu işlem için yetkiniz yok.";
  if (code.includes("user_not_found")) return "Kullanıcı bulunamadı.";
  return err?.message || "İşlem başarısız.";
}
