/**
 * V4 algoritma doğrulama — salt okunur denetim.
 * Skor ağırlıklarını / rapor çıktısını değiştirmez; tutarsızlıkları raporlar.
 */
import { getProfile } from "../profiles.js";
import {
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
  V3_T_WEIGHT_STABILITY
} from "../metricsV3.js";
import {
  buildDistractorAnalysisFriendly
} from "../report/reportClinical.js";
import {
  DISTRACTOR_DROP,
  distractorImpactLevel
} from "../report/scoreTiers.js";
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
import { ACTIVE_REPORT_SCORING_VERSION } from "../scoringVersion.js";

const SCORE_TOL = 1;

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

/** Tek dilim (genel veya faz) için RT / T denetim paketi. */
export function auditTimingSlice(logs, lateMs, age, pressTimeline = [], version = "v4") {
  const behaviors = countTrialBehaviors(logs, lateMs);
  const filter = describeRtFiltering(logs, lateMs);
  const { onTimeRts, rushUnder150 } = collectValidOnTimeRts(logs, lateMs);
  const cleaned = removeRtOutliersIqr(onTimeRts);

  const metrics =
    version === "v4"
      ? computeDetailedMetricsV4(logs, lateMs, { pressTimeline, age }, age)
      : computeDetailedMetrics(logs, lateMs, { pressTimeline, age }, age);
  const scores = getScores(metrics);

  const lateCount = behaviors.late;
  const lateRate = pct(lateCount, behaviors.targets);

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
      ratePct: lateRate
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
    behaviors
  };
}

function auditClassification(logs, lateMs, pressTimeline, v4Scores) {
  const behaviors = countTrialBehaviors(logs, lateMs);
  const hyper = countHyperMotorStats(logs, pressTimeline);

  // Sınıflandırma sözleşmesi (çift ceza kontrolü)
  const rules = [
    { event: "İhmal (yanıtsız hedef)", mapsTo: "A", count: behaviors.omissions },
    { event: "Hedef dışı ilk yanlış basış", mapsTo: "I", count: behaviors.falseAlarms },
    { event: "Boş ekran basışı", mapsTo: "H", count: hyper.idlePresses },
    { event: "Aynı denemede 2.+ basış", mapsTo: "H", count: hyper.multiPresses },
    { event: "Geçerli geç yanıt (RT > lateMs)", mapsTo: "T", count: behaviors.late }
  ];

  // Aynı deneme hem FA hem multi olabilir; I ilk basış, H ekstra — bilinçli ayrım
  const notes = [
    "İhmal yalnızca A’da (T’ye ihmal oranı girmez).",
    "Hedef dışı ilk tepki I; mükerrer/boş basış H — aynı olay iki endekste skorlanmamalı.",
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

  // Raporda görünen yol (V1 faz skorları)
  const friendly = buildDistractorAnalysisFriendly(logs, profile, age, pressTimeline, locale);

  const items = (friendly.items || []).map((item) => {
    const kind =
      item.key === "visual" ? "gorsel" : item.key === "auditory" ? "isitsel" : item.key === "combined" ? "kombine" : null;
    const bucket = buckets.find((b) => b.kind === kind);
    const list = bucket ? logsForBucket(logs, bucket) : [];
    const tl = bucket ? timelineForBucket(pressTimeline, bucket) : [];
    const phaseV4 = list.length
      ? getScores(computeDetailedMetricsV4(list, profile.lateResponseMs, { pressTimeline: tl, age }, age))
      : null;
    const phaseV1 = list.length
      ? getScores(computeDetailedMetrics(list, profile.lateResponseMs, { pressTimeline: tl, age }, age))
      : null;

    const deltasV4 = {};
    if (baselineV4 && phaseV4) {
      for (const k of ["attention", "timing", "impulsivity", "hyperactivity", "overall"]) {
        deltasV4[k] = scoreDiff(phaseV4[k], baselineV4[k]); // current - baseline (negatif = düşüş)
      }
    }
    const dropFromBaseline = baselineV4 && phaseV4 ? maxIndexDrop(baselineV4, phaseV4) : null;
    const dropped = baselineV4 && phaseV4 ? listDroppedIndices(baselineV4, phaseV4) : [];
    const weak = phaseV4 ? listWeakIndices(phaseV4) : [];

    const issues = [];
    // Puanlar yükselirken "düşüş / etki" dili
    if (dropFromBaseline != null && dropFromBaseline <= 0 && ["yellow", "orange", "red"].includes(item.level)) {
      issues.push({
        code: "COMMENT_DROP_WHILE_SCORES_UP",
        severity: "fail",
        message: `Raporda «${item.label}» iken V4 alt endekslerde baza göre düşüş yok (maxDrop=${round(dropFromBaseline, 1)}).`
      });
    }
    // Belirgin düşüş varken "korunmuştur / etki yok"
    if (dropFromBaseline != null && dropFromBaseline > PHASE_DROP_SOFT && item.level === "green") {
      issues.push({
        code: "COMMENT_PRESERVED_WHILE_DROP",
        severity: "fail",
        message: `V4’te anlamlı düşüş var (maxDrop=${round(dropFromBaseline, 1)}) ama etiket «${item.label}».`
      });
    }
    if (weak.length && item.level === "green") {
      issues.push({
        code: "WEAK_INDEX_HIDDEN",
        severity: "fail",
        message: `Zayıf endeks(ler) gizlenmiş olabilir: ${weak.map((w) => `${w.label}=${w.score}`).join(", ")}`
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
      droppedIndices: dropped,
      weakIndices: weak,
      expectedLevelFromV4Drop:
        dropFromBaseline == null ? null : distractorImpactLevel(dropFromBaseline),
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
  const add = (code, severity, message, extra = {}) => {
    checks.push({ code, severity, message, ...extra });
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
      checks: [{ code: "NO_LOGS", severity: "fail", message: "Oturumda logs yok." }],
      overall: null,
      phases: [],
      distractor: null,
      classification: null
    };
  }

  const overallV4 = auditTimingSlice(logs, lateMs, age, tl, "v4");
  const overallV1 = auditTimingSlice(logs, lateMs, age, tl, "v1");
  const pdfScores = overallV4.scores;

  const stored = detail.metrics || {};
  const storedScores = {
    A: stored.attentionScore ?? null,
    T: stored.speedScore ?? stored.timingScore ?? null,
    I: stored.impulseScore ?? null,
    H: stored.consistencyScore ?? null,
    overall: stored.overallScore ?? null
  };

  for (const [label, key, storedKey] of [
    ["A", "attention", "A"],
    ["T", "timing", "T"],
    ["I", "impulsivity", "I"],
    ["H", "hyperactivity", "H"],
    ["Genel", "overall", "overall"]
  ]) {
    const recomputed = pdfScores[key];
    const fromDb = storedScores[storedKey];
    if (fromDb != null && recomputed != null && !scoresClose(fromDb, recomputed)) {
      add(
        "STORED_VS_V4",
        "fail",
        `Kayıtlı ${label}=${fromDb} ≠ yeniden hesap V4 ${label}=${recomputed} (Δ=${scoreDiff(fromDb, recomputed)}).`
      );
    }
  }

  // Yapısal bulgu: faz tablosu V1 kullanıyor
  add(
    "PHASE_PATH_USES_V1",
    "fail",
    "PDF faz / çeldirici skorları scoresForPhaseBucket → computeDetailedMetrics (V1) ile üretiliyor; genel rapor skorları V4. Aynı formül değil."
  );

  const buckets = buildReportPhaseBuckets(profile, locale);
  const phases = buckets.map((bucket) => {
    const list = logsForBucket(logs, bucket);
    const bucketTl = timelineForBucket(tl, bucket);
    if (!list.length) {
      return {
        label: bucket.label,
        kind: bucket.kind,
        empty: true
      };
    }
    const v1 = auditTimingSlice(list, lateMs, age, bucketTl, "v1");
    const v4 = auditTimingSlice(list, lateMs, age, bucketTl, "v4");
    const tMismatch = !scoresClose(v1.timing.T, v4.timing.T);
    if (tMismatch) {
      add(
        "PHASE_T_V1_VS_V4",
        "fail",
        `${bucket.label}: faz T(V1)=${v1.timing.T ?? "—"} ≠ T(V4 dilim)=${v4.timing.T ?? "—"} (genel T ile aynı V4 formülü dilime uygulanırsa).`
      );
    }
    // Genel T ≠ faz T ortalaması kontrolü (bilinçli; uyarı)
    return {
      label: bucket.label,
      kind: bucket.kind,
      empty: false,
      trialCount: list.length,
      v1,
      v4,
      tMismatch,
      sameFilterAsOverall: true // aynı collectValidOnTimeRts + IQR, dilim logları üzerinde
    };
  });

  const phaseV4Ts = phases.filter((p) => !p.empty && p.v4?.timing?.T != null).map((p) => p.v4.timing.T);
  if (phaseV4Ts.length && overallV4.timing.T != null) {
    const avg = phaseV4Ts.reduce((s, v) => s + v, 0) / phaseV4Ts.length;
    add(
      "OVERALL_T_NOT_PHASE_AVG",
      "info",
      `Genel T(V4)=${overallV4.timing.T}; faz T(V4) ortalaması=${round(avg, 1)}. Genel T faz ortalaması değildir (tüm oturum ham verisinden).`
    );
  }

  const distractor = auditDistractors(logs, profile, age, tl, locale);
  for (const item of distractor.items) {
    for (const issue of item.issues) add(issue.code, issue.severity, `${item.title}: ${issue.message}`);
  }

  const classification = auditClassification(logs, lateMs, tl, pdfScores);
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

  const failCount = checks.filter((c) => c.severity === "fail").length;
  return {
    sessionId: detail.id,
    name: detail.participant_name || "—",
    age,
    profileKey,
    createdAt: detail.created_at,
    algorithmVersion: ACTIVE_REPORT_SCORING_VERSION,
    lateMs,
    passFail: failCount ? "FAIL" : "PASS",
    failCount,
    infoCount: checks.filter((c) => c.severity === "info").length,
    checks,
    overall: {
      v4: overallV4,
      v1: overallV1,
      pdfScores,
      storedScores
    },
    phases,
    distractor,
    classification,
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
          checks: [{ code: "NO_DETAIL", severity: "fail", message: "Oturum detayı yok." }]
        });
        continue;
      }
      out.push(auditSession(detail, timeline ?? [], locale));
    } catch (e) {
      out.push({
        sessionId: s.id,
        name: s.participant_name,
        passFail: "FAIL",
        checks: [{ code: "AUDIT_ERROR", severity: "fail", message: e.message || String(e) }]
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
