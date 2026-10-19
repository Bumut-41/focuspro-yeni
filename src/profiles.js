/**
 * Test kıstasları (Çocuk 13 dk, Yetişkin 15 dk, Ergen 15 dk).
 * stimulus = görünme süresi (ms), gap = boşluk (ms).
 * SOA (uyaran başlangıçları arası) = stimulus + gap.
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

/** Yetişkin pilot tempo (GPT / klinik öneri). */
const ADULT_TEMPO = {
  slow: { soa: 2000, display: 400 },
  medium: { soa: 1500, display: 300 },
  fast: { soa: 1100, display: 250 }
};

/** Çocuk — yetişkinden yumuşak ama eski uzun görünmeye göre bir tık zor. */
const CHILD_TEMPO = {
  slow: { soa: 2200, display: 550 },
  medium: { soa: 1800, display: 450 },
  fast: { soa: 1400, display: 350 }
};

/** Ergen — çocuk ile yetişkin arası. */
const TEEN_TEMPO = {
  slow: { soa: 2100, display: 480 },
  medium: { soa: 1600, display: 340 },
  fast: { soa: 1200, display: 270 }
};

function phase(endMin, name, stimulus) {
  return {
    end: endMin * MIN,
    name,
    stimulus,
    gap: Math.round(stimulus * 0.45)
  };
}

/** SOA + görünme süresi ile faz (yetişkin inişli-çıkışlı tempo). */
function phaseTimed(endMin, name, { soa, display }) {
  return {
    end: endMin * MIN,
    name,
    stimulus: display,
    gap: Math.max(50, soa - display)
  };
}

/**
 * Her 3 dk blok: 0–60 sn yavaş → 60–120 sn orta → 120–180 sn hızlı.
 * Skorların 97–99’da yığılmasını azaltmak için kısa görünme + değişen tempo.
 */
function threeMinTempoBlock(startMin, sectionLabel, tempo) {
  return [
    phaseTimed(startMin + 1, `${sectionLabel} · 0–60 sn · yavaş`, tempo.slow),
    phaseTimed(startMin + 2, `${sectionLabel} · 60–120 sn · orta`, tempo.medium),
    phaseTimed(startMin + 3, `${sectionLabel} · 120–180 sn · hızlı`, tempo.fast)
  ];
}

/** 2 dk blok (çocuk ses / kapanış): yavaş → orta veya orta → hızlı */
function twoMinTempoBlock(startMin, sectionLabel, first, second, firstLabel, secondLabel) {
  return [
    phaseTimed(startMin + 1, `${sectionLabel} · 0–60 sn · ${firstLabel}`, first),
    phaseTimed(startMin + 2, `${sectionLabel} · 60–120 sn · ${secondLabel}`, second)
  ];
}

function adultThreeMinBlock(startMin, sectionLabel) {
  return threeMinTempoBlock(startMin, sectionLabel, ADULT_TEMPO);
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

/** Çocuk — 13 dk; bölüm içinde yavaş→orta→hızlı (2 dk’lık bölümlerde çift tempo) */
const childPhases = [
  ...threeMinTempoBlock(0, "Çocuk — 0–3 dk (temel)", CHILD_TEMPO),
  ...threeMinTempoBlock(3, "Çocuk — 3–6 dk (sessiz gif)", CHILD_TEMPO),
  ...twoMinTempoBlock(6, "Çocuk — 6–8 dk (sadece ses)", CHILD_TEMPO.slow, CHILD_TEMPO.medium, "yavaş", "orta"),
  ...threeMinTempoBlock(8, "Çocuk — 8–11 dk (sessiz + sesli gif)", CHILD_TEMPO),
  ...twoMinTempoBlock(11, "Çocuk — 11–13 dk (kapanış)", CHILD_TEMPO.medium, CHILD_TEMPO.fast, "orta", "hızlı")
];

const childGif = mergeGifEvents([
  buildSilentGifWindow(3 * MIN, 6 * MIN),
  buildSoundGifWindow(8 * MIN, 11 * MIN)
]);

const childSound = mergeSoundEvents([buildSoloSoundWindow(6 * MIN, 8 * MIN)]);

/** Yetişkin — 15 dk: 5×3 dk; her 3 dk içinde yavaş → orta → hızlı */
const adultPhases = [
  ...adultThreeMinBlock(0, "Yetişkin — 0–3 dk (temel)"),
  ...adultThreeMinBlock(3, "Yetişkin — 3–6 dk (sessiz gif)"),
  ...adultThreeMinBlock(6, "Yetişkin — 6–9 dk (sadece ses)"),
  ...adultThreeMinBlock(9, "Yetişkin — 9–12 dk (sessiz + sesli gif)"),
  ...adultThreeMinBlock(12, "Yetişkin — 12–15 dk (kapanış)")
];

const adultGif = mergeGifEvents([
  buildSilentGifWindow(3 * MIN, 6 * MIN),
  buildSoundGifWindow(9 * MIN, 12 * MIN)
]);

const adultSound = mergeSoundEvents([buildSoloSoundWindow(6 * MIN, 9 * MIN)]);

/** Ergen — 15 dk: yetişkinle aynı yapı, biraz daha yumuşak tempo */
const teenPhases = [
  ...threeMinTempoBlock(0, "Ergen — 0–3 dk (temel)", TEEN_TEMPO),
  ...threeMinTempoBlock(3, "Ergen — 3–6 dk (sessiz gif)", TEEN_TEMPO),
  ...threeMinTempoBlock(6, "Ergen — 6–9 dk (sadece ses)", TEEN_TEMPO),
  ...threeMinTempoBlock(9, "Ergen — 9–12 dk (sessiz + sesli gif)", TEEN_TEMPO),
  ...threeMinTempoBlock(12, "Ergen — 12–15 dk (kapanış)", TEEN_TEMPO)
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
    targetProbability: 0.38,
    maxTargetStreak: 2,
    phases: childPhases,
    gifEvents: childGif,
    soundEvents: childSound
  },
  teen: {
    key: "teen",
    label: "Ergen (13–17)",
    durationMs: 15 * MIN,
    lateResponseMs: 900,
    targetProbability: 0.35,
    maxTargetStreak: 2,
    phases: teenPhases,
    gifEvents: teenGif,
    soundEvents: teenSound
  },
  adult: {
    key: "adult",
    label: "Yetişkin (18+)",
    durationMs: 15 * MIN,
    lateResponseMs: 800,
    // Daha seyrek hedef + peş peşe sınır (useAttentionTest) → alışma / 99 skor yığılması azalır
    targetProbability: 0.32,
    maxTargetStreak: 2,
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

/** Yetişkin / ergen deneme — yeni tempo oranlarına yakın (kısa görünme). */
const PRACTICE_ADULT_TEEN_PHASES = [
  { end: 5_000, name: "Deneme — çeldirici yok", stimulus: 400, gap: 1600 },
  { end: 11_000, name: "Deneme — sessiz gif", stimulus: 300, gap: 1200 },
  { end: 18_000, name: "Deneme — sadece ses", stimulus: 300, gap: 1200 },
  { end: 26_000, name: "Deneme — kombine", stimulus: 250, gap: 850 },
  { end: PRACTICE_DURATION_MS, name: "Deneme — çeldirici yok", stimulus: 300, gap: 1200 }
];

/** Çocuk deneme — yeni tempo oranlarına yakın. */
const PRACTICE_CHILD_PHASES = [
  { end: 5_000, name: "Deneme — çeldirici yok", stimulus: 550, gap: 1650 },
  { end: 11_000, name: "Deneme — sessiz gif", stimulus: 450, gap: 1350 },
  { end: 18_000, name: "Deneme — sadece ses", stimulus: 450, gap: 1350 },
  { end: 26_000, name: "Deneme — kombine", stimulus: 350, gap: 1050 },
  { end: PRACTICE_DURATION_MS, name: "Deneme — çeldirici yok", stimulus: 450, gap: 1350 }
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
