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

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: session, error: sessErr } = await admin
      .from("test_sessions")
      .select("id, owner_id, taker_id, participant_name, pdf_path, report_email_sent_at")
      .eq("id", sessionId)
      .maybeSingle();

    if (sessErr || !session) {
      return json({ error: "session_not_found" }, 404);
    }

    const isOwner = session.owner_id === user.id;
    const isTaker = session.taker_id === user.id;
    if (!isOwner && !isTaker) {
      return json({ error: "forbidden" }, 403);
    }
    if (!session.pdf_path) {
      return json({ error: "pdf_not_ready" }, 400);
    }

    let toEmail = user.email;
    if (isTaker) {
      toEmail = user.email;
    } else if (clientId) {
      const { data: client, error: clientErr } = await admin
        .from("specialist_clients")
        .select("email, full_name, specialist_id")
        .eq("id", clientId)
        .maybeSingle();
      if (clientErr || !client || client.specialist_id !== user.id) {
        return json({ error: "forbidden" }, 403);
      }
      const sameName =
        client.full_name.trim().toLocaleLowerCase("tr-TR") ===
        (session.participant_name || "").trim().toLocaleLowerCase("tr-TR");
      if (!sameName) {
        return json({ error: "forbidden" }, 403);
      }
      toEmail = client.email;
    } else {
      const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (profile?.role === "psychologist") {
        return json({ error: "recipient_required" }, 400);
      }
      toEmail = user.email;
    }

    if (session.report_email_sent_at) {
      return json({ ok: true, alreadySent: true, email: toEmail });
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
        to: [toEmail],
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
      .eq("id", sessionId);

    return json({ ok: true, email: toEmail });
  } catch (e) {
    return json({ error: "unexpected", detail: String(e) }, 500);
  }
});
