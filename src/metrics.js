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
    return { pressTimeline: third, age: fourth ?? null };
  }
  if (third && typeof third === "object") {
    return { pressTimeline: third.pressTimeline ?? [], age: third.age ?? null };
  }
  return { pressTimeline: [], age: fourth ?? null };
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
  const falseOnTotalRatio = safeDiv(behaviors.falseAlarms, behaviors.totalTrials);
  const attentionRaw = safeDiv(behaviors.hits, behaviors.targets) * 100;
  const attention = clamp(100 - omissionRatio * 70 - falseOnTotalRatio * 30);

  const rtMean = mean(rts);
  const refRt = referenceRtMs(age);
  const timing = rtMean > 0 ? clamp((refRt / rtMean) * 100) : 0;

  const impulsivityRate = safeDiv(behaviors.falseAlarms, behaviors.nonTargets) * 100;
  const impulsivity = clamp(100 - impulsivityRate * 5);

  const { hyperRate } = countHyperPressStats(logs, pressTimeline);
  const hyperactivity = clamp(100 - hyperRate * 4);

  const overall = clamp(attention * 0.35 + timing * 0.3 + impulsivity * 0.2 + hyperactivity * 0.15);

  return {
    attention: Math.round(attention),
    attentionRaw: Math.round(attentionRaw),
    timing: Math.round(timing),
    impulsivity: Math.round(impulsivity),
    impulsivityRate: Number(impulsivityRate.toFixed(1)),
    hyperactivity: Math.round(hyperactivity),
    hyperRate: Number(hyperRate.toFixed(1)),
    overall: Math.round(overall)
  };
}

/** Go/No-Go deneme logundan skorlar. */
export function computeMetrics(logs, lateMs, metricOptions = null, ageArg = null) {
  const { pressTimeline, age } = normalizeMetricOptions(metricOptions, ageArg);

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
      flags: ["Yetersiz veri"]
    };
  }

  const behaviors = countTrialBehaviors(logs, lateMs);
  const rts = logs
    .filter((t) => t.isTarget && t.responded && t.reactionTime > 0 && t.reactionTime <= lateMs)
    .map((t) => t.reactionTime);

  const indices = computeIndexScoresFromData(behaviors, rts, age, logs, pressTimeline);
  const hyper = countHyperPressStats(logs, pressTimeline);
  const idlePresses = countIdlePresses(pressTimeline);

  const omissionR = safeDiv(behaviors.omissions, behaviors.targets) * 100;
  const faR = safeDiv(behaviors.falseAlarms, behaviors.nonTargets) * 100;
  const lateR = safeDiv(behaviors.late, behaviors.targets) * 100;
  const multiR = safeDiv(behaviors.multiPress, behaviors.totalTrials) * 100;
  const acc = safeDiv(behaviors.hits + behaviors.correctRejects, behaviors.totalTrials) * 100;

  const flags = [];
  if (indices.attention < 60) flags.push("Belirgin dikkat güçlüğü");
  else if (indices.attention < 70) flags.push("Düşük dikkat performansı");
  if (indices.timing < 70) flags.push("Zamanlama / yavaş tepki");
  if (indices.impulsivity < 60) flags.push("Belirgin dürtüsellik");
  else if (indices.impulsivity < 75) flags.push("Hafif dürtüsellik");
  if (indices.hyperactivity < 60) flags.push("Belirgin hiperaktivite göstergesi");
  if (omissionR >= 25) flags.push("Yüksek kaçırma oranı");
  if (faR >= 20) flags.push("Yüksek yanlış basış oranı");
  if (multiR >= 10) flags.push("Çoklu basma");
  if (idlePresses >= 6) flags.push("Boş ekranda basış");

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
    const m = computeMetrics(logs.slice(0, i + 1), lateMs, { pressTimeline: pressTimeline.slice(0), age });
    att.push(m.attentionScore);
    imp.push(m.impulseScore);
    spd.push(m.speedScore);
    hyp.push(m.consistencyScore);
  }
  return { att, imp, spd, hyp };
}

export function getAttentionLevelText(score) {
  if (score >= 90) return "Çok iyi";
  if (score >= 80) return "İyi";
  if (score >= 70) return "Ortalama";
  if (score >= 60) return "Düşük";
  return "Belirgin dikkat güçlüğü";
}

export function getImpulsivityLevelText(score) {
  if (score >= 90) return "İyi dürtü kontrolü";
  if (score >= 75) return "Kabul edilebilir";
  if (score >= 60) return "Hafif dürtüsellik";
  if (score >= 40) return "Belirgin dürtüsellik";
  return "Şiddetli dürtüsellik";
}

export function getOverallRiskText(score) {
  if (score >= 85) return "Güçlü performans";
  if (score >= 70) return "Normal / izlenebilir";
  if (score >= 55) return "Riskli alanlar var";
  if (score >= 40) return "Belirgin güçlük";
  return "Yüksek risk";
}

export function riskLabel(m) {
  return getOverallRiskText(m.overallScore);
}

export function summaryText(m, profileLabel) {
  const b = m.behaviors;
  const behaviorLine = b
    ? `Davranış özeti: isabet ${b.hits}, kaçırma ${b.omissions}, geç ${b.late}, yanlış basış ${b.falseAlarms}, çoklu ${b.multiPress}, doğru ret ${b.correctRejects}, boş ekran basışı ${m.idlePresses ?? 0}.`
    : "";
  return [
    `Test ${m.totalTrials} deneme ile tamamlandı. Profil: ${profileLabel}.`,
    `Genel skor ${m.overallScore}/100 (${getOverallRiskText(m.overallScore)}). A-Dikkat ${m.attentionScore} (${getAttentionLevelText(m.attentionScore)}), T-Zamanlama ${m.speedScore}, I-Dürtüsellik ${m.impulseScore} (${getImpulsivityLevelText(m.impulseScore)}), H-Hiper-reaktivite ${m.consistencyScore}.`,
    behaviorLine,
    `Referans RT ${m.referenceRtMs} ms, ortalama doğru tepki ${m.avgReaction} ms.`,
    m.flags.length ? `Öne çıkanlar: ${m.flags.join("; ")}.` : "Belirgin uyarı yok.",
    "Bu yazılım tanı koymaz; yalnızca ön değerlendirme içindir."
  ]
    .filter(Boolean)
    .join(" ");
}
