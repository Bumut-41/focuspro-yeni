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
  const expires = new Date(expiresAt).toLocaleString(
    locale === "en" ? "en-US" : locale === "it" ? "it-IT" : "tr-TR",
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  );

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

  if (locale === "it") {
    return {
      subject: "FocusProLab — Invito al test di attenzione",
      html: `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#1e293b">
        <p>Buongiorno,</p>
        <p><strong>${psychologistName}</strong> ti ha invitato a completare una valutazione dell'attenzione FocusProLab.</p>
        <p><a href="${inviteUrl}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Apri l'invito</a></p>
        <p style="font-size:14px;color:#64748b">Questo link è valido fino al <strong>${expires}</strong> (3 giorni). Registrati o accedi con l'indirizzo e-mail a cui è stato inviato l'invito.</p>
        <p style="color:#64748b;font-size:13px">I risultati del test sono condivisi solo con il tuo specialista. Questa valutazione serve solo allo screening e non costituisce una diagnosi.</p>
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

const ALLOWED_SITES = new Set([
  "https://focuspro-yeni.vercel.app",
  "https://focusprolab.com",
  "https://www.focusprolab.com",
  "https://italy.focusprolab.com",
  "https://uk.focusprolab.com"
]);

function allowedSiteUrl(requested: string, fallback: string) {
  try {
    const url = new URL(requested);
    const origin = url.origin;
    if (ALLOWED_SITES.has(origin)) return origin;
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return origin;
  } catch {
    /* ignore invalid origins */
  }
  return fallback.replace(/\/$/, "");
}

async function markEmailStatus(
  admin: ReturnType<typeof createClient>,
  inviteId: string,
  status: "pending" | "sent" | "failed",
  errorCode: string | null = null,
  errorDetail: string | null = null,
  providerId: string | null = null
) {
  const patch: Record<string, unknown> = {
    invite_email_status: status
  };
  if (status === "sent") {
    patch.invite_email_sent_at = new Date().toISOString();
    patch.invite_email_error_code = null;
    patch.invite_email_error_detail = null;
  }
  if (status === "pending") {
    patch.invite_email_error_code = null;
    patch.invite_email_error_detail = null;
  }
  if (status === "failed") {
    patch.invite_email_error_code = (errorCode || "send_failed").slice(0, 120);
    patch.invite_email_error_detail = (errorDetail || "").slice(0, 500);
  }
  if (providerId) patch.invite_email_provider_id = providerId;
  await admin.from("test_invites").update(patch).eq("id", inviteId);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  let inviteIdForFail: string | null = null;
  let adminClient: ReturnType<typeof createClient> | null = null;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const fallbackSite = Deno.env.get("SITE_URL") ?? "https://focuspro-yeni.vercel.app";

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

    const { inviteId, locale = "tr", siteUrl: requestedSite = "" } = await req.json();
    const siteUrl = allowedSiteUrl(requestedSite, fallbackSite);
    if (!inviteId) {
      return json({ error: "inviteId required" }, 400);
    }
    inviteIdForFail = inviteId;

    const admin = createClient(supabaseUrl, serviceKey);
    adminClient = admin;

    const { data: invite, error: invErr } = await admin
      .from("test_invites")
      .select("id, token, recipient_email, psychologist_id, expires_at, status")
      .eq("id", inviteId)
      .maybeSingle();

    if (invErr || !invite) {
      return json({ error: "invite_not_found" }, 404);
    }

    const { data: caller } = await admin
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin = caller?.role === "admin" || caller?.role === "super_admin";
    const isOwner = invite.psychologist_id === user.id && caller?.role === "psychologist";
    if (!isAdmin && !isOwner) {
      return json({ error: "forbidden" }, 403);
    }

    if (invite.status !== "pending") {
      await markEmailStatus(admin, inviteId, "failed", "invite_invalid_status", invite.status);
      return json({ error: "invite_invalid_status" }, 400);
    }

    await markEmailStatus(admin, inviteId, "pending");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "FocusProLab <onboarding@resend.dev>";
    if (!resendKey) {
      await markEmailStatus(admin, inviteId, "failed", "email_not_configured", null);
      return json({ error: "email_not_configured" }, 503);
    }

    const { data: psych } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", invite.psychologist_id)
      .maybeSingle();

    const inviteUrl = `${siteUrl.replace(/\/$/, "")}/davet/${invite.token}`;
    const psychologistName =
      psych?.full_name || (locale === "it" ? "Il tuo specialista" : "Uzmanınız");
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
      await markEmailStatus(admin, inviteId, "failed", "send_failed", errText.slice(0, 500));
      return json({ error: "send_failed", detail: errText }, 502);
    }

    let providerId: string | null = null;
    try {
      const mailJson = await mailRes.json();
      providerId = mailJson?.id ? String(mailJson.id) : null;
    } catch {
      /* ignore */
    }

    await markEmailStatus(admin, inviteId, "sent", null, null, providerId);
    return json({ ok: true, email: invite.recipient_email, providerId });
  } catch (e) {
    if (adminClient && inviteIdForFail) {
      try {
        await markEmailStatus(adminClient, inviteIdForFail, "failed", "unexpected", String(e).slice(0, 500));
      } catch {
        /* ignore */
      }
    }
    return json({ error: "unexpected", detail: String(e) }, 500);
  }
});
