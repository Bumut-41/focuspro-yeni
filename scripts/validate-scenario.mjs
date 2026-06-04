/**
 * Tam test + tüm gif pencereleri çakışma ve kural taraması.
 * node scripts/validate-scenario.mjs
 */

import { getProfile, PROFILES } from "../src/profiles.js";
import { buildSilentGifWindow } from "../src/distractors/silent/schedule.js";
import { buildSoundGifWindow } from "../src/distractors/combined/schedule.js";
import { activeItemsAt, isMovingItem, pairViolatesPlacement } from "../src/gifPlacementCore.js";
import { COMBINED_MAX_EMPTY_MS, SILENT_MAX_EMPTY_MS } from "../src/distractorTiming.js";

const MIN = 60_000;

function fmt(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function scanPlacement(events, startMs, endMs, stepMs = 250) {
  const issues = [];
  for (let t = startMs; t < endMs; t += stepMs) {
    const active = activeItemsAt(events, t);
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const v = pairViolatesPlacement(active[i], active[j]);
        if (v) {
          issues.push({
            at: t,
            label: fmt(t),
            type: v,
            a: `${active[i].key}(${active[i].laneId})`,
            b: `${active[j].key}(${active[j].laneId})`
          });
        }
      }
    }
  }
  const uniq = new Map();
  for (const i of issues) {
    uniq.set(`${i.type}|${i.a}|${i.b}`, i);
  }
  return [...uniq.values()];
}

function scanSilentRules(events, startMs, endMs, stepMs = 100) {
  const issues = [];
  let maxEmpty = 0;
  let emptyStart = null;

  for (let t = startMs; t < endMs; t += stepMs) {
    const active = activeItemsAt(events, t);
    if (active.length === 0) {
      if (emptyStart == null) emptyStart = t;
    } else {
      if (emptyStart != null) {
        maxEmpty = Math.max(maxEmpty, t - emptyStart);
        emptyStart = null;
      }
      if (active.length > 2) issues.push({ type: "kural", msg: `>${2} gif ekranda`, label: fmt(t) });
      const keys = new Set(active.map((x) => x.key));
      if (keys.size !== active.length) {
        issues.push({ type: "kural", msg: "aynı gif anahtarı", label: fmt(t) });
      }
      const movers = active.filter(isMovingItem);
      if (movers.length > 1) {
        issues.push({
          type: "kural",
          msg: `>${1} hareketli gif (${movers.map((x) => x.key).join("+")})`,
          label: fmt(t)
        });
      }
    }
  }
  if (emptyStart != null) maxEmpty = Math.max(maxEmpty, endMs - emptyStart);
  if (maxEmpty > SILENT_MAX_EMPTY_MS) {
    issues.push({
      type: "kural",
      msg: `boş ekran ${(maxEmpty / 1000).toFixed(2)}s > ${SILENT_MAX_EMPTY_MS / 1000}s`,
      label: "—"
    });
  }
  return issues;
}

function scanCombinedRules(events, startMs, endMs, stepMs = 250) {
  const issues = [];
  let maxEmpty = 0;
  let emptyStart = null;

  for (let t = startMs; t < endMs; t += stepMs) {
    const active = activeItemsAt(events, t);
    if (active.length === 0) {
      if (emptyStart == null) emptyStart = t;
    } else {
      if (emptyStart != null) {
        maxEmpty = Math.max(maxEmpty, t - emptyStart);
        emptyStart = null;
      }
      const sil = active.filter((x) => x.silent);
      const snd = active.filter((x) => !x.silent);
      const keys = new Set(active.map((x) => x.key));
      if (sil.length > 1) issues.push({ type: "kural", msg: `>${1} sessiz gif`, label: fmt(t) });
      if (snd.length > 1) issues.push({ type: "kural", msg: `>${1} sesli gif`, label: fmt(t) });
      if (active.length > 2) issues.push({ type: "kural", msg: `>${2} gif ekranda`, label: fmt(t) });
      if (keys.size !== active.length) {
        issues.push({ type: "kural", msg: "aynı gif anahtarı", label: fmt(t) });
      }
    }
  }
  if (emptyStart != null) maxEmpty = Math.max(maxEmpty, endMs - emptyStart);
  if (maxEmpty > COMBINED_MAX_EMPTY_MS) {
    issues.push({
      type: "kural",
      msg: `boş ekran ${(maxEmpty / 1000).toFixed(2)}s > ${COMBINED_MAX_EMPTY_MS / 1000}s`,
      label: "—"
    });
  }
  return issues;
}

function combinedWindow(key) {
  if (key === "child") return { start: 8 * MIN, end: 11 * MIN };
  return { start: 9 * MIN, end: 12 * MIN };
}

function silentWindow() {
  return { start: 3 * MIN, end: 6 * MIN };
}

let total = 0;

console.log("=== Pencere bazlı yerleşim (izole) ===\n");
for (const key of ["child", "teen", "adult"]) {
  const cw = combinedWindow(key);
  const sw = silentWindow();
  const comb = buildSoundGifWindow(cw.start, cw.end);
  const sil = buildSilentGifWindow(sw.start, sw.end);
  const combIssues = scanPlacement(
    comb.map((e) => ({ ...e, at: e.at - cw.start })),
    0,
    cw.end - cw.start
  );
  const silIssues = scanPlacement(
    sil.map((e) => ({ ...e, at: e.at - sw.start })),
    0,
    sw.end - sw.start
  );
  const silRules = scanSilentRules(
    sil.map((e) => ({ ...e, at: e.at - sw.start })),
    0,
    sw.end - sw.start
  );
  console.log(
    `  ${key}: kombine ${combIssues.length} çakışma, sessiz ${silIssues.length} çakışma, sessiz kural ${silRules.length}`
  );
  for (const i of [...combIssues, ...silIssues, ...silRules]) {
    if (i.a) console.log(`    ⚠ ${i.type} ${i.label}: ${i.a} + ${i.b}`);
    else console.log(`    ⚠ ${i.msg} (${i.label})`);
    total++;
  }
}

console.log("\n=== Tam test — getProfile (tüm gif olayları) ===\n");
for (const key of ["child", "teen", "adult"]) {
  const p = getProfile(key);
  const place = scanPlacement(p.gifEvents, 0, p.durationMs);
  const cw = combinedWindow(key);
  const combPlace = scanPlacement(p.gifEvents, cw.start, cw.end);
  const combRules = scanCombinedRules(p.gifEvents, cw.start, cw.end);
  const sw = silentWindow();
  const silPlace = scanPlacement(p.gifEvents, sw.start, sw.end);
  const silRules = scanSilentRules(p.gifEvents, sw.start, sw.end);

  console.log(`  ${key} (${p.durationMs / MIN} dk, ${p.gifEvents.length} gif olayı):`);
  console.log(`    Yerleşim (tüm test): ${place.length} uyarı`);
  console.log(`    Yerleşim (sessiz 3–6 dk): ${silPlace.length} uyarı`);
  console.log(`    Sessiz kurallar (2 gif / 0,7s boş): ${silRules.length} uyarı`);
  console.log(`    Yerleşim (kombine): ${combPlace.length} uyarı`);
  console.log(`    Kombine kurallar: ${combRules.length} uyarı`);

  for (const i of [...place, ...silPlace, ...combPlace]) {
    console.log(`    ⚠ çakışma ${i.label}: ${i.a} + ${i.b} (${i.type})`);
    total++;
  }
  for (const i of combRules) {
    console.log(`    ⚠ ${i.msg} (${i.label})`);
    total++;
  }
  for (const i of silRules) {
    console.log(`    ⚠ ${i.msg} (${i.label})`);
    total++;
  }
}

console.log(`\nToplam uyarı: ${total}`);
process.exit(total > 0 ? 1 : 0);
