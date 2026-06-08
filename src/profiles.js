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
  DISTRACTOR_GIF_SECTIONS_QA,
  DISTRACTOR_ONLY_QA,
  DISTRACTOR_SECTIONS_ONLY_QA,
  applyDistractorGifSectionsQa,
  applyDistractorOnlyQa,
  applyDistractorSectionsOnlyQa
} from "./testQaMode.js";

const MIN = 60_000;
const DISTRACTOR_RAMP_STEP_MS = 30_000;
const DISTRACTOR_RAMP_STIMULUS_DROP = 100;

function phase(endMin, name, stimulus) {
  return {
    end: endMin * MIN,
    name,
    stimulus,
    gap: Math.round(stimulus * 0.45)
  };
}

/**
 * Çeldirici bloğu: bölümün tanımlı başlangıç hızından başlar, her 30 sn −100 ms.
 * Sonraki bölüme geçince hız sıfırlanır (önceki bölümün son hızı devam etmez).
 */
function distractorRampPhases(startMin, endMin, baseName, sectionStartStimulus) {
  const startMs = startMin * MIN;
  const endMs = endMin * MIN;
  const phases = [];
  let step = 0;
  for (let t = startMs + DISTRACTOR_RAMP_STEP_MS; t <= endMs; t += DISTRACTOR_RAMP_STEP_MS) {
    const stimulus = sectionStartStimulus - step * DISTRACTOR_RAMP_STIMULUS_DROP;
    const segStartSec = step * 30;
    const segEndSec = (step + 1) * 30;
    phases.push({
      end: t,
      name: `${baseName} · ${segStartSec}–${segEndSec} sn`,
      stimulus,
      gap: Math.round(stimulus * 0.45)
    });
    step += 1;
  }
  return phases;
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

/** Yetişkin çeldirici bölüm başlangıç hızları (ms) — her bölüm kendi hızından ramp yapar. */
const ADULT_DISTRACTOR_START_MS = {
  silent: 1300,
  combined: 1200
};

/** Yetişkin — 15 dk (tablo: 0–3 temel, 3–6 sessiz gif, 6–9 ses, 9–12 gif, 12–15 kapanış) */
const adultPhases = [
  phase(1, "Yetişkin — 0–1 dk", 1300),
  phase(2, "Yetişkin — 1–2 dk", 1100),
  phase(3, "Yetişkin — 2–3 dk", 1000),
  ...distractorRampPhases(3, 6, "Yetişkin — 3–6 dk (sessiz gif)", ADULT_DISTRACTOR_START_MS.silent),
  ...distractorRampPhases(6, 9, "Yetişkin — 6–9 dk (sadece ses)", ADULT_DISTRACTOR_START_MS.silent),
  ...distractorRampPhases(9, 11, "Yetişkin — 9–12 dk (sessiz + sesli gif)", ADULT_DISTRACTOR_START_MS.combined),
  phase(11.5, "Yetişkin — 9–12 dk (sessiz + sesli gif) · 11–11:30", 900),
  phase(12, "Yetişkin — 9–12 dk (sessiz + sesli gif) · 11:30–12", 900),
  phase(13, "Yetişkin — 12–13 dk", 1100),
  phase(14, "Yetişkin — 13–14 dk", 900),
  phase(15, "Yetişkin — 14–15 dk", 900)
];

const adultGif = mergeGifEvents([
  buildSilentGifWindow(3 * MIN, 6 * MIN),
  buildSoundGifWindow(9 * MIN, 12 * MIN)
]);

const adultSound = mergeSoundEvents([buildSoloSoundWindow(6 * MIN, 9 * MIN)]);

/** Ergen çeldirici bölüm başlangıç hızları (ms). */
const TEEN_DISTRACTOR_START_MS = {
  silent: 1100,
  combined: 900
};

/** Ergen — 15 dk (tablo: 0–3 temel, 3–6 sessiz gif, 6–9 ses, 9–12 gif, 12–15 kapanış) */
const teenPhases = [
  phase(1, "Ergen — 0–1 dk", 1400),
  phase(2, "Ergen — 1–2 dk", 1200),
  phase(3, "Ergen — 2–3 dk", 1000),
  ...distractorRampPhases(3, 6, "Ergen — 3–6 dk (sessiz gif)", TEEN_DISTRACTOR_START_MS.silent),
  ...distractorRampPhases(6, 9, "Ergen — 6–9 dk (sadece ses)", TEEN_DISTRACTOR_START_MS.silent),
  ...distractorRampPhases(9, 11, "Ergen — 9–12 dk (sessiz + sesli gif)", TEEN_DISTRACTOR_START_MS.combined),
  phase(11.5, "Ergen — 9–12 dk (sessiz + sesli gif) · 11–11:30", 500),
  phase(12, "Ergen — 9–12 dk (sessiz + sesli gif) · 11:30–12", 500),
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
  if (DISTRACTOR_GIF_SECTIONS_QA) return applyDistractorGifSectionsQa(base);
  if (DISTRACTOR_SECTIONS_ONLY_QA) return applyDistractorSectionsOnlyQa(base);
  return base;
}

/** 30 sn deneme; sonuç kaydedilmez. Süre notasyonu: 0.5 = 5. sn, 0.11 = 11. sn … */
export const PRACTICE_DURATION_MS = 30_000;

const PRACTICE_MS = {
  silentStart: 5_000,
  soundStart: 11_000,
  combinedStart: 18_000,
  closingStart: 26_000,
  end: PRACTICE_DURATION_MS
};

function practicePhase(endMs, name, stimulus) {
  return {
    end: endMs,
    name,
    stimulus,
    gap: Math.round(stimulus * 0.45)
  };
}

/** Yetişkin / ergen — tablo hızları (ergen = yetişkin ile aynı). */
const PRACTICE_ADULT_TEEN_PHASES = [
  practicePhase(5_000, "Deneme — çeldirici yok", 1300),
  practicePhase(11_000, "Deneme — sessiz gif", 1100),
  practicePhase(18_000, "Deneme — sadece ses", 1100),
  practicePhase(26_000, "Deneme — kombine", 900),
  practicePhase(PRACTICE_DURATION_MS, "Deneme — çeldirici yok", 1000)
];

/** Çocuk — tüm aralıklarda 1800 ms. */
const PRACTICE_CHILD_PHASES = [
  practicePhase(5_000, "Deneme — çeldirici yok", 1800),
  practicePhase(11_000, "Deneme — sessiz gif", 1800),
  practicePhase(18_000, "Deneme — sadece ses", 1800),
  practicePhase(26_000, "Deneme — kombine", 1800),
  practicePhase(PRACTICE_DURATION_MS, "Deneme — çeldirici yok", 1800)
];

const PRACTICE_GIF = mergeGifEvents([
  buildSilentGifWindow(PRACTICE_MS.silentStart, PRACTICE_MS.soundStart),
  buildSoundGifWindow(PRACTICE_MS.combinedStart, PRACTICE_MS.closingStart)
]);

const PRACTICE_SOUND = mergeSoundEvents([
  buildSoloSoundWindow(PRACTICE_MS.soundStart, PRACTICE_MS.combinedStart)
]);

export function getPracticeProfile(profile) {
  const phases = profile.key === "child" ? PRACTICE_CHILD_PHASES : PRACTICE_ADULT_TEEN_PHASES;
  return {
    ...profile,
    isPractice: true,
    durationMs: PRACTICE_DURATION_MS,
    phases,
    gifEvents: PRACTICE_GIF,
    soundEvents: PRACTICE_SOUND
  };
}

export {
  DISTRACTOR_GIF_SECTIONS_QA,
  DISTRACTOR_ONLY_QA,
  DISTRACTOR_SECTIONS_ONLY_QA
} from "./testQaMode.js";
