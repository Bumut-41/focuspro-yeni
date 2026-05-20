/**
 * Test kıstasları (Çocuk 13 dk, Olgun/Yetişkin 15 dk, Ergen 16 dk).
 * Ana simge hızı = stimulus (ms). gap ≈ stimulus'un %45'i.
 */

import {
  buildSilentGifWindow,
  buildSoloSoundWindow,
  buildSoundGifWindow,
  mergeGifEvents,
  mergeSoundEvents
} from "./distractorSchedule.js";

const MIN = 60_000;

function phase(endMin, name, stimulus) {
  return {
    end: endMin * MIN,
    name,
    stimulus,
    gap: Math.round(stimulus * 0.45)
  };
}

/** Çocuk — 13 dk */
const childPhases = [
  phase(2, "Çocuk — 0–2 dk", 1800),
  phase(5, "Çocuk — 2–5 dk", 1700),
  phase(7, "Çocuk — 5–7 dk", 1600),
  phase(10, "Çocuk — 7–10 dk (sessiz gif)", 1600),
  phase(11, "Çocuk — 10–11 dk (sadece ses)", 1600),
  phase(12, "Çocuk — 11–12 dk (sesli gif)", 1600),
  phase(13, "Çocuk — 12–13 dk", 1850)
];

const childGif = mergeGifEvents([
  buildSilentGifWindow(7 * MIN, 10 * MIN),
  buildSoundGifWindow(11 * MIN, 12 * MIN)
]);

const childSound = mergeSoundEvents([buildSoloSoundWindow(10 * MIN, 11 * MIN)]);

/** Olgun / Yetişkin — 15 dk */
const adultPhases = [
  phase(2, "Yetişkin — 0–2 dk", 1400),
  phase(5, "Yetişkin — 2–5 dk", 1200),
  phase(7, "Yetişkin — 5–7 dk", 1100),
  phase(9, "Yetişkin — 7–9 dk (sessiz gif)", 1100),
  phase(10, "Yetişkin — 9–10 dk (sadece ses)", 1100),
  phase(11, "Yetişkin — 10–11 dk (sesli gif)", 900),
  phase(15, "Yetişkin — 11–15 dk", 1100)
];

const adultGif = mergeGifEvents([
  buildSilentGifWindow(7 * MIN, 9 * MIN),
  buildSoundGifWindow(10 * MIN, 11 * MIN)
]);

const adultSound = mergeSoundEvents([buildSoloSoundWindow(9 * MIN, 10 * MIN)]);

/** Ergen — 16 dk */
const teenPhases = [
  phase(3, "Ergen — 0–3 dk", 1300),
  phase(6, "Ergen — 3–6 dk", 1100),
  phase(7, "Ergen — 6–7 dk", 1000),
  phase(8, "Ergen — 7–8 dk", 900),
  phase(9, "Ergen — 8–9 dk", 800),
  phase(11, "Ergen — 9–11 dk (sessiz gif)", 1100),
  phase(12, "Ergen — 11–12 dk (sadece ses)", 900),
  phase(14, "Ergen — 12–14 dk (sesli gif)", 1200),
  phase(16, "Ergen — 14–16 dk", 1100)
];

const teenGif = mergeGifEvents([
  buildSilentGifWindow(9 * MIN, 11 * MIN),
  buildSoundGifWindow(12 * MIN, 14 * MIN)
]);

const teenSound = mergeSoundEvents([buildSoloSoundWindow(11 * MIN, 12 * MIN)]);

export const PROFILES = {
  child: {
    key: "child",
    label: "Çocuk (6–12)",
    durationMs: 13 * MIN,
    lateResponseMs: 1000,
    targetProbability: 0.45,
    phases: childPhases,
    gifEvents: childGif,
    soundEvents: childSound
  },
  teen: {
    key: "teen",
    label: "Ergen (13–17)",
    durationMs: 16 * MIN,
    lateResponseMs: 900,
    targetProbability: 0.42,
    phases: teenPhases,
    gifEvents: teenGif,
    soundEvents: teenSound
  },
  adult: {
    key: "adult",
    label: "Yetişkin (18+)",
    durationMs: 15 * MIN,
    lateResponseMs: 800,
    targetProbability: 0.4,
    phases: adultPhases,
    gifEvents: adultGif,
    soundEvents: adultSound
  }
};

export function ageFromBirthDate(isoDate) {
  if (!isoDate) return null;
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const t = new Date();
  let a = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a -= 1;
  return a;
}

export function profileKeyFromAge(age) {
  const n = Number(age);
  if (!Number.isFinite(n)) return "adult";
  if (n >= 6 && n <= 12) return "child";
  if (n >= 13 && n <= 17) return "teen";
  return "adult";
}

export function getProfile(key) {
  return PROFILES[key] ?? PROFILES.adult;
}
