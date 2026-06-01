/**
 * Test kıstasları (Çocuk 13 dk, Yetişkin 15 dk, Ergen 15 dk).
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

/** Yetişkin — 15 dk (tablo: 0–3 temel, 3–6 sessiz gif, 6–9 ses, 9–12 gif, 12–15 kapanış) */
const adultPhases = [
  phase(1, "Yetişkin — 0–1 dk", 1300),
  phase(2, "Yetişkin — 1–2 dk", 1100),
  phase(3, "Yetişkin — 2–3 dk", 1000),
  phase(6, "Yetişkin — 3–6 dk (sessiz gif)", 1100),
  phase(9, "Yetişkin — 6–9 dk (sadece ses)", 900),
  phase(12, "Yetişkin — 9–12 dk (sessiz + sesli gif)", 1200),
  phase(13, "Yetişkin — 12–13 dk", 1100),
  phase(14, "Yetişkin — 13–14 dk", 900),
  phase(15, "Yetişkin — 14–15 dk", 700)
];

const adultGif = mergeGifEvents([
  buildSilentGifWindow(3 * MIN, 6 * MIN),
  buildSoundGifWindow(9 * MIN, 12 * MIN)
]);

const adultSound = mergeSoundEvents([buildSoloSoundWindow(6 * MIN, 9 * MIN)]);

/** Ergen — 15 dk (tablo: 0–3 temel, 3–6 sessiz gif, 6–9 ses, 9–12 gif, 12–15 kapanış) */
const teenPhases = [
  phase(1, "Ergen — 0–1 dk", 1400),
  phase(2, "Ergen — 1–2 dk", 1200),
  phase(3, "Ergen — 2–3 dk", 1000),
  phase(6, "Ergen — 3–6 dk (sessiz gif)", 1100),
  phase(9, "Ergen — 6–9 dk (sadece ses)", 1000),
  phase(12, "Ergen — 9–12 dk (sessiz + sesli gif)", 900),
  phase(13, "Ergen — 12–13 dk", 1300),
  phase(14, "Ergen — 13–14 dk", 1100),
  phase(15, "Ergen — 14–15 dk", 900)
];

const teenGif = mergeGifEvents([
  buildSilentGifWindow(3 * MIN, 6 * MIN),
  buildSoundGifWindow(9 * MIN, 12 * MIN)
]);

const teenSound = mergeSoundEvents([buildSoloSoundWindow(6 * MIN, 9 * MIN)]);

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
    durationMs: 15 * MIN,
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
