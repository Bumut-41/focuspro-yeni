/**
 * Tüm gif pencerelerini tarar.
 * node scripts/validate-scenario.mjs
 */

import { PROFILES, getProfile } from "../src/profiles.js";
import {
  buildSilentGifWindow,
  buildSoundGifWindow
} from "../src/distractorSchedule.js";
import { activeItemsAt, pairViolatesPlacement } from "../src/gifPlacement.js";
import { GIF_ON_SCREEN_MS } from "../src/distractorTiming.js";

const MIN = 60_000;

function fmt(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function scanEvents(label, events, durationMs, stepMs = 250) {
  const issues = [];
  let maxEmpty = 0;
  let emptyStart = null;

  for (let t = 0; t < durationMs; t += stepMs) {
    const active = activeItemsAt(events, t);
    if (active.length === 0) {
      if (emptyStart == null) emptyStart = t;
    } else {
      if (emptyStart != null) {
        maxEmpty = Math.max(maxEmpty, t - emptyStart);
        emptyStart = null;
      }
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
  }
  if (emptyStart != null) maxEmpty = Math.max(maxEmpty, durationMs - emptyStart);

  const missing = events.filter((e) => !e.items?.[0]);
  return { label, issues, maxEmpty, missing: missing.length, eventCount: events.length };
}

const segments = [
  { name: "Sessiz gif 3–6 dk", build: (k) => buildSilentGifWindow(3 * MIN, 6 * MIN), dur: 3 * MIN },
  {
    name: "Kombine 8–11/9–12 dk",
    build: (k) =>
      buildSoundGifWindow(k === "child" ? 8 * MIN : 9 * MIN, k === "child" ? 11 * MIN : 12 * MIN),
    dur: 3 * MIN,
    shift: (k) => (k === "child" ? 8 * MIN : 9 * MIN)
  },
  { name: "QA kombine (getProfile)", build: (k) => getProfile(k).gifEvents, dur: (k) => getProfile(k).durationMs }
];

let total = 0;

for (const seg of segments) {
  console.log(`\n=== ${seg.name} ===`);
  for (const key of ["child", "teen", "adult"]) {
    let events = seg.build(key);
    const dur = typeof seg.dur === "function" ? seg.dur(key) : seg.dur;
    if (seg.shift) {
      const off = seg.shift(key);
      events = events.map((e) => ({ ...e, at: e.at - off }));
    }
    const r = scanEvents(key, events, dur);
    console.log(
      `  ${key}: ${r.eventCount} olay, ${r.issues.length} çakışma kaydı, max boş ${(r.maxEmpty / 1000).toFixed(2)}s, eksik ${r.missing}`
    );
    const uniq = new Map();
    for (const i of r.issues) {
      const k = `${i.type}|${i.a}|${i.b}`;
      if (!uniq.has(k)) uniq.set(k, i);
    }
    for (const i of uniq.values()) {
      console.log(`    ⚠ ${i.type} — örn. ${i.label}: ${i.a} + ${i.b}`);
      total++;
    }
  }
}

console.log(`\nToplam benzersiz uyarı: ${total}`);
process.exit(total > 0 ? 1 : 0);
