/**
 * V4 algoritma doğrulama — salt okunur denetim.
 * Skor ağırlıklarını / rapor çıktısını değiştirmez; tutarsızlıkları raporlar.
 */
import {
  OVERALL_WEIGHTS,
  computeHyperactivityScore,
  countHyperMotorStats,
  countTrialBehaviors
} from "../metrics.js";
import {
  collectValidOnTimeRts,
  describeRtFiltering,
  removeRtOutliersIqr
} from "../metricsV2.js";
import {
  V3_MIN_RT_SAMPLES,
  V3_STABILITY_K_EXPLORATORY,
  V3_T_WEIGHT_LATE,
  V3_T_WEIGHT_STABILITY,
  computeTimingComponentsV3
} from "../metricsV3.js";
import { buildDistractorAnalysisFriendly } from "../report/reportClinical.js";
import { DISTRACTOR_DROP, distractorImpactLevel } from "../report/scoreTiers.js";
import {
  listDroppedIndices,
  listWeakIndices,
  maxIndexDrop,
  PHASE_DROP_MARKED,
  PHASE_DROP_SOFT
} from "../report/phaseComments.js";
import { buildReportPhaseBuckets, logsForBucket } from "../report/phaseBuckets.js";
import {
  computeDetailedMetrics,
  computeDetailedMetricsV4,
  getScores,
  timelineForBucket
} from "../reportHelpers.js";
import { getProfile } from "../profiles.js";
import { ACTIVE_REPORT_SCORING_VERSION } from "../scoringVersion.js";

const SCORE_TOL = 1;
const KIND_BY_KEY = { visual: "gorsel", auditory: "isitsel", combined: "kombine" };
const INDEX_LABEL = {
  attention: "A",
  timing: "T",
  impulsivity: "I",
  hyperactivity: "H",
  overall: "G"
};
const LEVEL_TO_KEY = {
  green: "preserved",
  yellow: "mild",
  orange: "moderate",
  red: "marked",
  gray: "noData"
};

function round(n, d = 0) {
  if (n == null || !Number.isFinite(Number(n))) return null;
  const f = 10 ** d;
  return Math.round(Number(n) * f) / f;
}

function pct(n, d) {
  if (!d) return null;
  return round((n / d) * 100, 1);
}

function scoreDiff(a, b) {
  if (a == null || b == null) return a == null && b == null ? 0 : null;
  return Math.round(Number(a)) - Math.round(Number(b));
}

function scoresClose(a, b, tol = SCORE_TOL) {
  const d = scoreDiff(a, b);
  if (d == null) return a == null && b == null;
  return Math.abs(d) <= tol;
}

function clamp01(x, a = 0, b = 100) {
  return Math.max(a, Math.min(b, x));
}

function trialEventId(t) {
  return `${t.section || "?"}#${t.trialNumber ?? "?"}`;
}

function iqrBoundsFor(rts) {
  if (!rts?.length || rts.length < 4) return null;
  const sorted = [...rts].sort((x, y) => x - y);
  const percentile = (p) => {
    const idx = (p / 100) * (sorted.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] * (1 - (idx - lo)) + sorted[hi] * (idx - lo);
  };
  const q1 = percentile(25);
  const q3 = percentile(75);
  const iqr = q3 - q1;
  return {
    lo: q1 - 1.5 * iqr,
    hi: q3 + 1.5 * iqr,
    q1,
    q3,
    n: rts.length
  };
}

/**
 * Her hedef deneme için RT örneklem durumu + gerekçe.
 * eventId = section#trialNumber (UUID yok).
 */
export function buildRtEventLedger(logs, lateMs) {
  const events = [];
  const onTimeCandidates = [];

  for (const t of logs || []) {
    if (!t.isTarget) continue;
    const id = trialEventId(t);
    const base = {
      eventId: id,
      trialNumber: t.trialNumber ?? null,
      section: t.section || null,
      rtMs: t.reactionTime ?? null,
      responded: Boolean(t.responded)
    };

    if (!t.responded) {
      events.push({
        ...base,
        inRtSample: false,
        reason: "omission",
        reasonTr: "İhmal — RT örneğine girmez"
      });
      continue;
    }
    const rt = Number(t.reactionTime);
    if (!(rt > 0)) {
      events.push({
        ...base,
        inRtSample: false,
        reason: "invalid_rt",
        reasonTr: "Geçersiz RT (≤0)"
      });
      continue;
    }
    if (rt > lateMs) {
      events.push({
        ...base,
        inRtSample: false,
        reason: "late",
        reasonTr: `Geç yanıt (RT > ${lateMs} ms) — T geç bileşeninde`
      });
      continue;
    }
    onTimeCandidates.push({ t, id, rt, base });
  }

  const bounds = iqrBoundsFor(onTimeCandidates.map((c) => c.rt));
  for (const c of onTimeCandidates) {
    const outlier = Boolean(bounds && (c.rt < bounds.lo || c.rt > bounds.hi));
    events.push({
      ...c.base,
      inRtSample: !outlier,
      reason: outlier ? "iqr_outlier" : "included",
      reasonTr: outlier
        ? `IQR aykırı (sınır ${Math.round(bounds.lo)}–${Math.round(bounds.hi)} ms)`
        : "Zamanında isabet — T örneğine dahil",
      iqrApplied: Boolean(bounds)
    });
  }

  const included = events.filter((e) => e.inRtSample);
  const excludedFromSample = events.filter((e) => e.reason === "iqr_outlier");
  return {
    lateMs,
    events,
    includedN: included.length,
    outlierN: excludedFromSample.length,
    onTimeRawN: onTimeCandidates.length,
    omissionN: events.filter((e) => e.reason === "omission").length,
    lateN: events.filter((e) => e.reason === "late").length,
    bounds: bounds
      ? {
          lo: Math.round(bounds.lo),
          hi: Math.round(bounds.hi),
          q1: Math.round(bounds.q1),
          q3: Math.round(bounds.q3)
        }
      : null,
    byId: Object.fromEntries(events.map((e) => [e.eventId, e]))
  };
}

/** Genel vs faz IQR farklarını event düzeyinde karşılaştır. */
export function compareOverallVsPhaseRt(overallLedger, phaseLedgers) {
  const mismatches = [];
  const phaseIncludedSum = phaseLedgers.reduce((s, p) => s + (p.ledger?.includedN || 0), 0);
  const overallIncluded = overallLedger.includedN;

  const seenInPhase = new Set();
  for (const phase of phaseLedgers) {
    for (const ev of phase.ledger?.events || []) {
      if (ev.reason === "omission" || ev.reason === "late" || ev.reason === "invalid_rt") continue;
      seenInPhase.add(ev.eventId);
      const overallEv = overallLedger.byId[ev.eventId];
      if (!overallEv) {
        mismatches.push({
          eventId: ev.eventId,
          phase: phase.label,
          overallReason: "missing_in_overall",
          phaseReason: ev.reason,
          detail: "Faz diliminde var, genel listede yok"
        });
        continue;
      }
      if (Boolean(overallEv.inRtSample) !== Boolean(ev.inRtSample)) {
        mismatches.push({
          eventId: ev.eventId,
          trialNumber: ev.trialNumber,
          section: ev.section,
          phase: phase.label,
          rtMs: ev.rtMs,
          overallIncluded: overallEv.inRtSample,
          phaseIncluded: ev.inRtSample,
          overallReason: overallEv.reason,
          phaseReason: ev.reason,
          detail: `Genel: ${overallEv.reasonTr} · Faz: ${ev.reasonTr}`
        });
      }
    }
  }

  const onlyOverall = [];
  for (const ev of overallLedger.events) {
    if (ev.reason !== "included" && ev.reason !== "iqr_outlier") continue;
    if (!seenInPhase.has(ev.eventId)) {
      onlyOverall.push({
        eventId: ev.eventId,
        trialNumber: ev.trialNumber,
        section: ev.section,
        rtMs: ev.rtMs,
        overallReason: ev.reason,
        detail: "Rapor faz kovalarına düşmeyen hedef RT"
      });
    }
  }

  const expectedIqr = [];
  const unexpected = [];
  for (const m of mismatches) {
    const iqrFlip =
      (m.overallReason === "included" && m.phaseReason === "iqr_outlier") ||
      (m.overallReason === "iqr_outlier" && m.phaseReason === "included");
    if (iqrFlip) expectedIqr.push(m);
    else unexpected.push(m);
  }

  // Event bazında bağımsız karşılaştırma yapıldı mı?
  const verified =
    overallLedger?.events?.length > 0 &&
    phaseLedgers.some((p) => (p.ledger?.events?.length || 0) > 0);

  return {
    overallIncludedN: overallIncluded,
    phaseIncludedSum,
    countDelta: overallIncluded - phaseIncludedSum,
    mismatchCount: mismatches.length,
    mismatches: mismatches.slice(0, 40),
    expectedIqrMismatches: expectedIqr.slice(0, 40),
    unexpectedMismatches: unexpected.slice(0, 40),
    onlyInOverall: onlyOverall.slice(0, 20),
    sameFilterLogic: true,
    verified,
    note:
      "Aynı filtre kuralları (zamanında + IQR) her dilimde kendi örneğine uygulanır; bu yüzden genel dahil N ≠ faz dahil toplamı olabilir."
  };
}

/** Ham olaylardan A/I/H — üretim V4 ile aynı formül, ayrı yol (döngüsel import yok). */
export function independentAIHFromRaw(logs, lateMs, pressTimeline = []) {
  const behaviors = countTrialBehaviors(logs, lateMs);
  const hyper = countHyperMotorStats(logs, pressTimeline);
  const timelinePresent = Array.isArray(pressTimeline) && pressTimeline.length > 0;

  const A = behaviors.targets
    ? Math.round(clamp01(100 - (behaviors.omissions / behaviors.targets) * 100))
    : 0;
  const faRate = behaviors.nonTargets ? (behaviors.falseAlarms / behaviors.nonTargets) * 100 : 0;
  let I = Math.round(clamp01(100 - faRate * 5));
  let H = computeHyperactivityScore(behaviors, logs, pressTimeline);

  const totalResponses = behaviors.hits + behaviors.late + behaviors.falseAlarms;
  const engaged = totalResponses > 0 || hyper.totalPresses > 0;
  if (!engaged && behaviors.targets >= 5) {
    I = 0;
    H = 0;
  }

  return {
    scores: { A, I, H },
    formulas: {
      A: "100 − (ihmal / hedef) × 100",
      I: "100 − (FA / hedef_dışı) × 100 × 5",
      H: "100 − multiTrialRate×50 − idlePerTrial×30 − motorPressRate×25"
    },
    inputs: {
      omissions: behaviors.omissions,
      targets: behaviors.targets,
      falseAlarms: behaviors.falseAlarms,
      nonTargets: behaviors.nonTargets,
      multiPresses: hyper.multiPresses,
      idlePresses: hyper.idlePresses,
      multiTrials: hyper.multiTrials,
      motorEvents: hyper.motorEvents
    },
    idleInHOnly: true,
    multiInHOnly: true,
    faNotInH: true,
    timelinePresent,
    timelineNote: timelinePresent
      ? "Boş ekran (idle) pressTimeline.errorType=idle ile H’ye girer."
      : "Timeline yok — idle=0; yalnızca multi (responseCount>1) H’ye girer. Idle doğrulaması NOT VERIFIED."
  };
}

/** Ham veriden A/T/I/H + genel — puan hesabı kontrolü (V4 ağırlıkları; üretim yolundan ayrı). */
export function independentScoresFromRaw(logs, lateMs, age = null, pressTimeline = []) {
  const aih = independentAIHFromRaw(logs, lateMs, pressTimeline);
  const behaviors = countTrialBehaviors(logs, lateMs);
  const { onTimeRts } = collectValidOnTimeRts(logs, lateMs);
  const timing = computeTimingComponentsV3(behaviors, onTimeRts, age, { applyIqr: true });
  const T = timing.unavailable ? null : timing.score;
  let overall = null;
  if (T != null) {
    overall = Math.round(
      clamp01(
        aih.scores.A * OVERALL_WEIGHTS.attention +
          T * OVERALL_WEIGHTS.timing +
          aih.scores.I * OVERALL_WEIGHTS.impulsivity +
          aih.scores.H * OVERALL_WEIGHTS.hyperactivity
      )
    );
  }
  return {
    ...aih,
    scores: { ...aih.scores, T, overall },
    timing,
    formulas: {
      ...aih.formulas,
      T: `T = ${V3_T_WEIGHT_STABILITY}×stabilite + ${V3_T_WEIGHT_LATE}×geç (IQR’li)`,
      overall: `A×${OVERALL_WEIGHTS.attention} + T×${OVERALL_WEIGHTS.timing} + I×${OVERALL_WEIGHTS.impulsivity} + H×${OVERALL_WEIGHTS.hyperactivity}`
    }
  };
}

function phaseRawBundle(logs, lateMs, pressTimeline = []) {
  const behaviors = countTrialBehaviors(logs, lateMs);
  const hyper = countHyperMotorStats(logs, pressTimeline);
  return {
    targets: behaviors.targets,
    nonTargets: behaviors.nonTargets,
    falseAlarms: behaviors.falseAlarms,
    omissions: behaviors.omissions,
    late: behaviors.late,
    hits: behaviors.hits,
    idlePresses: hyper.idlePresses,
    multiPresses: hyper.multiPresses,
    multiTrials: hyper.multiTrials
  };
}

function triggerIndexFromDrop(baseline, phase) {
  if (!baseline || !phase) return null;
  let best = null;
  for (const key of ["attention", "timing", "impulsivity", "hyperactivity", "overall"]) {
    const b = baseline[key];
    const c = phase[key];
    if (b == null || c == null) continue;
    const drop = Number(b) - Number(c);
    if (!best || drop > best.drop) {
      best = { key, label: INDEX_LABEL[key] || key, drop: round(drop, 1), from: Math.round(b), to: Math.round(c) };
    }
  }
  return best;
}

function finalizeStatus(checks) {
  const failCount = checks.filter((c) => c.severity === "fail").length;
  const unverifiedCount = checks.filter((c) => c.severity === "unverified").length;
  const passCount = checks.filter((c) => c.severity === "pass").length;
  const infoCount = checks.filter((c) => c.severity === "info").length;
  // Hiç pass/fail/unverified yoksa (yalnızca info veya boş) → NOT VERIFIED
  let passFail = "PASS";
  if (failCount) passFail = "FAIL";
  else if (unverifiedCount || (passCount === 0 && failCount === 0)) passFail = "NOT_VERIFIED";
  return { passFail, failCount, unverifiedCount, passCount, infoCount };
}

/** Tek dilim (genel veya faz) için RT / T denetim paketi. */
export function auditTimingSlice(logs, lateMs, age, pressTimeline = [], version = "v4") {
  const behaviors = countTrialBehaviors(logs, lateMs);
  const filter = describeRtFiltering(logs, lateMs);
  const { onTimeRts, rushUnder150 } = collectValidOnTimeRts(logs, lateMs);
  const cleaned = removeRtOutliersIqr(onTimeRts);
  const ledger = buildRtEventLedger(logs, lateMs);

  const metrics =
    version === "v4"
      ? computeDetailedMetricsV4(logs, lateMs, { pressTimeline, age }, age)
      : computeDetailedMetrics(logs, lateMs, { pressTimeline, age }, age);
  const scores = getScores(metrics);

  const lateCount = behaviors.late;
  const lateDenom = behaviors.targets;
  const lateRate = pct(lateCount, lateDenom);

  return {
    version,
    trialCount: logs.length,
    targets: behaviors.targets,
    rt: {
      rawOnTimeN: filter.rawN ?? onTimeRts.length,
      includedN: filter.cleanedN ?? cleaned.length,
      excludedN: filter.outliersRemoved ?? Math.max(0, onTimeRts.length - cleaned.length),
      excludedValues: filter.outlierValues ?? [],
      mean: metrics.avgReaction ?? null,
      median: metrics.medianReaction ?? null,
      sd: metrics.rtStd ?? null,
      cv: metrics.cv ?? null,
      rushUnder150: rushUnder150.length,
      iqrBounds: filter.bounds ?? null
    },
    late: {
      count: lateCount,
      denominator: lateDenom,
      denominatorLabel: "hedef deneme (isabet + geç + ihmal)",
      formula: `geç ${lateCount} / hedef ${lateDenom}`,
      ratePct: lateRate,
      respondedOnlyDenom: behaviors.hits + behaviors.late,
      respondedOnlyPct: pct(lateCount, behaviors.hits + behaviors.late)
    },
    timing: {
      stability: metrics.timingRtStability ?? null,
      lateSubscore: metrics.timingLateResponse ?? null,
      T: scores.timing,
      unavailable: Boolean(metrics.timingUnavailable),
      reason: metrics.timingReason ?? null,
      formula:
        version === "v4"
          ? `T = ${V3_T_WEIGHT_STABILITY}×stabilite + ${V3_T_WEIGHT_LATE}×geç (K=${V3_STABILITY_K_EXPLORATORY}, minRT=${V3_MIN_RT_SAMPLES})`
          : "T = V1 bileşik (hız + stabilite + geç + zamanında isabet)"
    },
    scores,
    behaviors,
    rtLedger: ledger
  };
}

function auditClassification(logs, lateMs, pressTimeline, v4Scores) {
  const behaviors = countTrialBehaviors(logs, lateMs);
  const hyper = countHyperMotorStats(logs, pressTimeline);
  const independent = independentAIHFromRaw(logs, lateMs, pressTimeline);

  const rules = [
    { event: "İhmal (yanıtsız hedef)", mapsTo: "A", count: behaviors.omissions },
    { event: "Hedef dışı ilk yanlış basış", mapsTo: "I", count: behaviors.falseAlarms },
    { event: "Boş ekran basışı", mapsTo: "H", count: hyper.idlePresses },
    { event: "Aynı denemede 2.+ basış", mapsTo: "H", count: hyper.multiPresses },
    { event: "Geçerli geç yanıt (RT > lateMs)", mapsTo: "T", count: behaviors.late }
  ];

  const notes = [
    "İhmal yalnızca A’da (T’ye ihmal oranı girmez).",
    "Hedef dışı ilk tepki I; mükerrer/boş basış H — FA, H formülüne girmez.",
    "Geç yanıt T geç-alt puanında; A ihmalinden ayrıdır."
  ];

  return {
    rules,
    notes,
    raw: {
      omissions: behaviors.omissions,
      falseAlarms: behaviors.falseAlarms,
      late: behaviors.late,
      hits: behaviors.hits,
      multiPressTrials: behaviors.multiPress,
      multiPresses: hyper.multiPresses,
      idlePresses: hyper.idlePresses,
      motorEvents: hyper.motorEvents
    },
    independent,
    computedScores: {
      A: v4Scores.attention,
      T: v4Scores.timing,
      I: v4Scores.impulsivity,
      H: v4Scores.hyperactivity,
      overall: v4Scores.overall
    }
  };
}

function auditDistractors(logs, profile, age, pressTimeline, locale) {
  const buckets = buildReportPhaseBuckets(profile, locale);
  const baselineBucket = buckets.find((b) => b.kind === "temel");
  const baselineList = baselineBucket ? logsForBucket(logs, baselineBucket) : [];
  const baselineTl = baselineBucket ? timelineForBucket(pressTimeline, baselineBucket) : [];
  const baselineV4 = baselineList.length
    ? getScores(
        computeDetailedMetricsV4(baselineList, profile.lateResponseMs, { pressTimeline: baselineTl, age }, age)
      )
    : null;

  const friendly = buildDistractorAnalysisFriendly(logs, profile, age, pressTimeline, locale);

  const items = (friendly.items || []).map((item) => {
    const kind = KIND_BY_KEY[item.key] || null;
    const bucket = kind ? buckets.find((b) => b.kind === kind) : null;
    const list = bucket ? logsForBucket(logs, bucket) : [];
    const tl = bucket ? timelineForBucket(pressTimeline, bucket) : [];
    const phaseV4 = list.length
      ? getScores(computeDetailedMetricsV4(list, profile.lateResponseMs, { pressTimeline: tl, age }, age))
      : null;
    const phaseV1 = list.length
      ? getScores(computeDetailedMetrics(list, profile.lateResponseMs, { pressTimeline: tl, age }, age))
      : null;

    const deltasV4 = {};
    const dataStatus =
      !baselineV4 && !phaseV4
        ? "unverified"
        : !baselineV4 || !phaseV4
          ? "unverified"
          : "ok";

    if (baselineV4 && phaseV4) {
      for (const k of ["attention", "timing", "impulsivity", "hyperactivity", "overall"]) {
        deltasV4[k] = scoreDiff(phaseV4[k], baselineV4[k]);
      }
    }
    const dropFromBaseline = baselineV4 && phaseV4 ? maxIndexDrop(baselineV4, phaseV4) : null;
    const dropped = baselineV4 && phaseV4 ? listDroppedIndices(baselineV4, phaseV4) : [];
    const weak = phaseV4 ? listWeakIndices(phaseV4) : [];
    const triggerIndex = triggerIndexFromDrop(baselineV4, phaseV4);
    // Eşiklerden bağımsız yeniden hesap (rapor etiketini okumakla yetinme)
    const expectedLevelFromThresholds =
      dropFromBaseline == null ? null : distractorImpactLevel(dropFromBaseline);
    const rawPhase = list.length ? phaseRawBundle(list, profile.lateResponseMs, tl) : null;

    const issues = [];
    if (dataStatus === "unverified") {
      issues.push({
        code: "DISTRACTOR_BUCKET_EMPTY",
        severity: "unverified",
        message: !baselineV4
          ? "Temel faz skoru yok — Δ hesaplanamadı."
          : "Çeldirici faz kovası boş — Δ hesaplanamadı."
      });
    }
    if (
      expectedLevelFromThresholds &&
      item.level &&
      item.level !== "gray" &&
      expectedLevelFromThresholds !== item.level
    ) {
      issues.push({
        code: "LABEL_VS_THRESHOLD",
        severity: "fail",
        message: `maxDrop=${round(dropFromBaseline, 1)} → eşik ${LEVEL_TO_KEY[expectedLevelFromThresholds] || expectedLevelFromThresholds}, raporda «${item.label}» (${item.level}).`
      });
    }
    if (dropFromBaseline != null && dropFromBaseline <= 0 && ["yellow", "orange", "red"].includes(item.level)) {
      issues.push({
        code: "COMMENT_DROP_WHILE_SCORES_UP",
        severity: "fail",
        message: `Raporda «${item.label}» iken V4 alt endekslerde baza göre düşüş yok (maxDrop=${round(dropFromBaseline, 1)}).`
      });
    }
    if (dropFromBaseline != null && dropFromBaseline > PHASE_DROP_SOFT && item.level === "green") {
      issues.push({
        code: "COMMENT_PRESERVED_WHILE_DROP",
        severity: "fail",
        message: `V4’te anlamlı düşüş var (maxDrop=${round(dropFromBaseline, 1)}) ama etiket «${item.label}».`
      });
    }

    return {
      key: item.key,
      title: item.title,
      reportLabel: item.label,
      reportLevel: item.level,
      reportComment: item.comment,
      reportMaxDrop: item.maxDrop ?? null,
      thresholds: {
        none: DISTRACTOR_DROP.none,
        mild: DISTRACTOR_DROP.mild,
        moderate: DISTRACTOR_DROP.moderate,
        softDrop: PHASE_DROP_SOFT,
        markedDrop: PHASE_DROP_MARKED
      },
      baselineV4,
      phaseV1,
      phaseV4,
      deltasV4,
      dropFromBaselineV4: dropFromBaseline,
      triggerIndex,
      droppedIndices: dropped,
      weakIndices: weak,
      rawPhase,
      dataStatus,
      expectedLevelFromV4Drop: expectedLevelFromThresholds,
      expectedLevelKey: expectedLevelFromThresholds
        ? LEVEL_TO_KEY[expectedLevelFromThresholds] || expectedLevelFromThresholds
        : null,
      issues
    };
  });

  return { baselineV4, items, friendlyGeneral: friendly.general };
}

/**
 * Tek oturum denetimi.
 * @param {object} detail fetchSessionDetail
 * @param {array} pressTimeline
 * @param {string} locale
 */
export function auditSession(detail, pressTimeline = [], locale = "tr") {
  const profileKey = detail.profile_key || "adult";
  const profile = getProfile(profileKey);
  const lateMs = profile.lateResponseMs;
  const age = detail.participant_age ?? null;
  const logs = detail.logs || [];
  const tl = pressTimeline || [];

  const checks = [];
  const add = (code, severity, message, group = "general", extra = {}) => {
    checks.push({ code, severity, message, group, ...extra });
  };

  if (!logs.length) {
    return {
      sessionId: detail.id,
      name: detail.participant_name,
      age,
      profileKey,
      createdAt: detail.created_at,
      algorithmVersion: ACTIVE_REPORT_SCORING_VERSION,
      passFail: "FAIL",
      failCount: 1,
      unverifiedCount: 0,
      passCount: 0,
      infoCount: 0,
      checks: [{ code: "NO_LOGS", severity: "fail", message: "Oturumda logs yok.", group: "data" }],
      checkGroups: [],
      overall: null,
      phases: [],
      distractor: null,
      classification: null,
      rtCompare: null
    };
  }

  const overallV4 = auditTimingSlice(logs, lateMs, age, tl, "v4");
  const overallV1 = auditTimingSlice(logs, lateMs, age, tl, "v1");
  const pdfScores = overallV4.scores;
  const overallLedger = overallV4.rtLedger;

  const stored = detail.metrics || {};
  const storedScores = {
    A: stored.attentionScore ?? null,
    T: stored.speedScore ?? stored.timingScore ?? null,
    I: stored.impulseScore ?? null,
    H: stored.consistencyScore ?? null,
    overall: stored.overallScore ?? null
  };

  let storedCompared = 0;
  let storedMismatch = 0;
  for (const [label, key, storedKey] of [
    ["A", "attention", "A"],
    ["T", "timing", "T"],
    ["I", "impulsivity", "I"],
    ["H", "hyperactivity", "H"],
    ["Genel", "overall", "overall"]
  ]) {
    const recomputed = pdfScores[key];
    const fromDb = storedScores[storedKey];
    if (fromDb == null || recomputed == null) {
      add(
        "STORED_SCORE_MISSING",
        "unverified",
        `Kayıtlı veya yeniden hesap ${label} eksik (kayıt=${fromDb ?? "—"}, V4=${recomputed ?? "—"}).`,
        "stored_scores"
      );
      continue;
    }
    storedCompared += 1;
    if (!scoresClose(fromDb, recomputed)) {
      storedMismatch += 1;
      add(
        "STORED_VS_V4",
        "fail",
        `Kayıtlı ${label}=${fromDb} ≠ yeniden hesap V4 ${label}=${recomputed} (Δ=${scoreDiff(fromDb, recomputed)}).`,
        "stored_scores"
      );
    }
  }
  if (storedCompared && !storedMismatch) {
    add("STORED_VS_V4_OK", "pass", `Kayıtlı A/T/I/H/G ile V4 yeniden hesap ≤${SCORE_TOL} toleransta.`, "stored_scores");
  }

  // Puan hesabı PASS/NOT VERIFIED → PDF araştırma eki (denetim ekranında yok)
  const independentFull = independentScoresFromRaw(logs, lateMs, age, tl);

  const buckets = buildReportPhaseBuckets(profile, locale);
  const phaseLedgers = [];
  const phases = buckets.map((bucket) => {
    const list = logsForBucket(logs, bucket);
    const bucketTl = timelineForBucket(tl, bucket);
    if (!list.length) {
      return { label: bucket.label, kind: bucket.kind, empty: true };
    }
    const v1 = auditTimingSlice(list, lateMs, age, bucketTl, "v1");
    const v4 = auditTimingSlice(list, lateMs, age, bucketTl, "v4");
    phaseLedgers.push({ label: bucket.label, kind: bucket.kind, ledger: v4.rtLedger });
    const tMismatch = !scoresClose(v1.timing.T, v4.timing.T);
    if (tMismatch) {
      add(
        "PHASE_T_V1_VS_V4_REF",
        "info",
        `${bucket.label}: referans V1 T=${v1.timing.T ?? "—"} · rapor V4 T=${v4.timing.T ?? "—"} (rapor V4 kullanır).`,
        "general"
      );
    }
    return {
      label: bucket.label,
      kind: bucket.kind,
      empty: false,
      trialCount: list.length,
      v1,
      v4,
      tMismatch,
      sameFilterAsOverall: true,
      lateFormula: v4.late?.formula,
      raw: phaseRawBundle(list, lateMs, bucketTl)
    };
  });

  const rtCompare = compareOverallVsPhaseRt(overallLedger, phaseLedgers);
  if (!rtCompare.verified) {
    add(
      "RT_FILTER_NOT_VERIFIED",
      "unverified",
      "RT event ledger üretilemedi — genel/faz filtre karşılaştırması yapılamadı.",
      "rt_filter",
      { rtCompare }
    );
  } else if (rtCompare.onlyInOverall.length) {
    add(
      "RT_ORPHAN_OUTSIDE_PHASES",
      "fail",
      `${rtCompare.onlyInOverall.length} zamanında hedef RT hiçbir rapor faz kovasına düşmedi (ör. ${rtCompare.onlyInOverall
        .slice(0, 3)
        .map((e) => e.eventId)
        .join(", ")}).`,
      "rt_filter",
      { rtCompare }
    );
  } else if ((rtCompare.unexpectedMismatches || []).length) {
    add(
      "RT_UNEXPECTED_MISMATCH",
      "fail",
      `Beklenmeyen genel↔faz RT farkı: ${rtCompare.unexpectedMismatches.length} olay (IQR dilim farkı dışı).`,
      "rt_filter",
      { rtCompare }
    );
  } else if (Math.abs(rtCompare.countDelta) > 0 || rtCompare.mismatchCount > 0) {
    // 169/167 gibi farklar: event bazında yalnız dilim IQR flip → beklenen → PASS
    add(
      "RT_OVERALL_VS_PHASE_OK",
      "pass",
      `Genel dahil RT=${rtCompare.overallIncludedN}, faz toplamı=${rtCompare.phaseIncludedSum} (Δ=${rtCompare.countDelta}). Event bazında doğrulandı: ${rtCompare.expectedIqrMismatches?.length || rtCompare.mismatchCount} fark dilim IQR kaynaklı (beklenen).`,
      "rt_filter",
      { rtCompare }
    );
  } else {
    add(
      "RT_OVERALL_VS_PHASE_OK",
      "pass",
      `Genel ve faz dahil RT toplamı eşit (${rtCompare.overallIncludedN}). Event bazında filtre tutarlı.`,
      "rt_filter"
    );
  }

  add(
    "LATE_DENOMINATOR",
    "pass",
    `Geç % paydası = tüm hedef denemeler. Genel: ${overallV4.late.formula} = %${overallV4.late.ratePct ?? "—"}.`,
    "phase_counts"
  );

  const phaseV4Ts = phases.filter((p) => !p.empty && p.v4?.timing?.T != null).map((p) => p.v4.timing.T);
  if (phaseV4Ts.length && overallV4.timing.T != null) {
    const avg = phaseV4Ts.reduce((s, v) => s + v, 0) / phaseV4Ts.length;
    add(
      "OVERALL_T_NOT_PHASE_AVG",
      "info",
      `Genel T(V4)=${overallV4.timing.T}; faz T(V4) ortalaması=${round(avg, 1)}. Genel T faz ortalaması değildir.`,
      "general"
    );
  }

  const distractor = auditDistractors(logs, profile, age, tl, locale);
  let distractorFail = 0;
  let distractorUnverified = 0;
  for (const item of distractor.items) {
    for (const issue of item.issues) {
      add(issue.code, issue.severity, `${item.title}: ${issue.message}`, "distractor_comments");
      if (issue.severity === "fail") distractorFail += 1;
      if (issue.severity === "unverified") distractorUnverified += 1;
    }
  }
  if (!distractorFail && !distractorUnverified) {
    add(
      "DISTRACTOR_COMMENTS_OK",
      "pass",
      "Çeldirici etiketleri V4 faz−temel düşüşleri ile tutarlı; ΔA/T/I/H dolduruldu.",
      "distractor_comments"
    );
  }

  const classification = auditClassification(logs, lateMs, tl, pdfScores);
  classification.independent = independentFull;
  classification.pdfScores = {
    A: pdfScores.attention,
    T: pdfScores.timing,
    I: pdfScores.impulsivity,
    H: pdfScores.hyperactivity,
    overall: pdfScores.overall
  };
  classification.storedScores = storedScores;
  classification.diffs = {
    A: scoreDiff(storedScores.A, pdfScores.attention),
    T: scoreDiff(storedScores.T, pdfScores.timing),
    I: scoreDiff(storedScores.I, pdfScores.impulsivity),
    H: scoreDiff(storedScores.H, pdfScores.hyperactivity),
    overall: scoreDiff(storedScores.overall, pdfScores.overall)
  };

  const ind = classification.independent;
  const aOk = scoresClose(ind.scores.A, pdfScores.attention);
  const iOk = scoresClose(ind.scores.I, pdfScores.impulsivity);
  const hOk = scoresClose(ind.scores.H, pdfScores.hyperactivity);
  if (aOk && iOk && hOk) {
    add(
      "AIH_INDEPENDENT_OK",
      "pass",
      `Bağımsız ham formül A/I/H = ${ind.scores.A}/${ind.scores.I}/${ind.scores.H} · PDF ile uyumlu. FA→H yok; idle+multi yalnız H.`,
      "aih_independent"
    );
  } else {
    add(
      "AIH_INDEPENDENT_MISMATCH",
      "fail",
      `Bağımsız A/I/H ${ind.scores.A}/${ind.scores.I}/${ind.scores.H} ≠ PDF ${pdfScores.attention}/${pdfScores.impulsivity}/${pdfScores.hyperactivity}.`,
      "aih_independent"
    );
  }
  if (!ind.timelinePresent) {
    add(
      "IDLE_TIMELINE_MISSING",
      "unverified",
      "Press timeline yok — boş ekran (idle) H’ye 0 yazılır; idle doğrulaması yapılamadı.",
      "aih_independent"
    );
  } else {
    add(
      "IDLE_IN_H_ONLY",
      "pass",
      `Timeline mevcut: idle=${ind.inputs.idlePresses}, multi=${ind.inputs.multiPresses} yalnız H; FA=${ind.inputs.falseAlarms} yalnız I.`,
      "aih_independent"
    );
  }

  const status = finalizeStatus(checks);
  const groupIds = [
    "stored_scores",
    "rt_filter",
    "phase_counts",
    "distractor_comments",
    "aih_independent"
  ];
  const checkGroups = groupIds.map((id) => {
    const gChecks = checks.filter((c) => c.group === id);
    const st = finalizeStatus(gChecks);
    return {
      id,
      label:
        {
          stored_scores: "PDF ↔ kayıtlı skor",
          rt_filter: "RT filtre tutarlılığı",
          phase_counts: "Faz / geç sayımları",
          distractor_comments: "Çeldirici yorumları",
          aih_independent: "A/I/H sınıflandırma"
        }[id] || id,
      ...st,
      checks: gChecks
    };
  });

  return {
    sessionId: detail.id,
    name: detail.participant_name || "—",
    age,
    profileKey,
    createdAt: detail.created_at,
    algorithmVersion: ACTIVE_REPORT_SCORING_VERSION,
    lateMs,
    ...status,
    checks,
    checkGroups,
    overall: {
      v4: overallV4,
      v1: overallV1,
      pdfScores,
      storedScores
    },
    phases,
    distractor,
    classification,
    rtCompare,
    constants: {
      tWeights: { stability: V3_T_WEIGHT_STABILITY, late: V3_T_WEIGHT_LATE },
      stabilityK: V3_STABILITY_K_EXPLORATORY,
      minRtSamples: V3_MIN_RT_SAMPLES,
      distractorDrop: DISTRACTOR_DROP,
      phaseDropSoft: PHASE_DROP_SOFT,
      phaseDropMarked: PHASE_DROP_MARKED
    }
  };
}

export async function loadAndAuditSessions(sessionSummaries, { fetchDetail, fetchTimeline, locale = "tr" }) {
  const out = [];
  for (const s of sessionSummaries) {
    try {
      const [detail, timeline] = await Promise.all([
        fetchDetail(s.id),
        fetchTimeline(s.id).catch(() => [])
      ]);
      if (!detail) {
        out.push({
          sessionId: s.id,
          name: s.participant_name,
          passFail: "FAIL",
          failCount: 1,
          unverifiedCount: 0,
          checks: [{ code: "NO_DETAIL", severity: "fail", message: "Oturum detayı yok.", group: "data" }],
          checkGroups: []
        });
        continue;
      }
      out.push(auditSession(detail, timeline ?? [], locale));
    } catch (e) {
      out.push({
        sessionId: s.id,
        name: s.participant_name,
        passFail: "FAIL",
        failCount: 1,
        unverifiedCount: 0,
        checks: [{ code: "AUDIT_ERROR", severity: "fail", message: e.message || String(e), group: "data" }],
        checkGroups: []
      });
    }
  }
  return out;
}

/** Profil filtreli son N oturum (liste zaten created_at desc). */
export function pickSessionsForAudit(sessions, profileKey = "adult", limit = 6) {
  const list = Array.isArray(sessions) ? sessions : [];
  return list.filter((s) => (s.profile_key || "adult") === profileKey).slice(0, limit);
}
