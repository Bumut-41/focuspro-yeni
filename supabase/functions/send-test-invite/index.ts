import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

function emailContent(
  locale: string,
  psychologistName: string,
  inviteUrl: string,
  expiresAt: string
) {
  const expires = new Date(expiresAt).toLocaleString(locale === "en" ? "en-US" : "tr-TR", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  if (locale === "en") {
    return {
      subject: "FocusProLab — Attention test invitation",
      html: `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#1e293b">
        <p>Hello,</p>
        <p><strong>${psychologistName}</strong> has invited you to complete a FocusProLab attention assessment.</p>
        <p><a href="${inviteUrl}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Open invitation</a></p>
        <p style="font-size:14px;color:#64748b">This link is valid until <strong>${expires}</strong> (3 days). Please register or sign in with the email address this invitation was sent to.</p>
        <p style="color:#64748b;font-size:13px">Test results are shared only with your clinician. This assessment is for screening purposes only and does not constitute a diagnosis.</p>
        <p>— FocusProLab</p>
      </div>`
    };
  }

  return {
    subject: "FocusProLab — Dikkat testi daveti",
    html: `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#1e293b">
      <p>Merhaba,</p>
      <p><strong>${psychologistName}</strong> sizi FocusProLab dikkat değerlendirmesine davet etti.</p>
      <p><a href="${inviteUrl}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Daveti aç</a></p>
      <p style="font-size:14px;color:#64748b">Bu bağlantı <strong>${expires}</strong> tarihine kadar geçerlidir (3 gün). Lütfen davetin gönderildiği e-posta adresiyle kayıt olun veya giriş yapın.</p>
      <p style="color:#64748b;font-size:13px">Test sonuçları yalnızca sizi yönlendiren uzmanınızla paylaşılır. Bu değerlendirme yalnızca ön tarama amaçlıdır; tanı koymaz.</p>
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
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://focuspro-yeni.vercel.app";

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
    if (userErr || !user?.id) {
      return json({ error: "unauthorized" }, 401);
    }

    const { inviteId, locale = "tr" } = await req.json();
    if (!inviteId) {
      return json({ error: "inviteId required" }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: invite, error: invErr } = await admin
      .from("test_invites")
      .select("id, token, recipient_email, psychologist_id, expires_at, status")
      .eq("id", inviteId)
      .maybeSingle();

    if (invErr || !invite) {
      return json({ error: "invite_not_found" }, 404);
    }
    if (invite.psychologist_id !== user.id) {
      return json({ error: "forbidden" }, 403);
    }
    if (invite.status !== "pending") {
      return json({ error: "invite_invalid_status" }, 400);
    }

    const { data: psych } = await admin
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle();

    if (psych?.role !== "psychologist") {
      return json({ error: "forbidden" }, 403);
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "FocusProLab <onboarding@resend.dev>";
    if (!resendKey) {
      return json({ error: "email_not_configured" }, 503);
    }

    const inviteUrl = `${siteUrl.replace(/\/$/, "")}/davet/${invite.token}`;
    const psychologistName = psych.full_name || "Uzmanınız";
    const { subject, html } = emailContent(locale, psychologistName, inviteUrl, invite.expires_at);

    const mailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [invite.recipient_email],
        subject,
        html
      })
    });

    if (!mailRes.ok) {
      const errText = await mailRes.text();
      return json({ error: "send_failed", detail: errText }, 502);
    }

    return json({ ok: true, email: invite.recipient_email });
  } catch (e) {
    return json({ error: "unexpected", detail: String(e) }, 500);
  }
});
