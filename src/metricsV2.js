/**
 * FocusProLab skorlama V2 (deneme / pilot).
 * V1 (metrics.js) değiştirilmez. Karşılaştırma ve V2 raporu için kullanılır.
 *
 * Genel ağırlıklar V1 ile aynı: A30 T25 I30 H15
 * A / I / H V1 ile aynı; yalnızca T yeniden tanımlanır.
 */

import {
  OVERALL_WEIGHTS,
  TIMING_RUSH_MS,
  computeHyperactivityScore,
  countHyperMotorStats,
  countTrialBehaviors
} from "./metrics.js";

/** Pilot merkez RT (ms) — doğrulanmış norm değildir. */
export const V2_RT_CENTER_MS = 450;
/** RT hızı: her 5 ms sapma ≈ 1 puan */
export const V2_RT_SPEED_DIVISOR = 5;
/** Stabilite: 100 − 200 × (SD / mean) */
export const V2_STABILITY_K = 200;
/** T hesabı için minimum geçerli (outlier temizliği sonrası) RT sayısı */
export const V2_MIN_RT_SAMPLES = 5;

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
function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] * (1 - (idx - lo)) + sorted[hi] * (idx - lo);
}

/**
 * Zamanında + geçerli RT'ler (≥150 ms, ≤ lateMs).
 * 150 ms altı RT analizine girmez; geçerlilikte ayrıca sayılır.
 */
export function collectValidOnTimeRts(logs, lateMs) {
  const allOnTime = [];
  const rushUnder150 = [];
  for (const t of logs) {
    if (!t.isTarget || !t.responded) continue;
    const rt = t.reactionTime;
    if (!(rt > 0) || rt > lateMs) continue;
    if (rt < TIMING_RUSH_MS) {
      rushUnder150.push(rt);
      continue;
    }
    allOnTime.push(rt);
  }
  return { onTimeRts: allOnTime, rushUnder150 };
}

/** IQR ile aykırı RT temizliği (1.5×IQR). */
export function removeRtOutliersIqr(rts) {
  if (rts.length < 4) return [...rts];
  const sorted = [...rts].sort((x, y) => x - y);
  const q1 = percentile(sorted, 25);
  const q3 = percentile(sorted, 75);
  const iqr = q3 - q1;
  const lo = q1 - 1.5 * iqr;
  const hi = q3 + 1.5 * iqr;
  return rts.filter((r) => r >= lo && r <= hi);
}

/**
 * V2 T alt bileşenleri.
 * Zİ (zamanında isabet oranı) T'de yok — A zaten ihmal üzerinden ölçülüyor.
 */
export function computeTimingComponentsV2(behaviors, onTimeRts) {
  const empty = {
    score: null,
    unavailable: true,
    reason: "no_targets",
    rtSpeed: null,
    rtStability: null,
    lateResponse: null,
    medianRt: null,
    meanRt: null,
    rtStd: null,
    cv: null,
    rtN: 0,
    rtNRaw: 0,
    outliersRemoved: 0
  };
  if (!behaviors?.targets) return empty;

  const lateResponse = clamp(100 * (1 - safeDiv(behaviors.late, behaviors.targets)));
  const raw = Array.isArray(onTimeRts) ? onTimeRts : [];
  const cleaned = removeRtOutliersIqr(raw);
  const outliersRemoved = raw.length - cleaned.length;

  if (cleaned.length < V2_MIN_RT_SAMPLES) {
    return {
      ...empty,
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

  const rtSpeed = clamp(100 - Math.abs(med - V2_RT_CENTER_MS) / V2_RT_SPEED_DIVISOR);
  const rtStability =
    cv == null || !Number.isFinite(cv) ? null : clamp(100 - V2_STABILITY_K * cv);

  if (rtStability == null) {
    return {
      ...empty,
      reason: "stability_undefined",
      lateResponse: Math.round(lateResponse),
      rtSpeed: Math.round(rtSpeed),
      medianRt: Math.round(med),
      meanRt: Math.round(rtMean),
      rtStd: Math.round(rtStd),
      rtN: cleaned.length,
      rtNRaw: raw.length,
      outliersRemoved
    };
  }

  const score = clamp(rtSpeed * 0.4 + rtStability * 0.4 + lateResponse * 0.2);

  return {
    score: Math.round(score),
    unavailable: false,
    reason: null,
    rtSpeed: Math.round(rtSpeed),
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

export function computeIndexScoresV2(behaviors, logs, pressTimeline = [], lateMs) {
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
      version: "v2"
    };
  }

  const omissionRatio = safeDiv(behaviors.omissions, behaviors.targets);
  const targetDetections = behaviors.hits + behaviors.late;
  const attentionRaw = safeDiv(targetDetections, behaviors.targets) * 100;
  const attention = clamp(100 - omissionRatio * 100);

  const { onTimeRts, rushUnder150 } = collectValidOnTimeRts(logs, lateMs);
  const timingParts = computeTimingComponentsV2(behaviors, onTimeRts);

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
    timingRtSpeed: timingParts.rtSpeed,
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
    version: "v2"
  };
}

/** V2 metrik paketi — V1 computeMetrics ile aynı alan adlarına yakın. */
export function computeMetricsV2(logs, lateMs, pressTimeline = []) {
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
      version: "v2"
    };
  }

  const behaviors = countTrialBehaviors(logs, lateMs);
  const indices = computeIndexScoresV2(behaviors, logs, pressTimeline, lateMs);
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
    timingRtSpeed: indices.timingRtSpeed,
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
    behaviors,
    version: "v2",
    flags: indices.rushUnder150 > 0 ? [`Aşırı hızlı yanıt (<${TIMING_RUSH_MS} ms): ${indices.rushUnder150}`] : []
  };
}
