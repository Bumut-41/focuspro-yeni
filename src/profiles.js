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
import {
  DISTRACTOR_ONLY_QA,
  DISTRACTOR_SECTIONS_ONLY_QA,
  applyDistractorOnlyQa,
  applyDistractorSectionsOnlyQa
} from "./testQaMode.js";

const MIN = 60_000;

function phase(endMin, name, stimulus) {
  return {
    end: endMin * MIN,
    name,
    stimulus,
    gap: Math.round(stimulus * 0.45)
  };
}

/** Çocuk — 13 dk (tablo: 0–3 temel, 3–6 sessiz gif, 6–8 ses, 8–11 gif, 11–13 kapanış) */
const childPhases = [
  phase(1, "Çocuk — 0–1 dk", 1800),
  phase(2, "Çocuk — 1–2 dk", 1700),
  phase(3, "Çocuk — 2–3 dk", 1600),
  phase(6, "Çocuk — 3–6 dk (sessiz gif)", 1600),
  phase(8, "Çocuk — 6–8 dk (sadece ses)", 1600),
  phase(11, "Çocuk — 8–11 dk (sessiz + sesli gif)", 1600),
  phase(12, "Çocuk — 11–12 dk", 1850),
  phase(13, "Çocuk — 12–13 dk", 1650)
];

const childGif = mergeGifEvents([
  buildSilentGifWindow(3 * MIN, 6 * MIN),
  buildSoundGifWindow(8 * MIN, 11 * MIN)
]);

const childSound = mergeSoundEvents([buildSoloSoundWindow(6 * MIN, 8 * MIN)]);

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
  const base = PROFILES[key] ?? PROFILES.adult;
  if (DISTRACTOR_ONLY_QA) return applyDistractorOnlyQa(base);
  if (DISTRACTOR_SECTIONS_ONLY_QA) return applyDistractorSectionsOnlyQa(base);
  return base;
}

/** 30 sn deneme — çeldirici yok; sonuç kaydedilmez */
export const PRACTICE_DURATION_MS = 30_000;

/** Deneme ana simge süresi (ms). Yetişkin: 1300 (not: 13800 yazım hatası varsayıldı). */
export function practiceStimulusMs(profileKey) {
  if (profileKey === "child") return 1800;
  if (profileKey === "teen") return 1400;
  return 1300;
}

export function getPracticeProfile(profile) {
  const stimulus = practiceStimulusMs(profile.key);
  return {
    ...profile,
    isPractice: true,
    durationMs: PRACTICE_DURATION_MS,
    phases: [
      {
        end: PRACTICE_DURATION_MS,
        name: "Deneme (çeldiricisiz)",
        stimulus,
        gap: Math.round(stimulus * 0.45)
      }
    ],
    gifEvents: [],
    soundEvents: []
  };
}

export { DISTRACTOR_ONLY_QA, DISTRACTOR_SECTIONS_ONLY_QA } from "./testQaMode.js";
