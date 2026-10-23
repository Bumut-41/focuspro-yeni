/**
 * V1 / V2 / V3 skor karşılaştırma — mevcut V1 raporlarını değiştirmez.
 */
import { computeMetrics, countHyperMotorStats, countTrialBehaviors } from "./metrics.js";
import { computeMetricsV2 } from "./metricsV2.js";
import { computeMetricsV3 } from "./metricsV3.js";

function safeNum(v) {
  return v == null || Number.isNaN(Number(v)) ? null : Number(v);
}

function packV1(v1) {
  return {
    attention: v1.attentionScore,
    timing: v1.speedScore,
    impulsivity: v1.impulseScore,
    hyperactivity: v1.consistencyScore,
    overall: v1.overallScore,
    timingRtSpeed: v1.timingRtSpeed,
    timingRtStability: v1.timingRtStability,
    timingLateResponse: v1.timingLateResponse,
    timingOnTimeHit: v1.timingOnTimeHit,
    medianRt: v1.medianReaction,
    meanRt: v1.avgReaction,
    rtStd: v1.rtStd
  };
}

function packV2(v2) {
  return {
    attention: v2.attentionScore,
    timing: v2.speedScore,
    impulsivity: v2.impulseScore,
    hyperactivity: v2.consistencyScore,
    overall: v2.overallScore,
    timingUnavailable: v2.timingUnavailable,
    timingReason: v2.timingReason,
    timingRtSpeed: v2.timingRtSpeed,
    timingRtStability: v2.timingRtStability,
    timingLateResponse: v2.timingLateResponse,
    medianRt: v2.medianRt,
    meanRt: v2.meanRt,
    rtStd: v2.rtStd,
    cv: v2.cv,
    rushUnder150: v2.rushUnder150,
    rtN: v2.rtN,
    rtNRaw: v2.rtNRaw,
    outliersRemoved: v2.outliersRemoved
  };
}

function packV3(v3) {
  return {
    attention: v3.attentionScore,
    timing: v3.speedScore,
    impulsivity: v3.impulseScore,
    hyperactivity: v3.consistencyScore,
    overall: v3.overallScore,
    timingUnavailable: v3.timingUnavailable,
    timingReason: v3.timingReason,
    timingRtSpeed: null,
    timingRtStability: v3.timingRtStability,
    timingLateResponse: v3.timingLateResponse,
    medianRt: v3.medianRt,
    meanRt: v3.meanRt,
    rtStd: v3.rtStd,
    cv: v3.cv,
    rushUnder150: v3.rushUnder150,
    rtN: v3.rtN,
    rtNRaw: v3.rtNRaw,
    outliersRemoved: v3.outliersRemoved,
    ageBand: v3.ageBand,
    ageBandLabel: v3.ageBandLabel,
    ageReferenceRtMs: v3.ageReferenceRtMs,
    stabilityK: v3.stabilityK,
    rtSpeedScored: false,
    overlap: v3.overlap
  };
}

function deltaTiming(a, bUnavailable, bScore) {
  if (bUnavailable || bScore == null || a == null) return null;
  return safeNum(bScore) - safeNum(a);
}

function deltaOverall(a, bUnavailable, bScore) {
  if (bUnavailable || bScore == null || a == null) return null;
  return safeNum(bScore) - safeNum(a);
}

export function buildScoreComparison(logs, lateMs, age = null, pressTimeline = []) {
  const behaviors = countTrialBehaviors(logs ?? [], lateMs);
  const hyper = countHyperMotorStats(logs ?? [], pressTimeline ?? []);
  const idlePresses = (pressTimeline ?? []).filter((p) => p.errorType === "idle").length;

  const v1m = computeMetrics(logs ?? [], lateMs, { pressTimeline, age, locale: "tr" });
  const v2m = computeMetricsV2(logs ?? [], lateMs, pressTimeline ?? []);
  const v3m = computeMetricsV3(logs ?? [], lateMs, pressTimeline ?? [], age);

  const v1 = packV1(v1m);
  const v2 = packV2(v2m);
  const v3 = packV3(v3m);

  return {
    v1,
    v2,
    v3,
    counts: {
      targets: behaviors.targets,
      omissions: behaviors.omissions,
      hits: behaviors.hits,
      late: behaviors.late,
      falseAlarms: behaviors.falseAlarms,
      multiTrials: hyper.multiTrials,
      multiPresses: hyper.multiPresses,
      idlePresses,
      totalTrials: behaviors.totalTrials
    },
    delta: {
      // V2 − V1 (geriye uyum)
      attention: safeNum(v2.attention) - safeNum(v1.attention),
      timing: deltaTiming(v1.timing, v2.timingUnavailable, v2.timing),
      impulsivity: safeNum(v2.impulsivity) - safeNum(v1.impulsivity),
      hyperactivity: safeNum(v2.hyperactivity) - safeNum(v1.hyperactivity),
      overall: deltaOverall(v1.overall, v2.overallUnavailable ?? v2.timingUnavailable, v2.overall),
      // V3 − V1
      v3: {
        attention: safeNum(v3.attention) - safeNum(v1.attention),
        timing: deltaTiming(v1.timing, v3.timingUnavailable, v3.timing),
        impulsivity: safeNum(v3.impulsivity) - safeNum(v1.impulsivity),
        hyperactivity: safeNum(v3.hyperactivity) - safeNum(v1.hyperactivity),
        overall: deltaOverall(v1.overall, v3.overallUnavailable ?? v3.timingUnavailable, v3.overall)
      },
      // V3 − V2
      v3v2: {
        timing: deltaTiming(v2.timing, v3.timingUnavailable, v3.timing),
        overall: deltaOverall(v2.overall, v3.overallUnavailable ?? v3.timingUnavailable, v3.overall)
      }
    }
  };
}

export function formatScoreCell(v) {
  if (v == null || Number.isNaN(v)) return "—";
  return String(Math.round(v));
}

export function timingUnavailableLabel(reason) {
  if (reason === "no_valid_rt") return "Geçerli RT yok";
  if (reason === "insufficient_rt") return "Yetersiz RT verisi";
  if (reason === "stability_undefined") return "Stabilite hesaplanamadı";
  if (reason === "no_targets" || reason === "no_trials") return "Hedef/deneme yok";
  return "T hesaplanamadı";
}
