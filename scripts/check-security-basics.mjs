/**
 * CI / yerel: istemci sızıntısı, tehlikeli env, complete_test_session overload riski.
 * exit 0 = OK, exit 1 = FAIL
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];

function walk(dir, pred, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name === ".git") continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, pred, out);
    else if (pred(p)) out.push(p);
  }
  return out;
}

function read(p) {
  return fs.readFileSync(p, "utf8");
}

// --- 1) İstemci kodunda service role / gizli anahtar kalıpları ---
const srcFiles = walk(path.join(root, "src"), (p) => /\.(js|jsx|ts|tsx)$/.test(p));
const publicFiles = walk(path.join(root, "public"), (p) => /\.(js|html)$/.test(p));
for (const file of [...srcFiles, ...publicFiles]) {
  const text = read(file);
  const rel = path.relative(root, file);
  if (/SERVICE_ROLE|service_role|SUPABASE_SERVICE_ROLE/i.test(text)) {
    errors.push(`${rel}: service role istemci/public kodda olmamalı`);
  }
  if (/RESEND_API_KEY|sk_live_|sk_test_[a-zA-Z0-9]{20,}/.test(text)) {
    errors.push(`${rel}: olası gizli anahtar kalıbı`);
  }
  if (/eyJhbGciOiJ[^"'\s]{80,}/.test(text) && !rel.includes("locales")) {
    warnings.push(`${rel}: uzun JWT benzeri sabit — gerçek anahtar commit edilmemeli`);
  }
}

// --- 2) .env takip edilmemeli ---
const envPath = path.join(root, ".env");
if (fs.existsSync(envPath)) {
  try {
    const tracked = fs.readFileSync(path.join(root, ".gitignore"), "utf8");
    if (!tracked.split(/\r?\n/).some((l) => l.trim() === ".env" || l.trim() === ".env*")) {
      warnings.push(".gitignore içinde .env satırı net değil");
    }
  } catch {
    /* ignore */
  }
}

// --- 3) complete_test_session imza çeşitliliği (overload riski) ---
const sqlFiles = walk(path.join(root, "supabase"), (p) => p.endsWith(".sql"));
const signatureSet = new Map(); // sig -> [files]
const sigRe =
  /create\s+or\s+replace\s+function\s+public\.complete_test_session\s*\(([\s\S]*?)\)\s*(?:returns|language)/gi;

for (const file of sqlFiles) {
  const text = read(file);
  const rel = path.relative(root, file);
  let m;
  while ((m = sigRe.exec(text))) {
    const raw = m[1]
      .replace(/--[^\n]*/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    // Sadece tip listesi (isimleri at)
    const types = raw
      .split(",")
      .map((part) => {
        const bits = part.trim().split(/\s+/);
        return bits[bits.length - 1] || "";
      })
      .filter(Boolean)
      .join(",");
    if (!signatureSet.has(types)) signatureSet.set(types, []);
    signatureSet.get(types).push(rel);
  }
}

if (signatureSet.size > 1) {
  warnings.push(
    `supabase/*.sql içinde complete_test_session için ${signatureSet.size} farklı imza şablonu var. ` +
      `Canlı DB’de tek imza olmalı (PGRST203). Canonical: supabase/fix-complete-test-session-overload.sql. ` +
      `Migration disiplinine geçerken eski SQL’leri arşivleyin.\n` +
      [...signatureSet.entries()]
        .map(([sig, files]) => `  (${sig || "—"}) ← ${[...new Set(files)].join(", ")}`)
        .join("\n")
  );
}

const canonicalFix = path.join(root, "supabase", "fix-complete-test-session-overload.sql");
if (!fs.existsSync(canonicalFix)) {
  errors.push("supabase/fix-complete-test-session-overload.sql eksik (tek-imza referansı)");
}

// --- 4) testQaMode canlı bayrakları ---
const qaPath = path.join(root, "src", "testQaMode.js");
if (fs.existsSync(qaPath)) {
  const qa = read(qaPath);
  const trueFlags = [...qa.matchAll(/^\s*export\s+const\s+(\w+)\s*=\s*true\s*;/gm)].map((m) => m[1]);
  if (trueFlags.length) {
    errors.push(`src/testQaMode.js canlıda true olmamalı: ${trueFlags.join(", ")}`);
  }
}

// --- 5) VITE_ dışı gizli env istemcide import edilmesin ---
for (const file of srcFiles) {
  const text = read(file);
  const rel = path.relative(root, file);
  const bad = [...text.matchAll(/import\.meta\.env\.([A-Z0-9_]+)/g)]
    .map((m) => m[1])
    .filter((k) => k !== "MODE" && k !== "DEV" && k !== "PROD" && k !== "SSR" && !k.startsWith("VITE_"));
  if (bad.length) {
    errors.push(`${rel}: istemciye sızmaması gereken env: ${[...new Set(bad)].join(", ")}`);
  }
}

console.log("FocusProLab security basics check");
if (warnings.length) {
  console.log("\nWarnings:");
  for (const w of warnings) console.log(" -", w);
}
if (errors.length) {
  console.log("\nFAIL:");
  for (const e of errors) console.log(" -", e);
  process.exit(1);
}
console.log("\nPASS");
process.exit(0);
