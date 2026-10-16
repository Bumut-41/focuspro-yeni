import { supabase } from "../lib/supabase.js";
import { persistAllSessionPdfs } from "../lib/persistSessionPdfs.js";

/**
 * Test raporu PDF'ini oturum sahibinin kayıtlı e-postasına gönderir.
 * Supabase Edge Function: send-report-email (Resend gerekir).
 */
export async function sendSessionReportEmail(sessionId, locale = "tr", clientId = null) {
  const { data, error } = await supabase.functions.invoke("send-report-email", {
    body: { sessionId, locale, clientId }
  });

  if (error) {
    throw Object.assign(new Error(error.message || "E-posta gönderilemedi."), {
      code: "invoke_failed",
      detail: error.message
    });
  }
  if (data?.error) {
    throw Object.assign(new Error(data.detail || data.error), {
      code: data.error,
      detail: data.detail || null
    });
  }
  return data;
}

export async function recordReportEmailStatus({
  sessionId,
  status,
  emails = null,
  errorCode = null,
  errorDetail = null
}) {
  const { error } = await supabase.rpc("record_report_email_status", {
    p_session_id: sessionId,
    p_status: status,
    p_emails: emails,
    p_error_code: errorCode,
    p_error_detail: errorDetail
  });
  if (error) throw error;
}

function pickDeliveredEmail(mail) {
  if (Array.isArray(mail?.emails) && mail.emails[0]) return mail.emails[0];
  if (typeof mail?.to === "string" && mail.to.includes("@")) {
    return mail.to.split(",")[0].trim();
  }
  return null;
}

/**
 * PDF kaydı + rapor e-postası. Başarı/başarısızlık test_sessions'a yazılır.
 * Test bitince PDF zorunlu: önce PDF (gerekirse 2 tur), sonra mail.
 */
export async function deliverSessionReport({
  userId,
  sessionId,
  participant,
  profile,
  logs,
  target,
  pressTimeline = [],
  locale = "tr",
  clientId = null
}) {
  try {
    await recordReportEmailStatus({ sessionId, status: "pending" });
  } catch {
    /* kolon/RPC henüz yoksa devam */
  }

  const persistArgs = {
    userId,
    sessionId,
    participant,
    profile,
    logs,
    target,
    pressTimeline,
    locale,
    // Test raporu her zaman; basış timeline varsa admin PDF de otomatik
    saveAdminPdf: Array.isArray(pressTimeline) && pressTimeline.length > 0
  };

  let result = await persistAllSessionPdfs(persistArgs);
  if (!result.testSaved) {
    await new Promise((r) => setTimeout(r, 900));
    result = await persistAllSessionPdfs(persistArgs);
  }

  if (!result.testSaved) {
    const detail = result.errors?.join(" ") || null;
    try {
      await recordReportEmailStatus({
        sessionId,
        status: "failed",
        errorCode: "pdf_not_saved",
        errorDetail: detail
      });
    } catch {
      /* ignore */
    }
    return {
      ok: false,
      pdfSaved: false,
      code: "pdf_not_saved",
      detail,
      email: null,
      result
    };
  }

  try {
    const mail = await sendSessionReportEmail(sessionId, locale, clientId);
    return {
      ok: true,
      pdfSaved: true,
      mail,
      email: pickDeliveredEmail(mail),
      result
    };
  } catch (err) {
    const code = err?.code || "send_failed";
    const detail = err?.detail || err?.message || null;
    try {
      await recordReportEmailStatus({
        sessionId,
        status: "failed",
        errorCode: code,
        errorDetail: detail
      });
    } catch {
      /* edge function already wrote status */
    }
    // PDF kaydı başarılı; mail ayrı sorun
    return { ok: false, pdfSaved: true, code, detail, email: null, result };
  }
}

export function formatReportEmailStatus(session, t, dateLocale) {
  if (session?.report_email_sent_at || session?.report_email_status === "sent") {
    const when = session.report_email_sent_at
      ? new Date(session.report_email_sent_at).toLocaleString(dateLocale)
      : "—";
    const email = session.report_email_to || "—";
    return t("admin.emailDelivered", { date: when, email });
  }

  if (!session?.pdf_path && !session?.report_email_error_code) {
    return t("admin.emailNotDelivered", { reason: t("admin.emailErr.pdf_not_saved") });
  }

  if (session?.report_email_status === "pending") {
    return t("admin.emailPending");
  }

  const code = session?.report_email_error_code;
  const mapped = code ? t(`admin.emailErr.${code}`) : "";
  let reason = mapped && mapped !== `admin.emailErr.${code}` ? mapped : code || t("admin.emailErr.unexpected");
  if (session?.report_email_error_detail) {
    reason = `${reason} (${session.report_email_error_detail})`;
  }
  return t("admin.emailNotDelivered", { reason });
}
