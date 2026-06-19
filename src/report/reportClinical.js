import {
  computeDetailedMetrics,
  computeSustainabilityIndex,
  formatDurationSeconds,
  getScores
} from "../reportHelpers.js";
import { buildReportPhaseBuckets, logsForBucket } from "./phaseBuckets.js";
import { getOverallRiskText, riskLabel } from "../metrics.js";
import { fillTemplate, getReportPdfStrings } from "../i18n/reportPdfStrings.js";

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
  if (score >= 90) return L.veryGood;
  if (score >= 80) return L.good;
  if (score >= 70) return L.average;
  if (score >= 60) return L.low;
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
  if (score >= 80) return block.c80;
  if (score >= 70) return block.c70;
  if (score >= 60) return block.c60;
  return block.cLow;
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
    if (deltaA <= -50) {
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
  } else if (targetHits.length >= 5 && fastRate >= 15) {
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
  checklist.push(metrics.omissionRate <= 40 ? V.check_coopOk : V.check_coopLow);
  checklist.push(
    metrics.avgReaction >= 150 && metrics.avgReaction <= 1200 && fastRate < 15 ? V.check_rtOk : V.check_rtBad
  );
  checklist.push(metrics.rtStd >= 20 && metrics.rtStd <= 350 ? V.check_patternOk : V.check_patternBad);
  if (!isInvalid && score >= 75) checklist.push(V.check_clinicalOk);
  else if (!isInvalid) checklist.push(V.check_caution);
  else checklist.push(V.check_invalid);

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
    patternConsistent: !hasCritical && fastRate < 15
  };
}

function distractorPhaseScore(logs, profile, age, pressTimeline, matcher, locale) {
  const list = phaseLogs(logs, matcher);
  if (!list.length) return null;
  const late = profile.lateResponseMs;
  const tl = pressTimeline ?? [];
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
      return { title, emoji: "—", label: D.noData, comment: D.noDataComment };
    }
    const baseOverall = baseline.overall;
    const distOverall = distScores.overall;
    const pct = baseOverall > 0 ? ((baseOverall - distOverall) / baseOverall) * 100 : 0;

    if (pct <= 5) {
      const comment = key === "visual" ? D.visualOk : key === "auditory" ? D.auditoryOk : D.combinedOk;
      return { title, emoji: "🟢", label: D.preserved, comment };
    }
    if (pct <= 15) {
      return { title, emoji: "🟡", label: D.mild, comment: fillTemplate(D.mildComment, { title }) };
    }
    if (pct <= 30) {
      return { title, emoji: "🟠", label: D.moderate, comment: fillTemplate(D.moderateComment, { title }) };
    }
    return { title, emoji: "🔴", label: D.marked, comment: fillTemplate(D.markedComment, { title }) };
  };

  const items = types.map((t) => analyze(t.title, t.scores, t.key));
  const anyAffected = items.some((i) => i.emoji === "🟡" || i.emoji === "🟠" || i.emoji === "🔴");
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

function profTier(block, score) {
  if (score >= 80) return block.ok;
  if (score >= 70) return block.c70;
  if (score >= 60) return block.c60;
  return block.low;
}

export function buildClinicalFlags(scores, metrics, validity, distractor, sustainability, locale = "tr") {
  const F = getReportPdfStrings(locale).flags;
  const flags = [];

  if (validity.isInvalid) {
    flags.push({ level: "red", emoji: "🔴", text: F.invalid });
    return flags;
  }
  if (scores.impulsivity < 75) flags.push({ level: "yellow", emoji: "🟡", text: F.impulse });
  if (distractor.anyAffected) flags.push({ level: "yellow", emoji: "🟡", text: F.distractor });
  if (sustainability.delta != null && sustainability.delta <= -15) {
    flags.push({ level: "orange", emoji: "🟠", text: F.sustainability });
  }
  if (scores.overall < 55 || scores.attention < 60 || scores.timing < 55 || scores.impulsivity < 55) {
    flags.push({ level: "red", emoji: "🔴", text: F.poor });
  }
  if (!flags.length) flags.push({ level: "green", emoji: "🟢", text: F.none });
  return flags;
}

export function buildExecutiveSummary(scores, metrics, validity, clinicalFlags, distractor, locale = "tr") {
  const E = getReportPdfStrings(locale).executive;
  const St = getReportPdfStrings(locale).strengths;
  const risk = getOverallRiskText(scores.overall, locale);

  const strengths = [];
  if (scores.attention >= 80) strengths.push(St.attention);
  if (scores.timing >= 80) strengths.push(St.timing);
  if (scores.impulsivity >= 80) strengths.push(St.impulse);
  if (scores.hyperactivity >= 80) strengths.push(St.motor);

  const weaknesses = [];
  if (scores.timing < 75) weaknesses.push(St.timing);
  if (scores.impulsivity < 75) weaknesses.push(St.impulse);
  if (scores.attention < 75) weaknesses.push(St.attention);
  if (scores.hyperactivity < 75) weaknesses.push(St.motor);

  const line1 = scores.attention >= 70 ? E.line1ok : E.line1low;
  const line2Parts = [];
  if (scores.timing < 75) line2Parts.push(E.timingIssue);
  if (scores.impulsivity < 60) line2Parts.push(E.impulseIssueStrong);
  else if (scores.impulsivity < 75) line2Parts.push(E.impulseIssue);
  const line2 =
    line2Parts.length > 0
      ? fillTemplate(E.line2mixed, { parts: line2Parts.join(locale === "en" ? " and " : " ve ") })
      : E.line2ok;
  const line3 = distractor.anyAffected ? E.line3bad : E.line3ok;

  return {
    overall: scores.overall,
    risk,
    strengths,
    weaknesses,
    clinicalFlags,
    shortComment: [line1, line2, line3].join(" "),
    lines: [line1, line2, line3]
  };
}

export function buildProfessionalNarrative(scores, metrics, validity, distractor, sustainability, locale = "tr") {
  const P = getReportPdfStrings(locale).professional;
  if (validity.isInvalid) {
    return [P.invalid1, P.invalid2, P.invalid3].join("\n\n");
  }

  const att = { ok: P.attOk, c70: P.attC70, c60: P.attC60, low: P.attLow };
  const tim = { ok: P.timOk, c70: P.timC70, c60: P.timC60, low: P.timLow };
  const imp = { ok: P.impOk, c70: P.impC70, c60: P.impC60, low: P.impLow };
  const hyp = { ok: P.hypOk, c70: P.hypC70, c60: P.hypC60, low: P.hypLow };

  const paras = [P.coop];
  paras.push(profTier(att, scores.attention));
  paras.push(profTier(tim, scores.timing));
  paras.push(profTier(imp, scores.impulsivity));
  paras.push(profTier(hyp, scores.hyperactivity));
  paras.push(distractor.anyAffected ? P.distLow : P.distOk);
  if (sustainability.delta != null && sustainability.delta <= -15) {
    paras.push(fillTemplate(P.sustNote, { label: sustainability.label }));
  }
  paras.push(P.disclaimer);
  return paras.join("\n\n");
}

export { riskLabel, formatDurationSeconds };
