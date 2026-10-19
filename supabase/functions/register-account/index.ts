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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      return json({ error: "server_misconfigured" }, 500);
    }

    const body = await req.json();
    const email = String(body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(body?.password || "");
    const fullName = String(body?.fullName || "").trim();
    const birthDate = String(body?.birthDate || "").trim();
    const roleRaw = String(body?.role || "individual").trim();
    const role = roleRaw === "psychologist" ? "psychologist" : "individual";

    if (!email.includes("@") || email.length > 160) {
      return json({ error: "invalid_email" }, 400);
    }
    if (password.length < 6) {
      return json({ error: "password_too_short" }, 400);
    }
    if (!fullName || fullName.length > 120) {
      return json({ error: "invalid_name" }, 400);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      return json({ error: "invalid_birth" }, 400);
    }

    const birth = new Date(`${birthDate}T12:00:00Z`);
    const now = new Date();
    let age = now.getUTCFullYear() - birth.getUTCFullYear();
    const m = now.getUTCMonth() - birth.getUTCMonth();
    if (m < 0 || (m === 0 && now.getUTCDate() < birth.getUTCDate())) age -= 1;
    if (age < 18) {
      return json({ error: "age_required" }, 400);
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Onay maili göndermeden hesap oluştur (built-in SMTP rate limit'e takılmaz).
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        birth_date: birthDate,
        role
      }
    });

    if (error) {
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
        return json({ error: "email_taken" }, 409);
      }
      if (msg.includes("rate limit") || msg.includes("over_email")) {
        return json({ error: "email_rate_limit" }, 429);
      }
      return json({ error: "register_failed", detail: error.message }, 400);
    }

    return json({
      ok: true,
      userId: data.user?.id ?? null,
      email
    });
  } catch (e) {
    return json({ error: "unexpected", detail: String(e) }, 500);
  }
});
