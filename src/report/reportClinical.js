import {
  computeDetailedMetrics,
  computeSustainabilityIndex,
  formatDurationSeconds,
  getScores
} from "../reportHelpers.js";
import { buildReportPhaseBuckets, logsForBucket } from "./phaseBuckets.js";
import { getOverallRiskText, riskLabel } from "../metrics.js";
import { fillTemplate, getReportPdfStrings } from "../i18n/reportPdfStrings.js";
import { CLINICAL_THRESHOLDS, DISTRACTOR_DROP, TIERS, distractorImpactLevel } from "./scoreTiers.js";
import { timelineForLogs } from "./timelineFilter.js";

function clamp(x, a = 0, b = 100) {
  return Math.max(a, Math.min(b, x));
}

function mean(a) {
  return a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
}

function phaseLogs(logs, matcher) {
  return logs.filter((t) => matcher((t.section || "").toLowerCase()));
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

export function pickTierComment(block, score) {
  return indexComment(block, score);
}

export function buildGeneralShortComment(scores, distractor, locale = "tr") {
  const G = getReportPdfStrings(locale).generalComments;
  const { attention: A, timing: T, impulsivity: I, hyperactivity: H } = scores;

  if (A >= 90 && T >= 85 && I >= 80 && H >= 90) return G.profile1;
  if (A >= 85 && T < 65 && I >= 75 && H >= 90) return G.profile2;
  if (A >= 85 && T >= 80 && I < 60 && H >= 90) return G.profile3;

  const parts = [];
  if (A >= 80 && T >= 75 && I >= 75 && H >= 80) {
    parts.push(G.partStrongCore);
  } else {
    if (A < 60) parts.push(G.partAttLow);
    else if (A < 70) parts.push(G.partAttMid);
    else parts.push(G.partAttOk);

    if (T < 60) parts.push(G.partTimLow);
    else if (T < 70) parts.push(G.partTimMid);

    if (I < 60) parts.push(G.partImpLow);
    else if (I < 75) parts.push(G.partImpMid);

    if (H < 60) parts.push(G.partHypLow);
  }

  if (distractor?.anyAffected) parts.push(G.partDistractor);
  else parts.push(G.partDistractorOk);

  return parts.filter(Boolean).join(" ");
}

/** Seviye 1–3 geçerlilik + Geçerlilik Endeksi (0–100). */
export function computeTestValidity(logs, metrics, profile, pressTimeline = [], age = null, locale = "tr") {
  const V = getReportPdfStrings(locale).validity;
  const late = profile.lateResponseMs;
  const level1Critical = [];
  const level2Warnings = [];
  const level3Consistency = [];

  const targetHits = logs.filter((t) => t.isTarget && t.responded && t.reactionTime > 0);
  const fastHits = targetHits.filter((t) => t.reactionTime < 150);
  const fastRate = targetHits.length ? (fastHits.length / targetHits.length) * 100 : 0;

  if (metrics.avgReaction > 0 && metrics.avgReaction < 150) {
    level1Critical.push(V.l1_avgRt);
  } else if (targetHits.length >= 5 && fastRate >= 25) {
    level1Critical.push(fillTemplate(V.l1_fastRate, { rate: fastRate.toFixed(0) }));
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
    return getScores(computeDetailedMetrics(list, late, { pressTimeline: tl, age, locale }))[key];
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
    deductions.push(locale === "en" ? "Suspicious fast responses (−40)" : "Şüpheli hızlı tepkiler (−40)");
  }
  if (metrics.omissionRate > 40) {
    score -= 20;
    deductions.push(locale === "en" ? "Omission > 40% (−20)" : "İhmal > %40 (−20)");
  }
  if (metrics.multiPressRate > 20) {
    score -= 15;
    deductions.push(locale === "en" ? "Multi-press > 20% (−15)" : "Çoklu basış > %20 (−15)");
  }
  if (metrics.rtStd > 0 && metrics.rtStd < 20 && targetHits.length >= 5) {
    score -= 15;
    deductions.push(locale === "en" ? "RT SD < 20 ms (−15)" : "RT SD < 20 ms (−15)");
  }
  if (metrics.commissionRate > 25) {
    score -= 10;
    deductions.push(locale === "en" ? "Commission > 25% (−10)" : "Commission > %25 (−10)");
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
  if (!isInvalid && score >= 75) {
    checklist.push({ level: "green", text: V.check_clinicalOk });
  } else if (!isInvalid) {
    checklist.push({ level: "yellow", text: V.check_caution });
  } else {
    checklist.push({ level: "red", text: V.check_invalid });
  }

  let summary;
  if (isInvalid) summary = V.summary_invalid;
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
    cooperationOk: metrics.omissionRate <= 40,
    rtConsistent: metrics.rtStd >= 20 && metrics.rtStd <= 350,
    patternConsistent: !hasCritical && fastRate < 25
  };
}

function distractorPhaseScore(logs, profile, age, pressTimeline, matcher, locale) {
  const list = phaseLogs(logs, matcher);
  if (!list.length) return null;
  const late = profile.lateResponseMs;
  const tl = timelineForLogs(pressTimeline, list);
  return getScores(computeDetailedMetrics(list, late, { pressTimeline: tl, age, locale }));
}

/** Görsel / işitsel / kombine — anlaşılır çeldirici analizi. */
export function buildDistractorAnalysisFriendly(logs, profile, age = null, pressTimeline = [], locale = "tr") {
  const D = getReportPdfStrings(locale).distractor;
  const baseline = distractorPhaseScore(
    logs,
    profile,
    age,
    pressTimeline,
    (s) => /0–1|1–2|2–3|0-1|1-2|2-3/.test(s) && !s.includes("gif") && !s.includes("ses"),
    locale
  );
  const types = [
    { key: "visual", title: D.visual, scores: distractorPhaseScore(logs, profile, age, pressTimeline, (s) => s.includes("sessiz gif") && !s.includes("sesli"), locale) },
    { key: "auditory", title: D.auditory, scores: distractorPhaseScore(logs, profile, age, pressTimeline, (s) => s.includes("sadece ses"), locale) },
    {
      key: "combined",
      title: D.combined,
      scores: distractorPhaseScore(
        logs,
        profile,
        age,
        pressTimeline,
        (s) => s.includes("sessiz + sesli") || s.includes("sesli gif"),
        locale
      )
    }
  ];

  const analyze = (title, distScores, key) => {
    if (!distScores || !baseline) {
      return { title, level: "gray", emoji: "—", label: D.noData, comment: D.noDataComment };
    }
    const baseOverall = baseline.overall;
    const distOverall = distScores.overall;
    const drop = baseOverall - distOverall;
    const level = distractorImpactLevel(drop);

    if (drop <= DISTRACTOR_DROP.none) {
      const comment = key === "visual" ? D.visualOk : key === "auditory" ? D.auditoryOk : D.combinedOk;
      return { title, level: "green", emoji: "🟢", label: D.preserved, comment };
    }
    if (level === "yellow") {
      return { title, level: "yellow", emoji: "🟡", label: D.mild, comment: fillTemplate(D.mildComment, { title }) };
    }
    if (level === "orange") {
      return { title, level: "orange", emoji: "🟠", label: D.moderate, comment: fillTemplate(D.moderateComment, { title }) };
    }
    return { title, level: "red", emoji: "🔴", label: D.marked, comment: fillTemplate(D.markedComment, { title }) };
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
  else if (sust.delta >= -5) comment = S.stable;
  else if (sust.delta >= -15) comment = S.mild;
  else comment = S.marked;
  return { ...sust, comment };
}

export function buildIndexClinicalComments(scores, locale = "tr") {
  const I = getReportPdfStrings(locale).indexes;
  const mk = (key, score) => ({
    score,
    title: I[key].title,
    level: indexLevelLabel(score, locale),
    definition: I[key].definition,
    comment: indexComment(I[key], score)
  });
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

export function buildExecutiveSummary(scores, metrics, validity, clinicalFlags, distractor, locale = "tr") {
  const St = getReportPdfStrings(locale).strengths;
  const risk = getOverallRiskText(scores.overall, locale);

  const strengths = [];
  if (scores.attention >= CLINICAL_THRESHOLDS.strength) strengths.push(St.attention);
  if (scores.timing >= CLINICAL_THRESHOLDS.strength) strengths.push(St.timing);
  if (scores.impulsivity >= CLINICAL_THRESHOLDS.strength) strengths.push(St.impulse);
  if (scores.hyperactivity >= CLINICAL_THRESHOLDS.strength) strengths.push(St.motor);

  const weaknesses = [];
  if (scores.timing < CLINICAL_THRESHOLDS.weakness) weaknesses.push(St.timing);
  if (scores.impulsivity < CLINICAL_THRESHOLDS.weakness) weaknesses.push(St.impulse);
  if (scores.attention < CLINICAL_THRESHOLDS.weakness) weaknesses.push(St.attention);
  if (scores.hyperactivity < CLINICAL_THRESHOLDS.weakness) weaknesses.push(St.motor);

  const shortComment = buildGeneralShortComment(scores, distractor, locale);

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

export function buildProfessionalNarrative(scores, metrics, validity, distractor, sustainability, locale = "tr") {
  const I = getReportPdfStrings(locale).indexes;
  const P = getReportPdfStrings(locale).professional;
  if (validity.isInvalid) {
    return [P.invalid1, P.invalid2, P.invalid3].join("\n\n");
  }

  const paras = [P.coop];
  paras.push(pickTierComment(I.attention, scores.attention));
  paras.push(pickTierComment(I.timing, scores.timing));
  paras.push(pickTierComment(I.impulsivity, scores.impulsivity));
  paras.push(pickTierComment(I.hyperactivity, scores.hyperactivity));
  paras.push(distractor.anyAffected ? P.distLow : P.distOk);
  if (sustainability.delta != null && sustainability.delta <= CLINICAL_THRESHOLDS.sustainabilityOrange) {
    paras.push(fillTemplate(P.sustNote, { label: sustainability.label }));
  }
  paras.push(P.disclaimer);
  return paras.join("\n\n");
}

export { riskLabel, formatDurationSeconds };
