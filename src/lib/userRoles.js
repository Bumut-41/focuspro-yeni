import { getStrings } from "../i18n/index.js";

/** Sistemdeki kullanıcı rolleri (profiles.role = user_role enum). */

export const USER_ROLES = ["super_admin", "admin", "psychologist", "individual"];

/** Normal yönetici super_admin atayamaz. */
export const ROLES_ASSIGNABLE_BY_ADMIN = ["admin", "psychologist", "individual"];

/** Yönetim paneli + tüm admin RPC/RLS yetkileri (is_admin). */
export const ADMIN_PANEL_ROLES = ["admin", "super_admin"];

export function roleLabel(role, locale = "tr") {
  const labels = getStrings(locale).roles;
  return labels[role] ?? role ?? "—";
}

export function roleDescription(role, locale = "tr") {
  return getStrings(locale).roles.descriptions[role] ?? "";
}

/** Yönetim paneli ve admin API erişimi (super_admin dahil). */
export function hasAdminAccess(role) {
  return ADMIN_PANEL_ROLES.includes(role);
}

export function assignableRoles(isSuperAdmin) {
  return isSuperAdmin ? USER_ROLES : ROLES_ASSIGNABLE_BY_ADMIN;
}

export function formatRoleError(err, locale = "tr") {
  const e = getStrings(locale).roles.errors;
  const code = err?.message ?? "";
  if (code.includes("cannot_change_own_role")) return e.cannotChangeOwnRole;
  if (code.includes("forbidden_super_admin_role")) return e.forbiddenSuperAdmin;
  if (code.includes("cannot_delete_self")) return e.cannotDeleteSelf;
  if (code.includes("delete_failed")) {
    const detail = code.replace(/^.*delete_failed:\s*/i, "").trim();
    if (detail && !detail.startsWith("delete_failed")) {
      return e.deleteFailedDetail.replace("{{detail}}", detail);
    }
    return e.deleteFailed;
  }
  if (code.includes("permission denied") || code.includes("42501")) return e.permissionDenied;
  if (code.includes("forbidden")) return e.forbidden;
  if (code.includes("user_not_found")) return e.userNotFound;
  return err?.message || e.generic;
}
