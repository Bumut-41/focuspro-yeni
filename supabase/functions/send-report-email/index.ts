import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" }
  });
}

function safeFilename(name: string) {
  return (name || "Katilimci").replace(/[^\w\u00C0-\u024F.-]+/g, "_").slice(0, 60);
}

function uniqueEmails(list: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of list) {
    const email = (raw || "").trim();
    if (!email.includes("@")) continue;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(email);
  }
  return out;
}

async function accountEmail(admin: ReturnType<typeof createClient>, userId: string) {
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error) return null;
  return data?.user?.email ?? null;
}

async function markFailed(
  admin: ReturnType<typeof createClient>,
  sessionId: string,
  code: string,
  detail?: string,
  emails?: string[]
) {
  const patch: Record<string, unknown> = {
    report_email_status: "failed",
    report_email_error_code: code,
    report_email_error_detail: detail || null
  };
  if (emails?.length) patch.report_email_to = emails.join(", ");
  await admin.from("test_sessions").update(patch).eq("id", sessionId).is("report_email_sent_at", null);
}

function emailContent(locale: string, participantName: string) {
  if (locale === "en") {
    return {
      subject: `FocusProLab — Test report: ${participantName}`,
      html: `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#1e293b">
        <p>Hello,</p>
        <p>Your FocusProLab attention test for <strong>${participantName}</strong> is complete.</p>
        <p>The test report PDF is attached. Results are not shown on screen after the test.</p>
        <p style="color:#64748b;font-size:13px">This message was sent automatically. This report is for screening only and does not constitute a diagnosis.</p>
        <p>— FocusProLab</p>
      </div>`
    };
  }
  if (locale === "it") {
    return {
      subject: `FocusProLab — Report del test: ${participantName}`,
      html: `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#1e293b">
        <p>Buongiorno,</p>
        <p>Il test di attenzione FocusProLab per <strong>${participantName}</strong> è completato.</p>
        <p>Il PDF del report è allegato. Dopo il test il risultato non compare sullo schermo.</p>
        <p style="color:#64748b;font-size:13px">Questo messaggio è stato inviato automaticamente. Il report serve solo allo screening e non costituisce una diagnosi.</p>
        <p>— FocusProLab</p>
      </div>`
    };
  }
  return {
    subject: `FocusProLab — Test raporu: ${participantName}`,
    html: `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#1e293b">
      <p>Merhaba,</p>
      <p><strong>${participantName}</strong> için FocusProLab dikkat testiniz tamamlandı.</p>
      <p>Test raporu PDF dosyası bu e-postanın ekinde yer almaktadır. Test bitince sonuç ekranda gösterilmez.</p>
      <p style="color:#64748b;font-size:13px">Bu mesaj otomatik gönderilmiştir. Rapor yalnızca ön değerlendirme amaçlıdır; tanı koymaz.</p>
      <p>— FocusProLab</p>
    </div>`
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  let sessionIdForFail: string | null = null;
  let adminForFail: ReturnType<typeof createClient> | null = null;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceKey) {
      return json({ error: "server misconfigured" }, 500);
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const {
      data: { user },
      error: userErr
    } = await userClient.auth.getUser();
    if (userErr || !user?.email) {
      return json({ error: "unauthorized" }, 401);
    }

    const { sessionId, locale = "tr", clientId = null } = await req.json();
    if (!sessionId) {
      return json({ error: "sessionId required" }, 400);
    }
    sessionIdForFail = sessionId;

    const admin = createClient(supabaseUrl, serviceKey);
    adminForFail = admin;
    const { data: session, error: sessErr } = await admin
      .from("test_sessions")
      .select("id, owner_id, taker_id, participant_name, pdf_path, report_email_sent_at, report_email_to")
      .eq("id", sessionId)
      .maybeSingle();

    if (sessErr || !session) {
      return json({ error: "session_not_found" }, 404);
    }

    const { data: callerProfile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
    const isAdminUser = callerProfile?.role === "admin" || callerProfile?.role === "super_admin";
    const isOwner = session.owner_id === user.id;
    const isTaker = session.taker_id === user.id;
    if (!isOwner && !isTaker && !isAdminUser) {
      await markFailed(admin, sessionId, "forbidden");
      return json({ error: "forbidden" }, 403);
    }
    if (!session.pdf_path) {
      await markFailed(admin, sessionId, "pdf_not_ready");
      return json({ error: "pdf_not_ready" }, 400);
    }

    // Senaryolar: yalnızca testi yapan / danışanın maili (panel zaten psikoloğa düşer).
    // 1) Bireysel → kullanıcı maili
    // 2) Psikolog + danışan (yanında) → danışan kaydı maili
    // 3) Davet ile uzaktan → davetli (taker) maili
    let recipients: string[] = [];
    if (isAdminUser && !isOwner && !isTaker) {
      const takerEmail = session.taker_id ? await accountEmail(admin, session.taker_id) : null;
      const ownerEmail = session.owner_id ? await accountEmail(admin, session.owner_id) : null;
      recipients = uniqueEmails([takerEmail || ownerEmail]);
    } else if (isTaker) {
      recipients = uniqueEmails([user.email]);
    } else if (clientId) {
      const { data: client, error: clientErr } = await admin
        .from("specialist_clients")
        .select("email, full_name, specialist_id")
        .eq("id", clientId)
        .maybeSingle();
      if (clientErr || !client || client.specialist_id !== user.id) {
        await markFailed(admin, sessionId, "forbidden");
        return json({ error: "forbidden" }, 403);
      }
      const sameName =
        client.full_name.trim().toLocaleLowerCase("tr-TR") ===
        (session.participant_name || "").trim().toLocaleLowerCase("tr-TR");
      if (!sameName) {
        await markFailed(admin, sessionId, "forbidden");
        return json({ error: "forbidden" }, 403);
      }
      recipients = uniqueEmails([client.email]);
    } else if (session.taker_id) {
      // Davet ile yapılan test: psikolog panelinden yeniden gönderimde taker maili
      const takerEmail = await accountEmail(admin, session.taker_id);
      recipients = uniqueEmails([takerEmail]);
    } else {
      if (callerProfile?.role === "psychologist") {
        await markFailed(admin, sessionId, "recipient_required");
        return json({ error: "recipient_required" }, 400);
      }
      recipients = uniqueEmails([user.email]);
    }

    if (!recipients.length) {
      await markFailed(admin, sessionId, "recipient_required");
      return json({ error: "recipient_required" }, 400);
    }

    if (session.report_email_sent_at) {
      const to = (session.report_email_to || "").trim() || recipients.join(", ");
      // Eski kayıtlarda adres boş kaldıysa tamamla
      if (!(session.report_email_to || "").trim() && recipients.length) {
        await admin
          .from("test_sessions")
          .update({ report_email_to: to, report_email_status: "sent" })
          .eq("id", sessionId);
      }
      return json({
        ok: true,
        alreadySent: true,
        emails: recipients,
        sentAt: session.report_email_sent_at,
        to
      });
    }

    await admin
      .from("test_sessions")
      .update({
        report_email_status: "pending",
        report_email_error_code: null,
        report_email_error_detail: null
      })
      .eq("id", sessionId)
      .is("report_email_sent_at", null);

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "FocusProLab <onboarding@resend.dev>";
    if (!resendKey) {
      await markFailed(admin, sessionId, "email_not_configured", undefined, recipients);
      return json({ error: "email_not_configured" }, 503);
    }

    const { data: pdfBlob, error: dlErr } = await admin.storage.from("reports").download(session.pdf_path);
    if (dlErr || !pdfBlob) {
      await markFailed(admin, sessionId, "pdf_download_failed", dlErr?.message, recipients);
      return json({ error: "pdf_download_failed", detail: dlErr?.message }, 500);
    }

    const bytes = new Uint8Array(await pdfBlob.arrayBuffer());
    const base64 = encodeBase64(bytes);
    const participantName = session.participant_name || "Katilimci";
    const { subject, html } = emailContent(locale, participantName);
    const filename = `FocusProLab_${safeFilename(participantName)}.pdf`;
    const [primary, ...copies] = recipients;

    const mailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [primary],
        ...(copies.length ? { bcc: copies } : {}),
        subject,
        html,
        attachments: [{ filename, content: base64 }]
      })
    });

    if (!mailRes.ok) {
      const errText = await mailRes.text();
      await markFailed(admin, sessionId, "send_failed", errText.slice(0, 500), recipients);
      return json({ error: "send_failed", detail: errText }, 502);
    }

    const sentAt = new Date().toISOString();
    const to = recipients.join(", ");
    await admin
      .from("test_sessions")
      .update({
        report_email_sent_at: sentAt,
        report_email_to: to,
        report_email_status: "sent",
        report_email_error_code: null,
        report_email_error_detail: null
      })
      .eq("id", sessionId);

    return json({ ok: true, emails: recipients, sentAt, to });
  } catch (e) {
    if (adminForFail && sessionIdForFail) {
      await markFailed(adminForFail, sessionIdForFail, "unexpected", String(e)).catch(() => {});
    }
    return json({ error: "unexpected", detail: String(e) }, 500);
  }
});
