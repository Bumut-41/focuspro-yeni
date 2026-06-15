import { getStrings } from "./i18n/index.js";

function clamp(x, a = 0, b = 100) {
  return Math.max(a, Math.min(b, x));
}
function safeDiv(n, d) {
  return !d ? 0 : n / d;
}
function mean(a) {
  return a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
}

/** Yaşa göre T referans tepki süresi (ms). */
export function referenceRtMs(age) {
  const n = Number(age);
  if (!Number.isFinite(n)) return 650;
  if (n >= 18) return 650;
  if (n >= 13) return 750;
  if (n >= 10) return 850;
  if (n >= 7) return 950;
  return 950;
}

function normalizeMetricOptions(third, fourth) {
  if (Array.isArray(third)) {
    return { pressTimeline: third, age: fourth ?? null, locale: "tr" };
  }
  if (third && typeof third === "object") {
    return {
      pressTimeline: third.pressTimeline ?? [],
      age: third.age ?? null,
      locale: third.locale ?? "tr"
    };
  }
  return { pressTimeline: [], age: fourth ?? null, locale: "tr" };
}

/** Deneme düzeyinde davranış sayımları. */
export function countTrialBehaviors(logs, lateMs) {
  const targets = logs.filter((t) => t.isTarget);
  const nonT = logs.filter((t) => !t.isTarget);
  const hits = targets.filter((t) => t.responded && t.reactionTime > 0 && t.reactionTime <= lateMs);
  const omissions = targets.filter((t) => !t.responded);
  const late = targets.filter((t) => t.responded && t.reactionTime > lateMs);
  const falseAlarms = nonT.filter((t) => t.responded);
  const correctRejects = nonT.filter((t) => !t.responded);
  const multiPress = logs.filter((t) => (t.responseCount ?? 0) > 1);

  return {
    hits: hits.length,
    omissions: omissions.length,
    late: late.length,
    falseAlarms: falseAlarms.length,
    correctRejects: correctRejects.length,
    multiPress: multiPress.length,
    targets: targets.length,
    nonTargets: nonT.length,
    totalTrials: logs.length
  };
}

export function countIdlePresses(pressTimeline = []) {
  return pressTimeline.filter((p) => p.errorType === "idle").length;
}

/** fazladan_tiklama ve toplam_tepki (H endeksi). */
export function countHyperPressStats(logs, pressTimeline = []) {
  if (pressTimeline.length) {
    const fazladan = pressTimeline.filter((p) => p.errorType === "multi" || p.errorType === "idle").length;
    return {
      extraPresses: fazladan,
      totalPresses: pressTimeline.length,
      hyperRate: safeDiv(fazladan, pressTimeline.length) * 100
    };
  }

  let extraFromTrials = 0;
  let totalFromTrials = 0;
  for (const t of logs) {
    const rc = t.responseCount ?? 0;
    totalFromTrials += rc;
    if (rc > 1) extraFromTrials += rc - 1;
  }
  const idle = countIdlePresses(pressTimeline);
  const extraPresses = extraFromTrials + idle;
  const totalPresses = totalFromTrials + idle;
  return {
    extraPresses,
    totalPresses,
    hyperRate: safeDiv(extraPresses, totalPresses) * 100
  };
}

/** A/T/I/H — kullanıcı spec formülleri. */
export function computeIndexScoresFromData(behaviors, rts, age, logs, pressTimeline = []) {
  if (!behaviors.totalTrials) {
    return {
      attention: 0,
      attentionRaw: 0,
      timing: 0,
      impulsivity: 0,
      impulsivityRate: 0,
      hyperactivity: 0,
      hyperRate: 0,
      overall: 0
    };
  }

  const omissionRatio = safeDiv(behaviors.omissions, behaviors.targets);
  const lateRatio = safeDiv(behaviors.late, behaviors.targets);
  const missRatio = safeDiv(behaviors.omissions + behaviors.late, behaviors.targets);
  const falseOnTotalRatio = safeDiv(behaviors.falseAlarms, behaviors.totalTrials);
  const attentionRaw = safeDiv(behaviors.hits, behaviors.targets) * 100;
  // Geç yanıtlar da kaçırma sayılır — aksi halde basmama/geç basma iyi skor üretir.
  const attention = clamp(100 - missRatio * 70 - falseOnTotalRatio * 30);

  const rtMean = mean(rts);
  const refRt = referenceRtMs(age);
  const timing = rtMean > 0 ? clamp((refRt / rtMean) * 100) : 0;

  const impulsivityRate = safeDiv(behaviors.falseAlarms, behaviors.nonTargets) * 100;
  const hyper = countHyperPressStats(logs, pressTimeline);
  const totalResponses = behaviors.hits + behaviors.late + behaviors.falseAlarms;
  const engaged = totalResponses > 0 || hyper.totalPresses > 0;

  let impulsivity = clamp(100 - impulsivityRate * 5);
  let hyperactivity = clamp(100 - hyper.hyperRate * 4);
  if (!engaged && behaviors.targets >= 5) {
    impulsivity = 0;
    hyperactivity = 0;
  }

  let overall = clamp(attention * 0.35 + timing * 0.3 + impulsivity * 0.2 + hyperactivity * 0.15);
  if (!engaged && behaviors.targets >= 5) {
    overall = Math.min(overall, 25);
  } else if (behaviors.targets > 0 && behaviors.hits === 0) {
    overall = Math.min(overall, 35);
  } else if (attentionRaw < 25) {
    overall = Math.min(overall, 45);
  }

  return {
    attention: Math.round(attention),
    attentionRaw: Math.round(attentionRaw),
    timing: Math.round(timing),
    impulsivity: Math.round(impulsivity),
    impulsivityRate: Number(impulsivityRate.toFixed(1)),
    hyperactivity: Math.round(hyperactivity),
    hyperRate: Number(hyper.hyperRate.toFixed(1)),
    overall: Math.round(overall)
  };
}

/** Go/No-Go deneme logundan skorlar. */
export function computeMetrics(logs, lateMs, metricOptions = null, ageArg = null) {
  const { pressTimeline, age, locale } = normalizeMetricOptions(metricOptions, ageArg);
  const m = getStrings(locale).metrics;

  if (!logs.length) {
    return {
      totalTrials: 0,
      accuracy: 0,
      avgReaction: 0,
      medianReaction: 0,
      rtStd: 0,
      omissionRate: 0,
      falseAlarmRate: 0,
      lateRate: 0,
      multiPressRate: 0,
      idlePresses: 0,
      idlePressRate: 0,
      attentionRaw: 0,
      impulsivityRate: 0,
      hyperRate: 0,
      referenceRtMs: referenceRtMs(age),
      attentionScore: 0,
      impulseScore: 0,
      speedScore: 0,
      consistencyScore: 0,
      overallScore: 0,
      flags: [m.insufficientData]
    };
  }

  const behaviors = countTrialBehaviors(logs, lateMs);
  const rts = logs
    .filter((t) => t.isTarget && t.responded && t.reactionTime > 0 && t.reactionTime <= lateMs)
    .map((t) => t.reactionTime);

  const indices = computeIndexScoresFromData(behaviors, rts, age, logs, pressTimeline);
  const hyper = countHyperPressStats(logs, pressTimeline);
  const idlePresses = countIdlePresses(pressTimeline);
  const engaged =
    behaviors.hits + behaviors.late + behaviors.falseAlarms > 0 || hyper.totalPresses > 0;

  const omissionR = safeDiv(behaviors.omissions, behaviors.targets) * 100;
  const faR = safeDiv(behaviors.falseAlarms, behaviors.nonTargets) * 100;
  const lateR = safeDiv(behaviors.late, behaviors.targets) * 100;
  const multiR = safeDiv(behaviors.multiPress, behaviors.totalTrials) * 100;
  const acc = Math.round(
    safeDiv(behaviors.hits, behaviors.targets) * 80 + safeDiv(behaviors.correctRejects, behaviors.nonTargets) * 20
  );

  const flags = [];
  if (!engaged && behaviors.targets >= 5) flags.push(m.flagNoEngagement);
  if (indices.attention < 60) flags.push(m.flagAttentionPoor);
  else if (indices.attention < 70) flags.push(m.flagAttentionLow);
  if (indices.timing < 70) flags.push(m.flagTiming);
  if (lateR >= 25) flags.push(m.flagLate);
  if (indices.impulsivity < 60) flags.push(m.flagImpulseMarked);
  else if (indices.impulsivity < 75) flags.push(m.flagImpulseMild);
  if (indices.hyperactivity < 60) flags.push(m.flagHyper);
  if (omissionR >= 25) flags.push(m.flagOmission);
  if (behaviors.hits === 0 && behaviors.targets >= 10) flags.push(m.flagNoHits);
  if (faR >= 20) flags.push(m.flagFalseAlarm);
  if (multiR >= 10) flags.push(m.flagMulti);
  if (idlePresses >= 6) flags.push(m.flagIdle);

  return {
    totalTrials: behaviors.totalTrials,
    accuracy: Math.round(acc),
    avgReaction: Math.round(mean(rts)),
    medianReaction: Math.round(mean(rts)),
    rtStd: 0,
    omissionRate: omissionR,
    falseAlarmRate: faR,
    lateRate: lateR,
    multiPressRate: multiR,
    idlePresses,
    idlePressRate: safeDiv(idlePresses, behaviors.totalTrials) * 100,
    extraPresses: hyper.extraPresses,
    totalPresses: hyper.totalPresses,
    attentionRaw: indices.attentionRaw,
    impulsivityRate: indices.impulsivityRate,
    hyperRate: indices.hyperRate,
    referenceRtMs: referenceRtMs(age),
    attentionScore: indices.attention,
    impulseScore: indices.impulsivity,
    speedScore: indices.timing,
    consistencyScore: indices.hyperactivity,
    overallScore: indices.overall,
    flags,
    behaviors
  };
}

export function scoreSeries(logs, lateMs, metricOptions = null) {
  const { pressTimeline, age } = normalizeMetricOptions(metricOptions);
  const att = [];
  const imp = [];
  const spd = [];
  const hyp = [];
  for (let i = 0; i < logs.length; i++) {
    const maxTrial = logs[i].trialNumber ?? i + 1;
    const tlSlice = pressTimeline.filter(
      (p) => p.trialNumber == null || p.trialNumber <= maxTrial
    );
    const m = computeMetrics(logs.slice(0, i + 1), lateMs, { pressTimeline: tlSlice, age });
    att.push(m.attentionScore);
    imp.push(m.impulseScore);
    spd.push(m.speedScore);
    hyp.push(m.consistencyScore);
  }
  return { att, imp, spd, hyp };
}

export function getAttentionLevelText(score, locale = "tr") {
  const m = getStrings(locale).metrics;
  if (score >= 90) return m.attentionVeryGood;
  if (score >= 80) return m.attentionGood;
  if (score >= 70) return m.attentionAverage;
  if (score >= 60) return m.attentionLow;
  return m.attentionPoor;
}

export function getImpulsivityLevelText(score, locale = "tr") {
  const m = getStrings(locale).metrics;
  if (score >= 90) return m.impulseGood;
  if (score >= 75) return m.impulseOk;
  if (score >= 60) return m.impulseMild;
  if (score >= 40) return m.impulseMarked;
  return m.impulseSevere;
}

export function getOverallRiskText(score, locale = "tr") {
  const m = getStrings(locale).metrics;
  if (score >= 85) return m.riskStrong;
  if (score >= 70) return m.riskNormal;
  if (score >= 55) return m.riskAreas;
  if (score >= 40) return m.riskMarked;
  return m.riskHigh;
}

export function riskLabel(metrics, locale = "tr") {
  return getOverallRiskText(metrics.overallScore, locale);
}

export function summaryText(metrics, profileLabel, locale = "tr") {
  const m = getStrings(locale).metrics;
  const b = metrics.behaviors;
  const behaviorLine = b
    ? m.summaryBehavior
        .replace("{{hits}}", b.hits)
        .replace("{{omissions}}", b.omissions)
        .replace("{{late}}", b.late)
        .replace("{{falseAlarms}}", b.falseAlarms)
        .replace("{{multiPress}}", b.multiPress)
        .replace("{{correctRejects}}", b.correctRejects)
        .replace("{{idle}}", metrics.idlePresses ?? 0)
    : "";
  return [
    m.summaryIntro.replace("{{trials}}", metrics.totalTrials).replace("{{profile}}", profileLabel),
    m.summaryScores
      .replace("{{overall}}", metrics.overallScore)
      .replace("{{risk}}", getOverallRiskText(metrics.overallScore, locale))
      .replace("{{attention}}", metrics.attentionScore)
      .replace("{{attentionText}}", getAttentionLevelText(metrics.attentionScore, locale))
      .replace("{{timing}}", metrics.speedScore)
      .replace("{{impulse}}", metrics.impulseScore)
      .replace("{{impulseText}}", getImpulsivityLevelText(metrics.impulseScore, locale))
      .replace("{{hyper}}", metrics.consistencyScore),
    behaviorLine,
    m.summaryRt
      .replace("{{refRt}}", metrics.referenceRtMs)
      .replace("{{avgRt}}", metrics.avgReaction),
    metrics.flags.length
      ? m.summaryFlags.replace("{{flags}}", metrics.flags.join("; "))
      : m.summaryNoFlags,
    m.disclaimer
  ]
    .filter(Boolean)
    .join(" ");
}
