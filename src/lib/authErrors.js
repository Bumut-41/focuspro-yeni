/** Supabase Auth / kayıt hatalarını kullanıcı diline çevirir. */
export function authErrorMessage(error, t) {
  const raw = `${error?.message || ""} ${error?.code || ""} ${error?.error || ""}`.toLowerCase();
  if (!raw.trim()) return t("common.error");

  if (
    raw.includes("email rate limit") ||
    raw.includes("over_email_send_rate_limit") ||
    raw.includes("email_rate_limit")
  ) {
    return t("auth.errEmailRateLimit");
  }
  if (raw.includes("email_taken") || raw.includes("already registered") || raw.includes("user already")) {
    return t("auth.errEmailTaken");
  }
  if (raw.includes("invalid login") || raw.includes("invalid_credentials")) {
    return t("auth.errInvalidLogin");
  }
  if (raw.includes("email not confirmed") || raw.includes("not confirmed")) {
    return t("auth.errEmailNotConfirmed");
  }
  if (raw.includes("password_too_short")) return t("auth.passwordMin");
  if (raw.includes("age_required")) return t("auth.age18Required");
  if (raw.includes("invalid_email")) return t("auth.errInvalidEmail");

  return error?.message || t("common.error");
}
