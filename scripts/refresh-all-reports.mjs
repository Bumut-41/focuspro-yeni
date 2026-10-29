/**
 * Tüm test_sessions için V4 metrik + saklanan PDF yenileme (service_role).
 * Kullanım:
 *   $env:SUPABASE_SERVICE_ROLE_KEY="..."
 *   node scripts/refresh-all-reports.mjs
 *
 * Vite’i 5199’da açar; Playwright ile PDF üretir; Storage’a upsert eder.
 */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";
import { computeReportMetrics } from "../src/reportHelpers.js";
import { getProfile } from "../src/profiles.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const PORT = 5199;
const HARNESS = `http://127.0.0.1:${PORT}/refresh-harness.html`;

function loadEnv() {
  const text = readFileSync(resolve(root, ".env"), "utf8");
  return Object.fromEntries(
    text
      .split(/\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i), l.slice(i + 1)];
      })
  );
}

async function waitHttp(url, ms = 60000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try {
      const r = await fetch(url);
      if (r.ok || r.status === 304) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Vite hazır değil: ${url}`);
}

function startVite() {
  const child = spawn("npx vite --host 127.0.0.1 --port " + PORT + " --strictPort", {
    cwd: root,
    stdio: "pipe",
    shell: true
  });
  child.stdout.on("data", (d) => process.stdout.write(`[vite] ${d}`));
  child.stderr.on("data", (d) => process.stderr.write(`[vite] ${d}`));
  return child;
}

async function main() {
  const env = loadEnv();
  const url = (env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("VITE_SUPABASE_URL (.env) ve SUPABASE_SERVICE_ROLE_KEY gerekli.");
    process.exit(1);
  }

  const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

  console.log("Oturumlar çekiliyor…");
  const { data: sessions, error } = await sb
    .from("test_sessions")
    .select(
      "id, owner_id, participant_name, participant_age, participant_birth_date, participant_gender, profile_key, logs, target, metrics, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  const list = (sessions || []).filter((s) => s.logs?.length && s.target && s.owner_id);
  console.log(`${list.length} oturum (logs+target var).`);

  const vite = startVite();
  let browser;
  try {
    await waitHttp(HARNESS);
    const launchOptions = { headless: true };
    try {
      await chromium.launch({ ...launchOptions, channel: "msedge" });
      launchOptions.channel = "msedge";
    } catch {
      /* default chromium */
    }
    browser = await chromium.launch(launchOptions);
    const page = await browser.newPage();
    await page.goto(HARNESS, { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__READY === true, { timeout: 60000 });

    let ok = 0;
    let fail = 0;
    for (let i = 0; i < list.length; i++) {
      const s = list[i];
      const label = `${i + 1}/${list.length} ${s.participant_name || s.id}`;
      try {
        const { data: tlRow } = await sb
          .from("test_press_timelines")
          .select("timeline")
          .eq("session_id", s.id)
          .maybeSingle();
        const timeline = tlRow?.timeline ?? [];
        const profile = getProfile(s.profile_key ?? "adult");
        const age = s.participant_age ?? null;
        const metrics = {
          ...computeReportMetrics(s.logs, profile.lateResponseMs, {
            pressTimeline: timeline,
            age: Number(age) || null,
            locale: "tr"
          }),
          lateResponseMs: profile.lateResponseMs
        };

        const { error: upErr } = await sb.from("test_sessions").update({ metrics }).eq("id", s.id);
        if (upErr) throw upErr;

        const participant = {
          name: s.participant_name ?? "Katılımcı",
          age,
          birthDate: s.participant_birth_date ?? null,
          gender: s.participant_gender ?? null
        };

        const b64 = await page.evaluate(
          async ({ participant, profile, logs, target, pressTimeline }) => {
            const blob = await window.__createPdfBlob({
              participant,
              profile,
              logs,
              target,
              pressTimeline,
              locale: "tr"
            });
            const buf = await blob.arrayBuffer();
            const bytes = new Uint8Array(buf);
            let binary = "";
            for (let j = 0; j < bytes.length; j++) binary += String.fromCharCode(bytes[j]);
            return btoa(binary);
          },
          {
            participant,
            profile,
            logs: s.logs,
            target: s.target,
            pressTimeline: timeline
          }
        );

        const pdfBytes = Buffer.from(b64, "base64");
        const path = `${s.owner_id}/${s.id}.pdf`;
        const { error: storErr } = await sb.storage.from("reports").upload(path, pdfBytes, {
          contentType: "application/pdf",
          upsert: true
        });
        if (storErr) throw storErr;

        const { error: pathErr } = await sb.from("test_sessions").update({ pdf_path: path }).eq("id", s.id);
        if (pathErr) throw pathErr;

        if (timeline.length) {
          try {
            const adminB64 = await page.evaluate(
              async ({ session, timeline, target }) => {
                const blob = await window.__createAdminPdf({ session, timeline, target });
                const buf = await blob.arrayBuffer();
                const bytes = new Uint8Array(buf);
                let binary = "";
                for (let j = 0; j < bytes.length; j++) binary += String.fromCharCode(bytes[j]);
                return btoa(binary);
              },
              {
                session: {
                  id: s.id,
                  participant_name: s.participant_name,
                  participant_age: s.participant_age,
                  participant_birth_date: s.participant_birth_date,
                  participant_gender: s.participant_gender,
                  profile_key: s.profile_key,
                  created_at: s.created_at,
                  logs: s.logs
                },
                timeline,
                target: s.target
              }
            );
            const adminPath = `${s.owner_id}/${s.id}-admin.pdf`;
            const adminBytes = Buffer.from(adminB64, "base64");
            await sb.storage.from("reports").upload(adminPath, adminBytes, {
              contentType: "application/pdf",
              upsert: true
            });
            await sb.from("test_sessions").update({ admin_pdf_path: adminPath }).eq("id", s.id);
          } catch (e) {
            console.warn(`  (basış PDF atlandı) ${e.message || e}`);
          }
        }

        ok++;
        console.log(`✓ ${label} · overall=${metrics.overallScore} · v=${metrics.version}`);
      } catch (e) {
        fail++;
        console.error(`✗ ${label}: ${e.message || e}`);
      }
    }
    console.log(`\nBitti: ${ok} OK · ${fail} hata · toplam ${list.length}`);
  } finally {
    if (browser) await browser.close().catch(() => {});
    vite.kill("SIGTERM");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
