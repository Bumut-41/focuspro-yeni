import { supabase } from "../lib/supabase.js";
import { persistAllSessionPdfs } from "../lib/persistSessionPdfs.js";

/**
 * Test raporu PDF'ini oturum sahibinin kayıtlı e-postasına gönderir.
 * Supabase Edge Function: send-report-email (Resend gerekir).
 */
export async function sendSessionReportEmail(sessionId, locale = "tr", clientId = null, forceResend = false) {
  const { data, error } = await supabase.functions.invoke("send-report-email", {
    body: { sessionId, locale, clientId, forceResend: Boolean(forceResend) }
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
 * PDF kaydı (+ isteğe bağlı rapor e-postası).
 * sendEmail=false: yalnızca PDF (psikolog/uzman; mail panelden manuel).
 * sendEmail=true: bireysel test — PDF sonrası otomatik mail.
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
  clientId = null,
  sendEmail = true
}) {
  if (sendEmail) {
    try {
      await recordReportEmailStatus({ sessionId, status: "pending" });
    } catch {
      /* kolon/RPC henüz yoksa devam */
    }
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
    if (sendEmail) {
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
    }
    return {
      ok: false,
      pdfSaved: false,
      code: "pdf_not_saved",
      detail,
      email: null,
      emailSkipped: !sendEmail,
      result
    };
  }

  if (!sendEmail) {
    return {
      ok: true,
      pdfSaved: true,
      emailSkipped: true,
      email: null,
      mail: null,
      result
    };
  }

  let lastMailErr = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      if (attempt > 0) await new Promise((r) => setTimeout(r, 1000));
      const mail = await sendSessionReportEmail(sessionId, locale, clientId);
      return {
        ok: true,
        pdfSaved: true,
        emailSkipped: false,
        mail,
        email: pickDeliveredEmail(mail),
        result
      };
    } catch (err) {
      lastMailErr = err;
      // Kalıcı alıcı/yapılandırma hatalarında ikinci deneme anlamsız
      const code = err?.code || "";
      if (
        code === "recipient_required" ||
        code === "email_not_configured" ||
        code === "forbidden" ||
        code === "pdf_not_ready"
      ) {
        break;
      }
    }
  }

  const code = lastMailErr?.code || "send_failed";
  const detail = lastMailErr?.detail || lastMailErr?.message || null;
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
  return { ok: false, pdfSaved: true, emailSkipped: false, code, detail, email: null, result };
}

/**
 * @param {object} session
 * @param {function} t
 * @param {string} dateLocale
 * @param {string | null} [fallbackEmail] report_email_to boşsa (eski kayıt) gösterilecek adres
 */
export function formatReportEmailStatus(session, t, dateLocale, fallbackEmail = null) {
  if (session?.report_email_sent_at || session?.report_email_status === "sent") {
    const when = session.report_email_sent_at
      ? new Date(session.report_email_sent_at).toLocaleString(dateLocale)
      : "—";
    const email = (session.report_email_to || "").trim() || (fallbackEmail || "").trim();
    if (!email) {
      return t("admin.emailDeliveredNoAddress", { date: when });
    }
    return t("admin.emailDelivered", { date: when, email });
  }

  if (!session?.pdf_path && !session?.report_email_error_code) {
    return t("admin.emailNotDelivered", { reason: t("admin.emailErr.pdf_not_saved") });
  }

  if (session?.report_email_status === "pending") {
    return t("admin.emailPending");
  }

  if (!session?.report_email_status && !session?.report_email_error_code) {
    return t("admin.emailAwaitingManual");
  }

  const code = session?.report_email_error_code;
  const mapped = code ? t(`admin.emailErr.${code}`) : "";
  let reason = mapped && mapped !== `admin.emailErr.${code}` ? mapped : code || t("admin.emailErr.unexpected");
  if (session?.report_email_error_detail) {
    reason = `${reason} (${session.report_email_error_detail})`;
  }
  return t("admin.emailNotDelivered", { reason });
}
