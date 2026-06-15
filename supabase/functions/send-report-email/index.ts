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

function emailContent(locale: string, participantName: string) {
  if (locale === "en") {
    return {
      subject: `FocusProLab — Test report: ${participantName}`,
      html: `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#1e293b">
        <p>Hello,</p>
        <p>Your FocusProLab attention test for <strong>${participantName}</strong> is complete.</p>
        <p>The participant report PDF is attached to this email. You can also open it from your dashboard.</p>
        <p style="color:#64748b;font-size:13px">This message was sent automatically. This report is for screening only and does not constitute a diagnosis.</p>
        <p>— FocusProLab</p>
      </div>`
    };
  }
  return {
    subject: `FocusProLab — Test raporu: ${participantName}`,
    html: `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#1e293b">
      <p>Merhaba,</p>
      <p><strong>${participantName}</strong> için FocusProLab dikkat testiniz tamamlandı.</p>
      <p>Katılımcı test raporu PDF dosyası bu e-postanın ekinde yer almaktadır. Panele girerek de raporu açabilirsiniz.</p>
      <p style="color:#64748b;font-size:13px">Bu mesaj otomatik gönderilmiştir. Rapor yalnızca ön değerlendirme amaçlıdır; tanı koymaz.</p>
      <p>— FocusProLab</p>
    </div>`
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

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

    const { sessionId, locale = "tr" } = await req.json();
    if (!sessionId) {
      return json({ error: "sessionId required" }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: session, error: sessErr } = await admin
      .from("test_sessions")
      .select("id, owner_id, participant_name, pdf_path, report_email_sent_at")
      .eq("id", sessionId)
      .maybeSingle();

    if (sessErr || !session) {
      return json({ error: "session_not_found" }, 404);
    }
    if (session.owner_id !== user.id) {
      return json({ error: "forbidden" }, 403);
    }
    if (!session.pdf_path) {
      return json({ error: "pdf_not_ready" }, 400);
    }
    if (session.report_email_sent_at) {
      return json({ ok: true, alreadySent: true, email: user.email });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "FocusProLab <onboarding@resend.dev>";
    if (!resendKey) {
      return json({ error: "email_not_configured" }, 503);
    }

    const { data: pdfBlob, error: dlErr } = await admin.storage.from("reports").download(session.pdf_path);
    if (dlErr || !pdfBlob) {
      return json({ error: "pdf_download_failed", detail: dlErr?.message }, 500);
    }

    const bytes = new Uint8Array(await pdfBlob.arrayBuffer());
    const base64 = encodeBase64(bytes);
    const participantName = session.participant_name || "Katilimci";
    const { subject, html } = emailContent(locale, participantName);
    const filename = `FocusProLab_${safeFilename(participantName)}.pdf`;

    const mailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [user.email],
        subject,
        html,
        attachments: [{ filename, content: base64 }]
      })
    });

    if (!mailRes.ok) {
      const errText = await mailRes.text();
      return json({ error: "send_failed", detail: errText }, 502);
    }

    await admin
      .from("test_sessions")
      .update({ report_email_sent_at: new Date().toISOString() })
      .eq("id", sessionId)
      .eq("owner_id", user.id);

    return json({ ok: true, email: user.email });
  } catch (e) {
    return json({ error: "unexpected", detail: String(e) }, 500);
  }
});
