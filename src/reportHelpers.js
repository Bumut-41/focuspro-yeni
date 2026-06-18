import { getStrings } from "./i18n/index.js";
import {
  computeMetrics,
  countTrialBehaviors,
  getAttentionLevelText,
  getImpulsivityLevelText,
  getOverallRiskText,
  riskLabel
} from "./metrics.js";
import { buildReportPhaseBuckets, logsForBucket } from "./report/phaseBuckets.js";
import { normLevelFromZ, normLevelTextFromZ, normZScore } from "./reportNorms.js";

function inverseNormalCDF(p) {
  if (p <= 0 || p >= 1) return 0;
  const a1 = -39.6968302866538;
  const a2 = 220.946098424521;
  const a3 = -275.928510446969;
  const a4 = 138.357751867269;
  const a5 = -30.6647980661472;
  const a6 = 2.50662827745924;
  const b1 = -54.4760987982241;
  const b2 = 161.585836858041;
  const b3 = -155.698979859887;
  const b4 = 66.8013118877197;
  const b5 = -13.2806815528857;
  const c1 = -0.00778489400243029;
  const c2 = -0.322396458041136;
  const c3 = -2.40075827716184;
  const c4 = -2.54973253934373;
  const c5 = 4.37466414146497;
  const c6 = 2.93816398269878;
  const d1 = 0.00778469570904146;
  const d2 = 0.32246712907004;
  const d3 = 2.445134137143;
  const d4 = 3.75440866190742;
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q;
  let r;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }
  if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q / (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
}

function correctedRate(rate, total) {
  if (!total || total <= 0) return 0.5;
  if (rate <= 0) return 0.5 / total;
  if (rate >= 1) return 1 - 0.5 / total;
  return rate;
}

function normalizeMetricOptions(third, fourth) {
  if (Array.isArray(third)) return { pressTimeline: third, age: fourth ?? null, locale: "tr" };
  if (third && typeof third === "object") {
    return {
      pressTimeline: third.pressTimeline ?? [],
      age: third.age ?? null,
      locale: third.locale ?? "tr"
    };
  }
  return { pressTimeline: [], age: fourth ?? null, locale: "tr" };
}

export function timelineForBucket(pressTimeline, bucket) {
  const names = new Set(bucket.phaseNames);
  return (pressTimeline ?? []).filter((p) => p.section && names.has(p.section));
}

/** Katılımcı raporu — tek kaynak (UI, PDF, DB). */
export function computeReportMetrics(logs, lateMs, metricOptions = null, age = null) {
  return computeDetailedMetrics(logs, lateMs, metricOptions, age);
}

/** Genişletilmiş metrikler (d-prime, davranış sayımları, dört endeks). */
export function computeDetailedMetrics(logs, lateMs, metricOptions = null, age = null) {
  const opts = normalizeMetricOptions(metricOptions, age);
  const base = computeMetrics(logs, lateMs, opts);
  const targets = logs.filter((t) => t.isTarget);
  const nonT = logs.filter((t) => !t.isTarget);
  const hits = targets.filter((t) => t.responded && t.reactionTime <= lateMs);
  const allTargetResp = targets.filter((t) => t.responded);
  const omissions = targets.filter((t) => !t.responded);
  const late = targets.filter((t) => t.responded && t.reactionTime > lateMs);
  const fa = nonT.filter((t) => t.responded);
  const correctRej = nonT.filter((t) => !t.responded);
  const multi = logs.filter((t) => t.responseCount > 1);
  const hitRateRaw = targets.length ? allTargetResp.length / targets.length : 0;
  const faRateRaw = nonT.length ? fa.length / nonT.length : 0;
  const targetRespRate = targets.length ? allTargetResp.length / targets.length : 0;
  const zHit = inverseNormalCDF(correctedRate(hitRateRaw, targets.length));
  const zFa = inverseNormalCDF(correctedRate(faRateRaw, nonT.length));
  const dPrime = Number((zHit - zFa).toFixed(2));
  const criterionC = Number((-0.5 * (zHit + zFa)).toFixed(2));
  const beta =
    Math.abs(dPrime) > 0.05 ? Number(Math.exp(-criterionC * dPrime).toFixed(2)) : null;

  let perseverationCount = 0;
  for (let i = 1; i < logs.length; i++) {
    const prev = logs[i - 1];
    const cur = logs[i];
    if (!cur.isTarget && cur.responded && !prev.isTarget && prev.responded) perseverationCount++;
  }
  const perseverationRate = logs.length ? (perseverationCount / logs.length) * 100 : 0;

  return {
    ...base,
    targets: targets.length,
    nonTargets: nonT.length,
    correctHits: hits.length,
    correctRejects: correctRej.length,
    omissions: omissions.length,
    lateResponses: late.length,
    impulsiveErrors: fa.length,
    multiPress: multi.length,
    hitRate: targets.length ? hitRateRaw * 100 : 0,
    commissionRate: faRateRaw * 100,
    perseverationCount,
    perseverationRate,
    dPrime,
    criterionC,
    beta
  };
}

export function shortPhaseLabel(name) {
  const s = (name || "").replace(/^[^—]+—\s*/, "").trim();
  return s.length > 28 ? `${s.slice(0, 26)}…` : s;
}

/** Faz adından norm tablosu anahtarı */
export function mapSectionToNormPhase(sectionName) {
  const s = (sectionName || "").toLowerCase();
  if (s.includes("sessiz + sesli") || s.includes("sesli gif")) return "kombine2";
  if (s.includes("sessiz gif")) return /3–6|3-6|6–9|6-9/.test(s) ? "gorsel1" : "gorsel2";
  if (s.includes("sadece ses")) return /6–8|6-8|6–9|6-9/.test(s) ? "isitsel1" : "isitsel2";
  if (/11–12|12–13|13–14|14–15|11-12|12-13/.test(s)) return "temel2";
  if (/8–11|8-11|9–12|9-12/.test(s)) return "kombine1";
  if (/0–1|1–2|2–3|0-1|1-2|2-3/.test(s) && !s.includes("gif") && !s.includes("ses")) return "temel1";
  const k = reportPhaseKey(sectionName);
  return k === "other" ? "temel1" : k;
}

/** 8 grafik noktası — temel 3 + 3 çeldirici + kapanış 2. */
export function getAllPhaseChartScores(logs, profile) {
  return getReportPhaseChartScores(logs, profile);
}

export function getReportPhaseChartScores(logs, profile, age = null, pressTimeline = []) {
  return buildReportPhaseBuckets(profile)
    .map((bucket) => {
      const list = logsForBucket(logs, bucket);
      if (!list.length) return null;
      const tl = timelineForBucket(pressTimeline, bucket);
      const m = computeDetailedMetrics(list, profile.lateResponseMs, { pressTimeline: tl, age });
      const sc = getScores(m);
      return {
        label: bucket.label,
        axisLabel: bucket.axisLabel,
        phaseKey: bucket.phaseKey,
        attention: sc.attention,
        timing: sc.timing,
        impulsivity: sc.impulsivity,
        hyperactivity: sc.hyperactivity
      };
    })
    .filter(Boolean);
}

export function computeValidityFlags(logs, metrics, profile, locale = "tr") {
  const vm = getStrings(locale).metrics;
  const flags = [];
  // Yetişkin/ergen ramp fazları 30 sn dilimler; boş dilim uyarısı yanıltıcı olabilir — 8 rapor kutusu kontrol edilir.
  const missingBuckets = buildReportPhaseBuckets(profile).filter(
    (bucket) => !logsForBucket(logs, bucket).length
  );
  if (missingBuckets.length) {
    flags.push(vm.validityMissingPhase.replace("{{count}}", missingBuckets.length));
  }

  const targetHits = logs.filter((t) => t.isTarget && t.responded && t.reactionTime > 0);
  const tooFast = targetHits.filter((t) => t.reactionTime < 150).length;
  if (targetHits.length && tooFast / targetHits.length > 0.05) {
    flags.push(vm.validityTooFast);
  }

  const avgInterval =
    profile.phases?.length > 0
      ? profile.phases.reduce((s, p) => s + p.stimulus + p.gap, 0) / profile.phases.length
      : 1500;
  const expectedTrials = Math.round(profile.durationMs / avgInterval);
  if (metrics.totalTrials < expectedTrials * 0.6) {
    flags.push(vm.validityFewTrials);
  }

  if (metrics.omissionRate >= 40 && metrics.falseAlarmRate >= 25) {
    flags.push(vm.validityScattered);
  }

  if (metrics.correctHits + metrics.lateResponses === 0 && metrics.targets >= 15) {
    flags.push(vm.validityNoOnTimeHits);
  }
  if (metrics.hitRate < 15 && metrics.targets >= 15) {
    flags.push(vm.validityLowEngagement);
  }
  if (metrics.lateRate >= 30) {
    flags.push(vm.validityHighLate);
  }

  return flags;
}

export function computeSustainabilityIndex(logs, profile, age = null, pressTimeline = [], locale = "tr") {
  const sm = getStrings(locale).metrics;
  const buckets = buildReportPhaseBuckets(profile);
  if (buckets.length < 4) {
    return { delta: null, firstAvg: null, lastAvg: null, label: sm.insufficientData };
  }
  const late = profile.lateResponseMs;
  const scoreOf = (bucket) => {
    const list = logsForBucket(logs, bucket);
    if (!list.length) return null;
    const tl = timelineForBucket(pressTimeline, bucket);
    return computeDetailedMetrics(list, late, { pressTimeline: tl, age }).overallScore;
  };
  const firstScores = buckets.slice(0, 2).map(scoreOf).filter((v) => v != null);
  const lastScores = buckets.slice(-2).map(scoreOf).filter((v) => v != null);
  if (!firstScores.length || !lastScores.length) {
    return { delta: null, firstAvg: null, lastAvg: null, label: sm.insufficientData };
  }
  const firstAvg = firstScores.reduce((a, b) => a + b, 0) / firstScores.length;
  const lastAvg = lastScores.reduce((a, b) => a + b, 0) / lastScores.length;
  const delta = lastAvg - firstAvg;
  let label;
  if (delta >= 5) label = sm.sustainWarmup;
  else if (delta >= -5) label = sm.sustainStable;
  else if (delta >= -15) label = sm.sustainMild;
  else label = sm.sustainMarked;
  return {
    delta: Math.round(delta),
    firstAvg: Math.round(firstAvg),
    lastAvg: Math.round(lastAvg),
    label
  };
}

export function computeVigilanceIndex(logs, profile, age = null, pressTimeline = []) {
  const s = computeSustainabilityIndex(logs, profile, age, pressTimeline);
  return {
    deltaAttention: s.delta,
    deltaTiming: null,
    deltaRt: null,
    label: s.label,
    firstAvg: s.firstAvg,
    lastAvg: s.lastAvg
  };
}

export function formatDurationSeconds(ms) {
  return Math.round(ms / 1000);
}

export function formatRate(v) {
  return `%${Number(v).toFixed(1)}`;
}

export function getScores(m) {
  return {
    overall: Math.round(m.overallScore),
    attention: Math.round(m.attentionScore),
    timing: Math.round(m.speedScore),
    impulsivity: Math.round(m.impulseScore),
    hyperactivity: Math.round(m.consistencyScore)
  };
}

export function getLevel(score) {
  if (score >= 85) return 1;
  if (score >= 70) return 2;
  if (score >= 55) return 3;
  if (score >= 40) return 4;
  return 5;
}

export function getLevelText(score, locale = "tr") {
  return getOverallRiskText(score, locale);
}

export function getAttentionIndexText(score) {
  return getAttentionLevelText(score);
}

export function getImpulsivityIndexText(score) {
  return getImpulsivityLevelText(score);
}

export function getScoreColor(score) {
  const level = getLevel(score);
  if (level === 1) return "#0d9488";
  if (level === 2) return "#65a30d";
  if (level === 3) return "#f59e0b";
  return "#dc2626";
}

/** @deprecated Norm tablosu için reportNorms.normZScore kullanın */
export function pseudoZScore(score) {
  return Number(((score - 75) / 12).toFixed(2));
}

export function getGlobalIndexZScores(scores, profileKey) {
  return {
    attention: normZScore(scores.attention, profileKey, "global", "attention"),
    timing: normZScore(scores.timing, profileKey, "global", "timing"),
    impulsivity: normZScore(scores.impulsivity, profileKey, "global", "impulsivity"),
    hyperactivity: normZScore(scores.hyperactivity, profileKey, "global", "hyperactivity")
  };
}

export function severityLevel(score) {
  if (score >= 45) return 1;
  if (score >= 35) return 2;
  if (score >= 25) return 3;
  return 4;
}

export function getPhaseComment(sectionName, score) {
  if (score >= 75) return "Performans bu fazda genel olarak korunmuştur.";
  const s = sectionName.toLowerCase();
  if (s.includes("sessiz + sesli") || s.includes("sesli gif")) {
    return "Birleşik çeldiriciler altında dikkat ve dürtü kontrolü zorlanmış olabilir.";
  }
  if (s.includes("sessiz gif")) return "Görsel çeldiriciler altında dikkat performansı etkilenmiş olabilir.";
  if (s.includes("sadece ses")) return "İşitsel çeldiriciler altında performans etkilenmiş olabilir.";
  if (/11–|12–|13–|14–|15–|11-|12-|13-|14-|15-/.test(s)) {
    return "Testin son bölümünde yorgunluk etkisi görülebilir.";
  }
  return "Bu fazda performansta düşüş izlenmiştir.";
}

export function getBehaviorRates(behaviors) {
  if (!behaviors?.totalTrials) {
    return {
      hitRate: 0,
      omissionRate: 0,
      lateRate: 0,
      falseAlarmRate: 0,
      multiPressRate: 0,
      correctRejectRate: 0
    };
  }
  const { hits, omissions, late, falseAlarms, correctRejects, multiPress, targets, nonTargets, totalTrials } =
    behaviors;
  return {
    hitRate: targets ? (hits / targets) * 100 : 0,
    omissionRate: targets ? (omissions / targets) * 100 : 0,
    lateRate: targets ? (late / targets) * 100 : 0,
    falseAlarmRate: nonTargets ? (falseAlarms / nonTargets) * 100 : 0,
    multiPressRate: (multiPress / totalTrials) * 100,
    correctRejectRate: nonTargets ? (correctRejects / nonTargets) * 100 : 0
  };
}

/** 8 faz × davranış türleri tablosu. */
export function getReportPhaseBehaviorTable(logs, profile, age = null, pressTimeline = []) {
  const late = profile.lateResponseMs;
  return buildReportPhaseBuckets(profile).map((bucket) => {
    const list = logsForBucket(logs, bucket);
    const behaviors = countTrialBehaviors(list, late);
    const rates = getBehaviorRates(behaviors);
    const tl = timelineForBucket(pressTimeline, bucket);
    const m = computeDetailedMetrics(list, late, { pressTimeline: tl, age });
    const sc = getScores(m);
    return {
      label: bucket.label,
      axisLabel: bucket.axisLabel,
      kind: bucket.kind,
      behaviors,
      rates,
      attention: sc.attention,
      timing: sc.timing,
      impulsivity: sc.impulsivity,
      hyperactivity: sc.hyperactivity,
      comment: getPhaseComment(bucket.label, sc.overall)
    };
  });
}

export function buildNarrativeComment(scores, zGlobal) {
  const lines = [];
  if (scores.attention >= 70) {
    lines.push("Dikkat performansı genel olarak yeterlidir (ihmal düşük).");
  } else if (scores.attention >= 60) {
    lines.push("Dikkat performansı orta düzeydedir (ihmal artmış olabilir).");
  } else {
    lines.push("Dikkat alanında belirgin ihmal (kaçırma) gözlenmiştir.");
  }
  if (scores.timing < 70 || zGlobal.timing < -1) {
    lines.push("Zamanlama alanında geç tepki, acele yanıt veya yavaşlama gözlenmiştir.");
  } else {
    lines.push("Zamanlama performansı kabul edilebilir düzeydedir.");
  }
  if (scores.impulsivity >= 75) {
    lines.push("Dürtüsellik (commission / hedef dışı ilk tepki) belirgin değildir.");
  } else if (scores.impulsivity >= 60) {
    lines.push("Hafif dürtüsellik (commission) göstergeleri izlenmiştir.");
  } else {
    lines.push("Dürtüsellik alanında belirgin commission hataları gözlenmiştir.");
  }
  if (scores.hyperactivity >= 75) {
    lines.push("Motor hiperaktivite (mükerrer veya yönerge dışı basış) belirgin değildir.");
  } else if (scores.hyperactivity >= 60) {
    lines.push("Hafif motor hiperaktivite göstergeleri izlenmiştir.");
  } else {
    lines.push("Motor hiperaktivite: mükerrer basış veya yönerge dışı tuş kullanımı dikkat çekmektedir.");
  }
  return lines.join(" ");
}

export function buildMoxoSummary(scores, metrics, profile, vigilance) {
  const z = getGlobalIndexZScores(scores, profile.key ?? "adult");
  const weakest = [
    { key: "A", label: "Dikkat", score: scores.attention, z: z.attention },
    { key: "T", label: "Zamanlama", score: scores.timing, z: z.timing },
    { key: "I", label: "Dürtüsellik", score: scores.impulsivity, z: z.impulsivity },
    { key: "H", label: "Hiper-reaktivite", score: scores.hyperactivity, z: z.hyperactivity }
  ].sort((a, b) => a.z - b.z)[0];

  const narrative = buildNarrativeComment(scores, z);
  const genelCalc = `Genel Skor = ${scores.attention}×0.35 + ${scores.timing}×0.30 + ${scores.impulsivity}×0.20 + ${scores.hyperactivity}×0.15 = ${scores.overall}`;

  return [
    `MOXO Özeti (FocusPro): A: ${scores.attention}, T: ${scores.timing}, I: ${scores.impulsivity}, H: ${scores.hyperactivity}. ${genelCalc}. ${getOverallRiskText(scores.overall)}.`,
    narrative,
    `Norma göre en düşük alan: ${weakest.label} (z=${weakest.z.toFixed(2)}, ${normLevelTextFromZ(weakest.z)}).`,
    `Sürdürülebilir performans (ilk 2 / son 2 blok): ${vigilance.label}${vigilance.firstAvg != null ? ` (başlangıç ${vigilance.firstAvg}, bitiş ${vigilance.lastAvg})` : ""}.`,
    metrics.flags.length ? `Ek bulgular: ${metrics.flags.join("; ")}.` : "",
    "Sonuçlar yalnızca nitelikli profesyonel değerlendirme için ön bilgi sağlar."
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** MOXO tarzı rapor faz anahtarı */
export function reportPhaseKey(sectionName) {
  const s = (sectionName || "").toLowerCase();
  if (s.includes("sessiz + sesli") || s.includes("sesli gif")) return "kombine2";
  if (s.includes("sessiz gif")) return "gorsel2";
  if (s.includes("sadece ses")) return "isitsel2";
  if (/1[2-5]\s*dk|11–12|12–13|13–14|14–15/.test(s) || s.includes("11-12") || s.includes("12-13")) {
    return "temel2";
  }
  if (/0–1|1–2|2–3|0-1|1-2|2-3/.test(s) && !s.includes("gif") && !s.includes("ses")) return "temel1";
  return "other";
}

export const CHART_PHASE_LABELS = [
  { key: "temel1", label: "Temel - 1 (Baz)" },
  { key: "gorsel2", label: "Görsel - 2" },
  { key: "isitsel2", label: "İşitsel - 2" },
  { key: "kombine2", label: "Kombine - 2" }
];

export const FULL_PHASE_LEGEND = [
  ["Temel - 1 (Baz)", "Temel bölüm — hedef odaklı sürekli performans"],
  ["Görsel - 2", "Büyük görsel dikkat dağıtıcılar (sessiz gif)"],
  ["İşitsel - 2", "Büyük işitsel dikkat dağıtıcılar"],
  ["Kombine - 2", "Büyük birleşik görsel + işitsel dikkat dağıtıcılar"],
  ["Temel - 2", "Sürekli performans — test kapanışı"]
];

export function getSectionSummaries(logs, profile, age = null, pressTimeline = []) {
  const late = profile.lateResponseMs;
  return buildReportPhaseBuckets(profile).map((bucket) => {
    const list = logsForBucket(logs, bucket);
    const tl = timelineForBucket(pressTimeline, bucket);
    const m = computeDetailedMetrics(list, late, { pressTimeline: tl, age });
    const sc = getScores(m);
    const behaviors = countTrialBehaviors(list, late);
    const rates = getBehaviorRates(behaviors);
    return {
      section: bucket.label,
      shortLabel: bucket.label,
      axisLabel: bucket.axisLabel,
      totalTrials: m.totalTrials,
      attentionScore: sc.attention,
      timingScore: sc.timing,
      impulsivityScore: sc.impulsivity,
      hyperactivityScore: sc.hyperactivity,
      behaviors,
      rates,
      accuracy: m.accuracy,
      omissionRate: rates.omissionRate,
      falseAlarmRate: rates.falseAlarmRate,
      medianReaction: m.medianReaction,
      comment: getPhaseComment(bucket.label, sc.overall)
    };
  });
}

export function getChartPhaseScores(logs, profile) {
  const buckets = Object.fromEntries(CHART_PHASE_LABELS.map((p) => [p.key, []]));
  for (const t of logs) {
    const key = reportPhaseKey(t.section);
    if (buckets[key]) buckets[key].push(t);
  }
  return CHART_PHASE_LABELS.map(({ key, label }) => {
    const slice = buckets[key];
    if (!slice.length) {
      return { label, attention: null, timing: null, impulsivity: null, hyperactivity: null };
    }
    const m = computeDetailedMetrics(slice, profile.lateResponseMs);
    const sc = getScores(m);
    return {
      label,
      phaseKey: key,
      attention: sc.attention,
      timing: sc.timing,
      impulsivity: sc.impulsivity,
      hyperactivity: sc.hyperactivity
    };
  }).filter((row) => row.attention != null);
}

function phaseLogs(logs, matcher) {
  return logs.filter((t) => matcher((t.section || "").toLowerCase()));
}

function distractorEffectCell(temelScore, celdiriciScore) {
  if (temelScore == null || celdiriciScore == null || temelScore <= 0) {
    return { text: "—", color: "#64748b" };
  }
  const pct = ((temelScore - celdiriciScore) / temelScore) * 100;
  let band;
  if (pct < -5) band = "Düzelme";
  else if (pct <= 5) band = "Etki yok";
  else if (pct <= 15) band = "Hafif etki";
  else if (pct <= 30) band = "Orta etki";
  else band = "Belirgin etki";
  const color = pct > 30 ? "#dc2626" : pct > 15 ? "#f59e0b" : "#64748b";
  return { text: `${band} (${pct.toFixed(0)}%)`, color };
}

function sustainabilityCell(logs, profile, age, pressTimeline, key) {
  const buckets = buildReportPhaseBuckets(profile);
  const late = profile.lateResponseMs;
  const idxOf = (bucket) => {
    const list = logsForBucket(logs, bucket);
    if (!list.length) return null;
    const tl = timelineForBucket(pressTimeline, bucket);
    return getScores(computeDetailedMetrics(list, late, { pressTimeline: tl, age }))[key];
  };
  const first = buckets.slice(0, 2).map(idxOf).filter((v) => v != null);
  const last = buckets.slice(-2).map(idxOf).filter((v) => v != null);
  if (!first.length || !last.length) return { text: "—", color: "#64748b" };
  const firstAvg = first.reduce((a, b) => a + b, 0) / first.length;
  const lastAvg = last.reduce((a, b) => a + b, 0) / last.length;
  const delta = lastAvg - firstAvg;
  let text;
  if (delta >= 5) text = `Isınma (+${delta.toFixed(0)})`;
  else if (delta >= -5) text = "Değişiklik yok";
  else if (delta >= -15) text = `Hafif düşüş (${delta.toFixed(0)})`;
  else text = `Belirgin bozulma (${delta.toFixed(0)})`;
  const color = delta < -15 ? "#dc2626" : delta < -5 ? "#f59e0b" : "#64748b";
  return { text, color };
}

/** Dört endeks × çeldirici özeti — yüzde etki bantları. */
export function getDistractorSummaryMatrix(logs, profile, age = null, pressTimeline = []) {
  const late = profile.lateResponseMs;
  const opts = { pressTimeline, age };
  const baseline = phaseLogs(
    logs,
    (s) => /0–1|1–2|2–3|0-1|1-2|2-3/.test(s) && !s.includes("gif") && !s.includes("ses")
  );
  const visual = phaseLogs(logs, (s) => s.includes("sessiz gif") && !s.includes("sesli"));
  const auditory = phaseLogs(logs, (s) => s.includes("sadece ses"));
  const combined = phaseLogs(logs, (s) => s.includes("sessiz + sesli") || s.includes("sesli gif"));
  const allDistractors = [...visual, ...auditory, ...combined];

  const scoreOf = (list) => (list.length ? getScores(computeDetailedMetrics(list, late, opts)) : null);

  const baseSc = scoreOf(baseline);
  const visSc = scoreOf(visual);
  const audSc = scoreOf(auditory);
  const combSc = scoreOf(combined);
  const loadSc = scoreOf(allDistractors);

  const effect = (distSc, key) => distractorEffectCell(baseSc?.[key], distSc?.[key]);

  return [
    {
      name: "Sürdürülebilir performans",
      A: sustainabilityCell(logs, profile, age, pressTimeline, "attention"),
      T: sustainabilityCell(logs, profile, age, pressTimeline, "timing"),
      I: sustainabilityCell(logs, profile, age, pressTimeline, "impulsivity"),
      H: sustainabilityCell(logs, profile, age, pressTimeline, "hyperactivity")
    },
    {
      name: "Görsel",
      A: effect(visSc, "attention"),
      T: effect(visSc, "timing"),
      I: effect(visSc, "impulsivity"),
      H: effect(visSc, "hyperactivity")
    },
    {
      name: "İşitsel",
      A: effect(audSc, "attention"),
      T: effect(audSc, "timing"),
      I: effect(audSc, "impulsivity"),
      H: effect(audSc, "hyperactivity")
    },
    {
      name: "Kombine",
      A: effect(combSc, "attention"),
      T: effect(combSc, "timing"),
      I: effect(combSc, "impulsivity"),
      H: effect(combSc, "hyperactivity")
    },
    {
      name: "Çeldirici yükü",
      A: effect(loadSc, "attention"),
      T: effect(loadSc, "timing"),
      I: effect(loadSc, "impulsivity"),
      H: effect(loadSc, "hyperactivity")
    }
  ];
}

export function buildProfessionalSummary(scores, metrics, profile, vigilance) {
  const risk = riskLabel(metrics);
  const betaText = metrics.beta != null ? `β ${metrics.beta.toFixed(2)}, ölçüt c ${metrics.criterionC.toFixed(2)}.` : `ölçüt c ${metrics.criterionC.toFixed(2)}.`;
  return [
    `Test ${metrics.totalTrials} deneme ile tamamlandı. Profil: ${profile.label}. Toplam süre yaklaşık ${formatDurationSeconds(profile.durationMs)} saniyedir.`,
    `Genel performans ${scores.overall}/100; A-Dikkat ${scores.attention}, T-Zamanlama ${scores.timing}, I-Dürtüsellik ${scores.impulsivity}, H-Hiper-reaktivite ${scores.hyperactivity}. Ön değerlendirme risk düzeyi: ${risk}.`,
    `Doğruluk %${metrics.accuracy}, hit ${formatRate(metrics.hitRate)}, commission (hedef dışı basış) ${formatRate(metrics.commissionRate)}, omission ${formatRate(metrics.omissionRate)}, perseveration ${formatRate(metrics.perseverationRate)}.`,
    `Sinyal tespit: d′ ${metrics.dPrime.toFixed(2)}, ${betaText}`,
    `Sürdürülebilir dikkat (vigilance): ${vigilance.label}.`,
    metrics.flags.length
      ? `Öne çıkan bulgular: ${metrics.flags.join("; ")}.`
      : "Belirgin klinik risk bayrağı oluşturan bir patern izlenmemiştir."
  ].join("\n\n");
}

export function buildSmartComment(scores, metrics, profile) {
  return [
    `Test ${metrics.totalTrials} deneme üzerinden tamamlandı. Genel doğruluk %${metrics.accuracy}, ortalama tepki ${metrics.avgReaction} ms, median ${metrics.medianReaction} ms, RT SS ${metrics.rtStd} ms.`,
    `Skorlar — Genel ${scores.overall}, Dikkat ${scores.attention}, Zamanlama ${scores.timing}, Dürtüsellik ${scores.impulsivity}, Hiper-reaktivite ${scores.hyperactivity}. Geç yanıt eşiği ${profile.lateResponseMs} ms.`,
    `d-prime ${metrics.dPrime.toFixed(2)}.`,
    metrics.flags.length ? `Bayraklar: ${metrics.flags.join("; ")}.` : "Belirgin risk bayrağı yok.",
    "Bu rapor tanı koymaz; yalnızca ön değerlendirme amaçlıdır."
  ].join(" ");
}

export const INDEX_DEFINITIONS = [
  [
    "A — Dikkat",
    "İhmal (hedef varken basmama). Yanlış basış I'ye, geç tepki T'ye yazılır; A ile karışmaz."
  ],
  [
    "T — Zamanlama",
    "T = (Zamanında İsabet×0.40) + (RT Hızı×0.25) + (Geç Yanıt×0.20) + (RT Stabilitesi×0.15). İhmal A'ya yazılır."
  ],
  [
    "I — Dürtüsellik",
    "Commission errors: hedef dışı uyaranlara verilen ilk tepkiler. Mükerrer basış bu endekste değildir (H'ye gider)."
  ],
  [
    "H — Hiperaktivite",
    "Mükerrer basış + boş ekran / yönerge dışı basış. Doğru veya yanlış simge fark etmez."
  ],
  ["Genel skor", "A×0.35 + T×0.30 + I×0.20 + H×0.15"]
];

export const SDT_DEFINITIONS = [
  ["d′ (d-prime)", "Hedef ile hedef dışını ayırt etme gücü"],
  ["Ölçüt c", "Yanıt yanlılığı (evet deme eğilimi)"],
  ["β (beta)", "Karar eşiği (d′/c; yorum için uzman gerekir)"],
  ["Commission", "Hedef dışı uyaranlara basma (false alarm)"],
  ["Perseveration", "Ardışık hedef dışı hatalar + çoklu basma eğilimi"]
];

export const NORM_LEVELS = [
  { level: 1, label: "Çok iyi performans (Z ≥ 1.0)", color: "#0d9488" },
  { level: 2, label: "Standart performans (0 – 0.99)", color: "#86efac" },
  { level: 3, label: "Düşük performans (−1 – −0.01)", color: "#f59e0b" },
  { level: 4, label: "Performansta zorluk (Z < −1)", color: "#dc2626" },
  { level: 5, label: "Belirgin zorluk (Z < −2)", color: "#7f1d1d" }
];

export const SEVERITY_LEVELS = [
  { level: 4, label: "Çok Şiddetli", color: "#7f1d1d" },
  { level: 3, label: "Yüksek şiddet", color: "#dc2626" },
  { level: 2, label: "Orta Şiddetli", color: "#f87171" },
  { level: 1, label: "Düşük Şiddetli", color: "#fecaca" }
];

export function normPlacement(score) {
  return getLevel(score);
}

export function normPlacementFromZ(z) {
  return normLevelFromZ(z);
}
