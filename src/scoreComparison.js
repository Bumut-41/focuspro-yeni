/**
 * V1 / V2 skor karşılaştırma satırı — mevcut V1 raporlarını değiştirmez.
 */
import { computeMetrics, countHyperMotorStats, countTrialBehaviors } from "./metrics.js";
import { computeMetricsV2 } from "./metricsV2.js";

function safeNum(v) {
  return v == null || Number.isNaN(Number(v)) ? null : Number(v);
}

export function buildScoreComparison(logs, lateMs, age = null, pressTimeline = []) {
  const behaviors = countTrialBehaviors(logs ?? [], lateMs);
  const hyper = countHyperMotorStats(logs ?? [], pressTimeline ?? []);
  const idlePresses = (pressTimeline ?? []).filter((p) => p.errorType === "idle").length;

  const v1 = computeMetrics(logs ?? [], lateMs, { pressTimeline, age, locale: "tr" });
  const v2 = computeMetricsV2(logs ?? [], lateMs, pressTimeline ?? []);

  return {
    v1: {
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
    },
    v2: {
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
    },
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
      attention: safeNum(v2.attentionScore) - safeNum(v1.attentionScore),
      timing:
        v2.timingUnavailable || v2.speedScore == null
          ? null
          : safeNum(v2.speedScore) - safeNum(v1.speedScore),
      impulsivity: safeNum(v2.impulseScore) - safeNum(v1.impulseScore),
      hyperactivity: safeNum(v2.consistencyScore) - safeNum(v1.consistencyScore),
      overall:
        v2.overallUnavailable || v2.overallScore == null
          ? null
          : safeNum(v2.overallScore) - safeNum(v1.overallScore)
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
