import {
  computeDetailedMetricsV4,
  computeSustainabilityIndex,
  formatDurationSeconds,
  getScores,
  scoresForPhaseBucket
} from "../reportHelpers.js";
import { buildReportPhaseBuckets, logsForBucket } from "./phaseBuckets.js";
import { distractorLevelFromScores } from "./phaseComments.js";
import { getOverallRiskText, riskLabel } from "../metrics.js";
import { fillTemplate, getReportPdfStrings } from "../i18n/reportPdfStrings.js";
import { normLevelFromZ, normZScore } from "../reportNorms.js";
import { CLINICAL_THRESHOLDS, TIERS } from "./scoreTiers.js";

/** Veri kalitesi 100/100 puan düşüm kuralları (yönetici paneli + teknik ek). */
export const DATA_QUALITY_SCORE_RULES = [
  { id: "fast_rt", delta: -40, tr: "Ortalama RT < 150 ms veya hedef isabetlerin ≥%25’i <150 ms" },
  { id: "omission", delta: -20, tr: "İhmal oranı > %40" },
  { id: "multi", delta: -15, tr: "Çoklu basış oranı > %20" },
  { id: "rt_sd_low", delta: -15, tr: "RT SD < 20 ms (≥5 hedef isabet)" },
  { id: "commission", delta: -10, tr: "Commission (hedef dışı ilk tepki) > %25" }
];

function clamp(x, a = 0, b = 100) {
  return Math.max(a, Math.min(b, x));
}

function mean(a) {
  return a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
}

export function indexLevelLabel(score, locale = "tr") {
  const L = getReportPdfStrings(locale).levels;
  if (score >= TIERS.veryGood) return L.veryGood;
  if (score >= TIERS.good) return L.good;
  if (score >= TIERS.average) return L.average;
  if (score >= TIERS.low) return L.low;
  return L.poor;
}

function validityBand(score, hasCritical, locale = "tr") {
  const B = getReportPdfStrings(locale).validity.bands;
  if (hasCritical || score < 40) {
    return { key: "invalid", label: B.invalid, emoji: "🔴", color: "#dc2626", fill: "#fef2f2" };
  }
  if (score < 60) {
    return { key: "low", label: B.low, emoji: "🟠", color: "#ea580c", fill: "#fff7ed" };
  }
  if (score < 75) {
    return { key: "caution", label: B.caution, emoji: "🟡", color: "#ca8a04", fill: "#fefce8" };
  }
  if (score < 90) {
    return { key: "acceptable", label: B.acceptable, emoji: "🟢", color: "#16a34a", fill: "#ecfdf5" };
  }
  return { key: "valid", label: B.valid, emoji: "🟢", color: "#059669", fill: "#ecfdf5" };
}

function indexComment(block, score) {
  if (score >= TIERS.veryGood) return block.c90;
  if (score >= TIERS.good) return block.c80;
  if (score >= TIERS.average) return block.c70;
  if (score >= TIERS.low) return block.c60;
  return block.cLow;
}

function globalIndexZ(scores, profileKey = "adult") {
  const zOrNull = (score, indexKey) =>
    score == null || Number.isNaN(Number(score))
      ? null
      : normZScore(score, profileKey, "global", indexKey);
  return {
    attention: zOrNull(scores.attention, "attention"),
    timing: zOrNull(scores.timing, "timing"),
    impulsivity: zOrNull(scores.impulsivity, "impulsivity"),
    hyperactivity: zOrNull(scores.hyperactivity, "hyperactivity")
  };
}

/** Norm tablosuyla aynı bant: ortalamanın altı “koruyabilmiş” cümlesine düşmez. */
function commentForNormZ(block, z) {
  const level = normLevelFromZ(z);
  if (level === 1) return block.c90;
  if (level === 2) return block.c80;
  if (level <= 4) return block.c60;
  return block.cLow;
}

export function indexLevelLabelFromZ(z, locale = "tr") {
  const L = getReportPdfStrings(locale).levels;
  const level = normLevelFromZ(z);
  if (level === 1) return L.veryGood;
  if (level === 2) return L.good;
  if (level === 3) return L.average;
  if (level === 4) return L.low;
  return L.poor;
}

export function pickTierComment(block, score) {
  return indexComment(block, score);
}

export function buildGeneralShortComment(scores, distractor, locale = "tr", z = null) {
  const G = getReportPdfStrings(locale).generalComments;
  const { attention: A, timing: T, impulsivity: I, hyperactivity: H } = scores;
  const hasNum = (v) => v != null && Number.isFinite(Number(v));
  const marked =
    z &&
    ["attention", "timing", "impulsivity", "hyperactivity"].some(
      (key) => hasNum(z[key]) && normLevelFromZ(z[key]) >= 4
    );

  if (hasNum(A) && hasNum(T) && hasNum(I) && hasNum(H)) {
    if (!marked && A >= 90 && T >= 85 && I >= 80 && H >= 90) return G.profile1;
    if (!marked && A >= 85 && T < 65 && I >= 75 && H >= 90) return G.profile2;
    if (!marked && A >= 85 && T >= 80 && I < 60 && H >= 90) return G.profile3;
  }

  const parts = [];
  const strongCore = z
    ? ["attention", "timing", "impulsivity", "hyperactivity"].every(
        (key) => hasNum(z[key]) && normLevelFromZ(z[key]) <= 2
      )
    : hasNum(A) && hasNum(T) && hasNum(I) && hasNum(H) && A >= 80 && T >= 75 && I >= 75 && H >= 80;
  if (strongCore) {
    parts.push(G.partStrongCore);
  } else if (z) {
    if (hasNum(z.attention)) {
      const att = normLevelFromZ(z.attention);
      if (att >= 5) parts.push(G.partAttLow);
      else if (att >= 3) parts.push(G.partAttMid);
      else parts.push(G.partAttOk);
    }

    if (hasNum(z.timing)) {
      const tim = normLevelFromZ(z.timing);
      if (tim >= 5) parts.push(G.partTimLow);
      else if (tim >= 3) parts.push(G.partTimMid);
    }

    if (hasNum(z.impulsivity)) {
      const imp = normLevelFromZ(z.impulsivity);
      if (imp >= 5) parts.push(G.partImpLow);
      else if (imp >= 3) parts.push(G.partImpMid);
    }

    if (hasNum(z.hyperactivity) && normLevelFromZ(z.hyperactivity) >= 4) parts.push(G.partHypLow);
  } else {
    if (hasNum(A)) {
      if (A < 60) parts.push(G.partAttLow);
      else if (A < 70) parts.push(G.partAttMid);
      else parts.push(G.partAttOk);
    }

    if (hasNum(T)) {
      if (T < 60) parts.push(G.partTimLow);
      else if (T < 70) parts.push(G.partTimMid);
    }

    if (hasNum(I)) {
      if (I < 60) parts.push(G.partImpLow);
      else if (I < 75) parts.push(G.partImpMid);
    }

    if (hasNum(H) && H < 60) parts.push(G.partHypLow);
  }

  if (distractor?.anyAffected) parts.push(G.partDistractor);
  else parts.push(G.partDistractorOk);

  return parts.filter(Boolean).join(" ");
}

/**
 * Seviye 1–3 geçerlilik / oturum veri kalitesi (0–100).
 * @param {{ dataQualityMode?: boolean }} [options] dataQualityMode: V4 — hedefte hızlı basışı kritik sayma; temkinli özet.
 */
export function computeTestValidity(logs, metrics, profile, pressTimeline = [], age = null, locale = "tr", options = {}) {
  const dataQualityMode = Boolean(options?.dataQualityMode);
  const V = getReportPdfStrings(locale).validity;
  const late = profile.lateResponseMs;
  const level1Critical = [];
  const level2Warnings = [];
  const level3Consistency = [];

  const targetHits = logs.filter((t) => t.isTarget && t.responded && t.reactionTime > 0);
  const fastHits = targetHits.filter((t) => t.reactionTime < 150);
  const fastRate = targetHits.length ? (fastHits.length / targetHits.length) * 100 : 0;

  // V4: hedef (mavi üçgen) üzerinde hızlı basış T'de cezalandırılmaz; kritik geçersizlik sayılmaz.
  if (!dataQualityMode) {
    if (metrics.avgReaction > 0 && metrics.avgReaction < 150) {
      level1Critical.push(V.l1_avgRt);
    } else if (targetHits.length >= 5 && fastRate >= 25) {
      level1Critical.push(fillTemplate(V.l1_fastRate, { rate: fastRate.toFixed(0) }));
    }
  } else if (targetHits.length >= 5 && fastRate >= 40) {
    level2Warnings.push(fillTemplate(V.l1_fastRate, { rate: fastRate.toFixed(0) }));
  }

  if (metrics.omissionRate > 60) {
    level1Critical.push(fillTemplate(V.l1_omission, { rate: metrics.omissionRate.toFixed(1) }));
  }

  if (metrics.rtStd > 0 && metrics.rtStd < 20 && targetHits.length >= 5) {
    level1Critical.push(fillTemplate(V.l1_rtSdLow, { sd: metrics.rtStd }));
  }

  if (metrics.multiPressRate > 50) {
    level1Critical.push(fillTemplate(V.l1_multi, { rate: metrics.multiPressRate.toFixed(1) }));
  }

  if (metrics.omissionRate >= 40 && metrics.omissionRate <= 60) {
    level2Warnings.push(fillTemplate(V.l2_omission, { rate: metrics.omissionRate.toFixed(1) }));
  }
  if (metrics.commissionRate >= 25) {
    level2Warnings.push(fillTemplate(V.l2_commission, { rate: metrics.commissionRate.toFixed(1) }));
  }
  if (metrics.rtStd > 350) {
    level2Warnings.push(fillTemplate(V.l2_rtSdHigh, { sd: metrics.rtStd }));
  }
  if (metrics.multiPressRate >= 20 && metrics.multiPressRate <= 50) {
    level2Warnings.push(fillTemplate(V.l2_multi, { rate: metrics.multiPressRate.toFixed(1) }));
  }

  const buckets = buildReportPhaseBuckets(profile);
  const scoreOfBucket = (bucket, key) => {
    const list = logsForBucket(logs, bucket);
    if (!list.length) return null;
    const tl = (pressTimeline ?? []).filter((p) => p.section && bucket.phaseNames?.includes(p.section));
    return getScores(computeDetailedMetricsV4(list, late, { pressTimeline: tl, age, locale }, age))[key];
  };

  const firstA = buckets.slice(0, 2).map((b) => scoreOfBucket(b, "attention")).filter((v) => v != null);
  const lastA = buckets.slice(-2).map((b) => scoreOfBucket(b, "attention")).filter((v) => v != null);
  if (firstA.length && lastA.length) {
    const firstAvg = mean(firstA);
    const lastAvg = mean(lastA);
    const deltaA = lastAvg - firstAvg;
    if (deltaA <= CLINICAL_THRESHOLDS.validityAttentionDrop) {
      level3Consistency.push(
        fillTemplate(V.l3_attention, {
          start: Math.round(firstAvg),
          end: Math.round(lastAvg),
          delta: Math.round(deltaA)
        })
      );
    }
  }

  const rtOfBucket = (bucket) => {
    const list = logsForBucket(logs, bucket);
    const rts = list
      .filter((t) => t.isTarget && t.responded && t.reactionTime > 0 && t.reactionTime <= late)
      .map((t) => t.reactionTime);
    return rts.length ? mean(rts) : null;
  };
  const firstRt = buckets.slice(0, 2).map(rtOfBucket).filter((v) => v != null);
  const lastRt = buckets.slice(-2).map(rtOfBucket).filter((v) => v != null);
  if (firstRt.length && lastRt.length) {
    const startRt = mean(firstRt);
    const endRt = mean(lastRt);
    const rtDelta = endRt - startRt;
    if (rtDelta >= 450 || (startRt > 0 && endRt / startRt >= 2)) {
      level3Consistency.push(
        fillTemplate(V.l3_rt, {
          start: Math.round(startRt),
          end: Math.round(endRt),
          delta: Math.round(rtDelta)
        })
      );
    }
  }

  let score = 100;
  const deductions = [];
  if (metrics.avgReaction > 0 && metrics.avgReaction < 150) {
    score -= 40;
    deductions.push("RT < 150 ms (−40)");
  } else if (targetHits.length >= 5 && fastRate >= 25) {
    score -= 40;
    deductions.push(
      locale === "en"
        ? "Suspicious fast responses (−40)"
        : locale === "it"
          ? "Risposte sospette troppo rapide (−40)"
          : "Şüpheli hızlı tepkiler (−40)"
    );
  }
  if (metrics.omissionRate > 40) {
    score -= 20;
    deductions.push(
      locale === "en" ? "Omission > 40% (−20)" : locale === "it" ? "Omissioni > 40% (−20)" : "İhmal > %40 (−20)"
    );
  }
  if (metrics.multiPressRate > 20) {
    score -= 15;
    deductions.push(
      locale === "en"
        ? "Multi-press > 20% (−15)"
        : locale === "it"
          ? "Pressioni multiple > 20% (−15)"
          : "Çoklu basış > %20 (−15)"
    );
  }
  if (metrics.rtStd > 0 && metrics.rtStd < 20 && targetHits.length >= 5) {
    score -= 15;
    deductions.push(
      locale === "en" ? "RT SD < 20 ms (−15)" : locale === "it" ? "DS TR < 20 ms (−15)" : "RT SD < 20 ms (−15)"
    );
  }
  if (metrics.commissionRate > 25) {
    score -= 10;
    deductions.push(
      locale === "en" ? "Commission > 25% (−10)" : locale === "it" ? "Commissioni > 25% (−10)" : "Commission > %25 (−10)"
    );
  }
  score = clamp(Math.round(score));

  const hasCritical = level1Critical.length > 0;
  const band = validityBand(score, hasCritical, locale);
  const isInvalid = hasCritical || score < 40;

  const checklist = [];
  checklist.push({
    level: metrics.omissionRate <= 40 ? "green" : "yellow",
    text: metrics.omissionRate <= 40 ? V.check_coopOk : V.check_coopLow
  });
  checklist.push({
    level:
      metrics.avgReaction >= 150 && metrics.avgReaction <= 1200 && fastRate < 25 ? "green" : "yellow",
    text:
      metrics.avgReaction >= 150 && metrics.avgReaction <= 1200 && fastRate < 25 ? V.check_rtOk : V.check_rtBad
  });
  checklist.push({
    level: metrics.rtStd >= 20 && metrics.rtStd <= 350 ? "green" : "yellow",
    text: metrics.rtStd >= 20 && metrics.rtStd <= 350 ? V.check_patternOk : V.check_patternBad
  });
  if (dataQualityMode) {
    if (!isInvalid && score >= 75) {
      checklist.push({ level: "green", text: V.check_dataOk || V.check_caution });
    } else if (!isInvalid) {
      checklist.push({ level: "yellow", text: V.check_dataCaution || V.check_caution });
    } else {
      checklist.push({ level: "red", text: V.check_dataLimited || V.check_invalid });
    }
  } else if (!isInvalid && score >= 75) {
    checklist.push({ level: "green", text: V.check_clinicalOk });
  } else if (!isInvalid) {
    checklist.push({ level: "yellow", text: V.check_caution });
  } else {
    checklist.push({ level: "red", text: V.check_invalid });
  }

  let summary;
  if (dataQualityMode) {
    if (isInvalid) summary = V.summary_invalid;
    else if (score >= 90) summary = V.summary_data_ok || V.summary_acceptable;
    else if (score >= 75) summary = V.summary_data_acceptable || V.summary_acceptable;
    else if (score >= 60) summary = V.summary_data_caution || V.summary_caution;
    else summary = V.summary_data_low || V.summary_low;
  } else if (isInvalid) summary = V.summary_invalid;
  else if (score >= 90) summary = V.summary_valid;
  else if (score >= 75) summary = V.summary_acceptable;
  else if (score >= 60) summary = V.summary_caution;
  else summary = V.summary_low;

  return {
    score,
    band,
    level1Critical,
    level2Warnings,
    level3Consistency,
    deductions,
    checklist,
    summary,
    isInvalid,
    shouldBlockReport: hasCritical,
    dataQualityMode,
    cooperationOk: metrics.omissionRate <= 40,
    rtConsistent: metrics.rtStd >= 20 && metrics.rtStd <= 350,
    patternConsistent: !hasCritical && fastRate < 25
  };
}

/** Görsel / işitsel / kombine — faz kovalarıyla aynı ham veri (sayfa 9 ile çelişmesin). */
export function buildDistractorAnalysisFriendly(logs, profile, age = null, pressTimeline = [], locale = "tr") {
  const D = getReportPdfStrings(locale).distractor;
  const buckets = buildReportPhaseBuckets(profile, locale);
  const byKind = (kind) => buckets.find((b) => b.kind === kind);
  const baseline = scoresForPhaseBucket(logs, profile, byKind("temel"), age, pressTimeline, locale);
  const types = [
    { key: "visual", title: D.visual, scores: scoresForPhaseBucket(logs, profile, byKind("gorsel"), age, pressTimeline, locale) },
    { key: "auditory", title: D.auditory, scores: scoresForPhaseBucket(logs, profile, byKind("isitsel"), age, pressTimeline, locale) },
    { key: "combined", title: D.combined, scores: scoresForPhaseBucket(logs, profile, byKind("kombine"), age, pressTimeline, locale) }
  ];

  const analyze = (title, distScores, key) => {
    if (!distScores || !baseline) {
      return { key, title, level: "gray", emoji: "—", label: D.noData, comment: D.noDataComment };
    }
    const { level, weak, maxDrop } = distractorLevelFromScores(baseline, distScores);

    if (level === "green") {
      const comment = key === "visual" ? D.visualOk : key === "auditory" ? D.auditoryOk : D.combinedOk;
      return { key, title, level: "green", emoji: "🟢", label: D.preserved, comment, maxDrop, weak };
    }
    if (level === "yellow") {
      const weakNote = weak.length ? ` (zayıf: ${weak.map((w) => `${w.label}=${w.score}`).join(", ")})` : "";
      return {
        key,
        title,
        level: "yellow",
        emoji: "🟡",
        label: D.mild,
        comment: fillTemplate(D.mildComment, { title }) + weakNote,
        maxDrop,
        weak
      };
    }
    if (level === "orange") {
      return {
        key,
        title,
        level: "orange",
        emoji: "🟠",
        label: D.moderate,
        comment: fillTemplate(D.moderateComment, { title }),
        maxDrop,
        weak
      };
    }
    return {
      key,
      title,
      level: "red",
      emoji: "🔴",
      label: D.marked,
      comment: fillTemplate(D.markedComment, { title }),
      maxDrop,
      weak
    };
  };

  const items = types.map((t) => analyze(t.title, t.scores, t.key));
  const anyAffected = items.some((i) => i.level === "yellow" || i.level === "orange" || i.level === "red");
  return { items, general: anyAffected ? D.generalAffected : D.generalOk, anyAffected };
}

export function buildSustainabilityReport(logs, profile, age = null, pressTimeline = [], locale = "tr") {
  const S = getReportPdfStrings(locale).sustainability;
  const sust = computeSustainabilityIndex(logs, profile, age, pressTimeline, locale);
  let comment;
  if (sust.delta == null) comment = S.noData;
  else if (sust.delta >= 5) comment = S.increase || S.stable;
  else if (sust.delta >= -5) comment = S.stable;
  else if (sust.delta >= -15) comment = S.mild;
  else comment = S.marked;
  return { ...sust, comment };
}

function hyperactivityCommentFromPresses(block, score, metrics) {
  const idle = Number(metrics?.idlePresses ?? 0);
  const multi =
    Number(metrics?.multiPresses ?? 0) ||
    Number(metrics?.extraPresses ?? 0) ||
    (Number(metrics?.multiPressRate ?? 0) > 0 ? 1 : 0);
  const hasExtra = idle > 0 || multi > 0;
  let comment = indexComment(block, score);
  if (hasExtra) {
    if (score >= TIERS.veryGood && block.c90limited) comment = block.c90limited;
    else if (score >= TIERS.good && block.c80limited) comment = block.c80limited;
    else if (score >= TIERS.good) {
      comment =
        "Motor kontrol kabul edilebilir düzeydedir; sınırlı sayıda gereksiz basış gözlenmiştir.";
    }
    const counts = ` (boş ekran: ${idle}, mükerrer/ekstra: ${multi})`;
    if (!comment.includes("boş ekran")) comment = `${comment}${counts}`;
  } else if (score >= TIERS.good) {
    comment = block.c90 || comment;
  }
  return comment;
}

export function buildIndexClinicalComments(scores, locale = "tr", z = null, options = {}) {
  const I = getReportPdfStrings(locale).indexes;
  const noSpeed = Boolean(options?.noSpeedTiming);
  const skipNormZ = Boolean(options?.skipNormZ);
  const metrics = options?.metrics || null;
  const mk = (key, score) => {
    const definition =
      key === "timing" && !noSpeed && I[key].definitionV1
        ? I[key].definitionV1
        : I[key].definition;
    if (score == null || Number.isNaN(Number(score))) {
      return {
        score: null,
        title: I[key].title,
        level: "—",
        definition,
        comment:
          key === "timing"
            ? "T puanı hesaplanamadı (yetersiz / geçersiz RT verisi)."
            : "Skor üretilemedi."
      };
    }
    const zv = z?.[key];
    const useNorm = !skipNormZ && zv != null && Number.isFinite(zv);
    let comment;
    if (key === "hyperactivity" && metrics) {
      comment = hyperactivityCommentFromPresses(I[key], score, metrics);
    } else {
      comment = useNorm ? commentForNormZ(I[key], zv) : indexComment(I[key], score);
    }
    let level = useNorm ? indexLevelLabelFromZ(zv, locale) : indexLevelLabel(score, locale);
    return {
      score,
      title: I[key].title,
      level,
      definition,
      comment
    };
  };
  return {
    attention: mk("attention", scores.attention),
    timing: mk("timing", scores.timing),
    impulsivity: mk("impulsivity", scores.impulsivity),
    hyperactivity: mk("hyperactivity", scores.hyperactivity)
  };
}


export function buildClinicalFlags(scores, metrics, validity, distractor, sustainability, locale = "tr") {
  const F = getReportPdfStrings(locale).flags;
  const flags = [];

  if (validity.isInvalid) {
    flags.push({ level: "red", emoji: "🔴", text: F.invalid });
    return flags;
  }
  if (scores.impulsivity < CLINICAL_THRESHOLDS.impulseFlag) flags.push({ level: "yellow", emoji: "🟡", text: F.impulse });
  if (distractor.anyAffected) flags.push({ level: "yellow", emoji: "🟡", text: F.distractor });
  if (sustainability.delta != null && sustainability.delta <= CLINICAL_THRESHOLDS.sustainabilityOrange) {
    flags.push({ level: "orange", emoji: "🟠", text: F.sustainability });
  }
  if (
    scores.overall < CLINICAL_THRESHOLDS.poorOverall ||
    scores.attention < CLINICAL_THRESHOLDS.poorAttention ||
    scores.timing < CLINICAL_THRESHOLDS.poorTiming ||
    scores.impulsivity < CLINICAL_THRESHOLDS.poorImpulsivity ||
    scores.hyperactivity < CLINICAL_THRESHOLDS.poorHyperactivity
  ) {
    flags.push({ level: "red", emoji: "🔴", text: F.poor });
  }
  if (!flags.length) flags.push({ level: "green", emoji: "🟢", text: F.none });
  return flags;
}

export function buildExecutiveSummary(
  scores,
  metrics,
  validity,
  clinicalFlags,
  distractor,
  locale = "tr",
  profileKey = "adult",
  options = {}
) {
  const St = getReportPdfStrings(locale).strengths;
  const risk =
    scores.overall == null || Number.isNaN(Number(scores.overall))
      ? "Genel skor üretilemedi"
      : getOverallRiskText(scores.overall, locale);
  const skipNormZ = Boolean(options?.skipNormZ);
  const z = skipNormZ ? null : globalIndexZ(scores, profileKey);

  const strengths = [];
  const weaknesses = [];
  const fields = [
    ["attention", scores.attention, St.attention],
    ["timing", scores.timing, St.timing],
    ["impulsivity", scores.impulsivity, St.impulse],
    ["hyperactivity", scores.hyperactivity, St.motor]
  ];
  for (const [key, score, label] of fields) {
    if (score == null || Number.isNaN(Number(score))) continue;
    if (skipNormZ) {
      if (score >= CLINICAL_THRESHOLDS.strength) strengths.push(label);
      if (score < CLINICAL_THRESHOLDS.weakness) weaknesses.push(label);
      continue;
    }
    if (z?.[key] == null) continue;
    const level = normLevelFromZ(z[key]);
    if (level <= 2 && score >= CLINICAL_THRESHOLDS.strength) strengths.push(label);
    if (level >= 4) weaknesses.push(label);
  }

  const shortComment = buildGeneralShortComment(scores, distractor, locale, z);

  return {
    overall: scores.overall,
    risk,
    strengths,
    weaknesses,
    clinicalFlags,
    shortComment,
    lines: [shortComment]
  };
}

export function buildProfessionalNarrative(scores, metrics, validity, distractor, sustainability, locale = "tr", z = null) {
  const I = getReportPdfStrings(locale).indexes;
  const P = getReportPdfStrings(locale).professional;
  if (validity.isInvalid) {
    return [P.invalid1, P.invalid2, P.invalid3].join("\n\n");
  }

  const line = (key) => {
    const zv = z?.[key];
    if (zv != null && Number.isFinite(zv)) return commentForNormZ(I[key], zv);
    return pickTierComment(I[key], scores[key]);
  };

  const paras = [P.coop];
  paras.push(line("attention"));
  paras.push(line("timing"));
  paras.push(line("impulsivity"));
  paras.push(line("hyperactivity"));
  paras.push(distractor.anyAffected ? P.distLow : P.distOk);
  if (sustainability.delta != null && sustainability.delta <= CLINICAL_THRESHOLDS.sustainabilityOrange) {
    paras.push(fillTemplate(P.sustNote, { label: sustainability.label }));
  }
  paras.push(P.disclaimer);
  return paras.join("\n\n");
}

export { riskLabel, formatDurationSeconds };
