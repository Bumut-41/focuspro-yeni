import { supabase } from "../lib/supabase.js";

/**
 * Test raporu PDF'ini oturum sahibinin kayıtlı e-postasına gönderir.
 * Supabase Edge Function: send-report-email (Resend gerekir).
 */
export async function sendSessionReportEmail(sessionId, locale = "tr") {
  const { data, error } = await supabase.functions.invoke("send-report-email", {
    body: { sessionId, locale }
  });

  if (error) {
    throw new Error(error.message || "E-posta gönderilemedi.");
  }
  if (data?.error) {
    const code = data.error;
    if (code === "email_not_configured") {
      throw new Error("email_not_configured");
    }
    throw new Error(data.detail || code);
  }
  return data;
}
