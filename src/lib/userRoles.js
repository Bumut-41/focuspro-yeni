/** Sistemdeki kullanıcı rolleri (profiles.role = user_role enum). */

export const USER_ROLES = ["admin", "psychologist", "individual"];

export const ROLE_LABELS = {
  admin: "Yönetici",
  psychologist: "Psikolog",
  individual: "Bireysel"
};

export const ROLE_DESCRIPTIONS = {
  admin:
    "Yönetim paneli, tüm testler ve kullanıcılar, kredi/rol atama, basış raporları (tam yetki).",
  psychologist: "Test uygular, kendi panelinde kendi test kayıtlarını ve raporlarını görür.",
  individual: "Test uygular, kendi panelinde yalnızca kendi test kayıtlarını görür."
};

export function roleLabel(role) {
  return ROLE_LABELS[role] ?? role ?? "—";
}

export function formatRoleError(err) {
  const code = err?.message ?? "";
  if (code.includes("cannot_demote_self")) {
    return "Kendi yönetici rolünüzü kaldıramazsınız.";
  }
  if (code.includes("forbidden")) return "Bu işlem için yönetici yetkisi gerekir.";
  if (code.includes("user_not_found")) return "Kullanıcı bulunamadı.";
  return err?.message || "Rol güncellenemedi.";
}
