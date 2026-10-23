/**
 * FocusProLab skorlama V3 (deneme / pilot).
 * V1 ve V2 değiştirilmez. Amaç: keyfî RT hız merkezi olmadan T üretmek.
 *
 * Genel ağırlıklar aynı: A30 T25 I30 H15
 * A / I / H V1 ile aynı.
 *
 * V3 T:
 * - RT hız puanı YOK (450/500/600 ms merkez kullanılmaz).
 * - Ham medyan / ort / SD / CV her zaman raporlanır.
 * - Yaş bandı referansı yalnızca tanımlayıcıdır (skor cezası değil).
 * - Stabilite: CV korunur; ceza katsayısı geçici/exploratory (doğrulanmış norm değil).
 * - Geç yanıt kontrolü T'de kalır; zamanında isabet oranı T'de yoktur (A ile örtüşme azaltılır).
 */

import {
  OVERALL_WEIGHTS,
  computeHyperactivityScore,
  countHyperMotorStats,
  countTrialBehaviors,
  referenceRtMs
} from "./metrics.js";
import { collectValidOnTimeRts, removeRtOutliersIqr, V2_MIN_RT_SAMPLES } from "./metricsV2.js";

/** Geçici exploratory stabilite katsayısı — doğrulanmış norm değildir (V2'deki 200 yerine daha yumuşak). */
export const V3_STABILITY_K_EXPLORATORY = 100;
/** T = stabilite × wS + geç yanıt × wL (hız bileşeni yok). */
export const V3_T_WEIGHT_STABILITY = 0.55;
export const V3_T_WEIGHT_LATE = 0.45;
export const V3_MIN_RT_SAMPLES = V2_MIN_RT_SAMPLES;

function clamp(x, a = 0, b = 100) {
  return Math.max(a, Math.min(b, x));
}
function safeDiv(n, d) {
  return !d ? 0 : n / d;
}
function mean(a) {
  return a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
}
function median(a) {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
function stdDev(a) {
  if (a.length < 2) return 0;
  const m = mean(a);
  return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / a.length);
}

export function ageBandKey(age) {
  const n = Number(age);
  if (!Number.isFinite(n)) return "unknown";
  if (n >= 18) return "adult";
  if (n >= 13) return "teen";
  if (n >= 10) return "late_child";
  if (n >= 7) return "child";
  return "young_child";
}

export function ageBandLabelTr(age) {
  const k = ageBandKey(age);
  if (k === "adult") return "Yetişkin (18+)";
  if (k === "teen") return "Ergen (13–17)";
  if (k === "late_child") return "Geç çocuk (10–12)";
  if (k === "child") return "Çocuk (7–9)";
  if (k === "young_child") return "Küçük çocuk (<7)";
  return "Yaş bilinmiyor";
}

/**
 * V3 T alt bileşenleri — hız puanı üretilmez.
 */
export function computeTimingComponentsV3(behaviors, onTimeRts, age = null) {
  const empty = {
    score: null,
    unavailable: true,
    reason: "no_targets",
    rtSpeed: null,
    rtSpeedScored: false,
    rtStability: null,
    lateResponse: null,
    medianRt: null,
    meanRt: null,
    rtStd: null,
    cv: null,
    rtN: 0,
    rtNRaw: 0,
    outliersRemoved: 0,
    ageBand: ageBandKey(age),
    ageBandLabel: ageBandLabelTr(age),
    ageReferenceRtMs: referenceRtMs(age),
    stabilityK: V3_STABILITY_K_EXPLORATORY,
    stabilityKValidated: false
  };
  if (!behaviors?.targets) return empty;

  const lateResponse = clamp(100 * (1 - safeDiv(behaviors.late, behaviors.targets)));
  const raw = Array.isArray(onTimeRts) ? onTimeRts : [];
  const cleaned = removeRtOutliersIqr(raw);
  const outliersRemoved = raw.length - cleaned.length;
  const ageMeta = {
    ageBand: ageBandKey(age),
    ageBandLabel: ageBandLabelTr(age),
    ageReferenceRtMs: referenceRtMs(age),
    stabilityK: V3_STABILITY_K_EXPLORATORY,
    stabilityKValidated: false,
    rtSpeed: null,
    rtSpeedScored: false
  };

  if (cleaned.length < V3_MIN_RT_SAMPLES) {
    return {
      ...empty,
      ...ageMeta,
      reason: raw.length === 0 ? "no_valid_rt" : "insufficient_rt",
      lateResponse: Math.round(lateResponse),
      rtN: cleaned.length,
      rtNRaw: raw.length,
      outliersRemoved
    };
  }

  const med = median(cleaned);
  const rtMean = mean(cleaned);
  const rtStd = stdDev(cleaned);
  const cv = rtMean > 0 ? rtStd / rtMean : null;

  const rtStability =
    cv == null || !Number.isFinite(cv)
      ? null
      : clamp(100 - V3_STABILITY_K_EXPLORATORY * cv);

  if (rtStability == null) {
    return {
      ...empty,
      ...ageMeta,
      reason: "stability_undefined",
      lateResponse: Math.round(lateResponse),
      medianRt: Math.round(med),
      meanRt: Math.round(rtMean),
      rtStd: Math.round(rtStd),
      cv: null,
      rtN: cleaned.length,
      rtNRaw: raw.length,
      outliersRemoved
    };
  }

  const score = clamp(
    rtStability * V3_T_WEIGHT_STABILITY + lateResponse * V3_T_WEIGHT_LATE
  );

  return {
    score: Math.round(score),
    unavailable: false,
    reason: null,
    ...ageMeta,
    rtStability: Math.round(rtStability),
    lateResponse: Math.round(lateResponse),
    medianRt: Math.round(med),
    meanRt: Math.round(rtMean),
    rtStd: Math.round(rtStd),
    cv: Number(cv.toFixed(4)),
    rtN: cleaned.length,
    rtNRaw: raw.length,
    outliersRemoved
  };
}

/** A ile T örtüşme denetimi — skor üretmez, karşılaştırma içindir. */
export function buildTimingAttentionOverlap(behaviors) {
  if (!behaviors?.targets) {
    return {
      omissionRate: null,
      lateRate: null,
      onTimeHitRate: null,
      note: "no_targets"
    };
  }
  const omissionRate = Number((safeDiv(behaviors.omissions, behaviors.targets) * 100).toFixed(1));
  const lateRate = Number((safeDiv(behaviors.late, behaviors.targets) * 100).toFixed(1));
  const onTimeHitRate = Number((safeDiv(behaviors.hits, behaviors.targets) * 100).toFixed(1));
  return {
    omissionRate,
    lateRate,
    onTimeHitRate,
    note:
      "V3 T'de zamanında isabet oranı yoktur (A ihmal ile ölçer). Geç yanıt T'de kalır; ihmal ile kısmi örtüşme olabilir."
  };
}

export function computeIndexScoresV3(behaviors, logs, pressTimeline = [], lateMs, age = null) {
  if (!behaviors?.totalTrials) {
    return {
      attention: 0,
      attentionRaw: 0,
      timing: null,
      timingUnavailable: true,
      timingReason: "no_trials",
      timingRtSpeed: null,
      timingRtStability: null,
      timingLateResponse: null,
      impulsivity: 0,
      impulsivityRate: 0,
      hyperactivity: 0,
      hyperRate: 0,
      overall: null,
      overallUnavailable: true,
      medianRt: null,
      meanRt: null,
      rtStd: null,
      cv: null,
      rushUnder150: 0,
      rtN: 0,
      ageBand: ageBandKey(age),
      ageBandLabel: ageBandLabelTr(age),
      ageReferenceRtMs: referenceRtMs(age),
      overlap: null,
      version: "v3"
    };
  }

  const omissionRatio = safeDiv(behaviors.omissions, behaviors.targets);
  const targetDetections = behaviors.hits + behaviors.late;
  const attentionRaw = safeDiv(targetDetections, behaviors.targets) * 100;
  const attention = clamp(100 - omissionRatio * 100);

  const { onTimeRts, rushUnder150 } = collectValidOnTimeRts(logs, lateMs);
  const timingParts = computeTimingComponentsV3(behaviors, onTimeRts, age);
  const overlap = buildTimingAttentionOverlap(behaviors);

  const impulsivityRate = safeDiv(behaviors.falseAlarms, behaviors.nonTargets) * 100;
  const hyperMotor = countHyperMotorStats(logs, pressTimeline);
  const totalResponses = behaviors.hits + behaviors.late + behaviors.falseAlarms;
  const engaged = totalResponses > 0 || hyperMotor.totalPresses > 0;

  let impulsivity = clamp(100 - impulsivityRate * 5);
  let hyperactivity = computeHyperactivityScore(behaviors, logs, pressTimeline);
  if (!engaged && behaviors.targets >= 5) {
    impulsivity = 0;
    hyperactivity = 0;
  }

  let overall = null;
  let overallUnavailable = Boolean(timingParts.unavailable);
  if (!timingParts.unavailable && timingParts.score != null) {
    overall = clamp(
      attention * OVERALL_WEIGHTS.attention +
        timingParts.score * OVERALL_WEIGHTS.timing +
        impulsivity * OVERALL_WEIGHTS.impulsivity +
        hyperactivity * OVERALL_WEIGHTS.hyperactivity
    );
    if (!engaged && behaviors.targets >= 5) overall = Math.min(overall, 25);
    else if (behaviors.targets > 0 && targetDetections === 0) overall = Math.min(overall, 35);
    else if (attentionRaw < 25) overall = Math.min(overall, 45);
    overall = Math.round(overall);
  }

  return {
    attention: Math.round(attention),
    attentionRaw: Math.round(attentionRaw),
    timing: timingParts.unavailable ? null : timingParts.score,
    timingUnavailable: Boolean(timingParts.unavailable),
    timingReason: timingParts.reason,
    timingRtSpeed: null,
    timingRtStability: timingParts.rtStability,
    timingLateResponse: timingParts.lateResponse,
    timingOnTimeHit: null,
    impulsivity: Math.round(impulsivity),
    impulsivityRate: Number(impulsivityRate.toFixed(1)),
    hyperactivity: Math.round(hyperactivity),
    hyperRate: Number(hyperMotor.motorEventRate.toFixed(1)),
    multiTrialRate: Number(hyperMotor.multiTrialRate.toFixed(1)),
    overall,
    overallUnavailable,
    medianRt: timingParts.medianRt,
    meanRt: timingParts.meanRt,
    rtStd: timingParts.rtStd,
    cv: timingParts.cv,
    rushUnder150: rushUnder150.length,
    rtN: timingParts.rtN,
    rtNRaw: timingParts.rtNRaw,
    outliersRemoved: timingParts.outliersRemoved,
    ageBand: timingParts.ageBand,
    ageBandLabel: timingParts.ageBandLabel,
    ageReferenceRtMs: timingParts.ageReferenceRtMs,
    stabilityK: timingParts.stabilityK,
    stabilityKValidated: false,
    rtSpeedScored: false,
    overlap,
    version: "v3"
  };
}

export function computeMetricsV3(logs, lateMs, pressTimeline = [], age = null) {
  if (!logs?.length) {
    return {
      totalTrials: 0,
      attentionScore: 0,
      speedScore: null,
      impulseScore: 0,
      consistencyScore: 0,
      overallScore: null,
      timingUnavailable: true,
      behaviors: null,
      version: "v3"
    };
  }

  const behaviors = countTrialBehaviors(logs, lateMs);
  const indices = computeIndexScoresV3(behaviors, logs, pressTimeline, lateMs, age);
  const hyperMotor = countHyperMotorStats(logs, pressTimeline);
  const idlePresses = pressTimeline.filter((p) => p.errorType === "idle").length;

  return {
    totalTrials: behaviors.totalTrials,
    accuracy: Math.round(
      safeDiv(behaviors.hits + behaviors.late, behaviors.targets) * 80 +
        safeDiv(behaviors.correctRejects, behaviors.nonTargets) * 20
    ),
    avgReaction: indices.meanRt ?? 0,
    medianReaction: indices.medianRt ?? 0,
    rtStd: indices.rtStd ?? 0,
    omissionRate: safeDiv(behaviors.omissions, behaviors.targets) * 100,
    falseAlarmRate: safeDiv(behaviors.falseAlarms, behaviors.nonTargets) * 100,
    lateRate: safeDiv(behaviors.late, behaviors.targets) * 100,
    multiPressRate: hyperMotor.multiTrialRate,
    idlePresses,
    attentionScore: indices.attention,
    impulseScore: indices.impulsivity,
    speedScore: indices.timing,
    consistencyScore: indices.hyperactivity,
    overallScore: indices.overall,
    timingOnTimeHit: null,
    timingRtSpeed: null,
    timingLateResponse: indices.timingLateResponse,
    timingRtStability: indices.timingRtStability,
    timingUnavailable: indices.timingUnavailable,
    timingReason: indices.timingReason,
    overallUnavailable: indices.overallUnavailable,
    medianRt: indices.medianRt,
    meanRt: indices.meanRt,
    cv: indices.cv,
    rushUnder150: indices.rushUnder150,
    rtN: indices.rtN,
    rtNRaw: indices.rtNRaw,
    outliersRemoved: indices.outliersRemoved,
    ageBand: indices.ageBand,
    ageBandLabel: indices.ageBandLabel,
    ageReferenceRtMs: indices.ageReferenceRtMs,
    stabilityK: indices.stabilityK,
    stabilityKValidated: false,
    rtSpeedScored: false,
    overlap: indices.overlap,
    behaviors,
    version: "v3",
    flags: [
      "V3: RT hız puanı yok (yaş normu oluşana kadar ham medyan RT gösterilir).",
      `V3 stabilite K=${V3_STABILITY_K_EXPLORATORY} exploratory (doğrulanmış norm değil).`,
      "V3: Hedef (mavi üçgen) üzerinde hızlı basış T'de cezalandırılmaz."
    ]
  };
}
