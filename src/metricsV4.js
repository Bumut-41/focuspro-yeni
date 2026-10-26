/**
 * FocusProLab skorlama V4 (deneme / pilot rapor paketi).
 *
 * Skor motoru V3 ile aynıdır:
 * - A / I / H değişmez
 * - T = 0.55×Stabilite + 0.45×Geç yanıt (hız puanı yok; K=100 exploratory)
 * - V2'nin 450 ms merkezli hız puanı kullanılmaz
 *
 * V4 farkı: rapor dili, faz sırası, oturum veri kalitesi ve klinik yorumlar
 * (pdfReport scoringVersion === "v4" + ilgili metinler).
 */

import { computeMetricsV3, computeIndexScoresV3, computeTimingComponentsV3 } from "./metricsV3.js";

export {
  V3_STABILITY_K_EXPLORATORY as V4_STABILITY_K_EXPLORATORY,
  V3_T_WEIGHT_STABILITY as V4_T_WEIGHT_STABILITY,
  V3_T_WEIGHT_LATE as V4_T_WEIGHT_LATE,
  V3_MIN_RT_SAMPLES as V4_MIN_RT_SAMPLES,
  ageBandKey,
  ageBandLabelTr,
  buildTimingAttentionOverlap
} from "./metricsV3.js";

export function computeTimingComponentsV4(behaviors, onTimeRts, age = null) {
  return computeTimingComponentsV3(behaviors, onTimeRts, age);
}

export function computeIndexScoresV4(behaviors, logs, pressTimeline = [], lateMs, age = null) {
  const idx = computeIndexScoresV3(behaviors, logs, pressTimeline, lateMs, age);
  return { ...idx, version: "v4" };
}

export function computeMetricsV4(logs, lateMs, pressTimeline = [], age = null) {
  const m = computeMetricsV3(logs, lateMs, pressTimeline, age);
  return {
    ...m,
    version: "v4",
    flags: [
      ...(m.flags || []).filter((f) => !String(f).startsWith("V3:")),
      "V4: T = 0.55×stabilite + 0.45×geç yanıt (hız puanı yok; CV K exploratory).",
      "V4: Rapor dili oturum veri kalitesi / geçici algoritmik kategoriler kullanır."
    ]
  };
}
