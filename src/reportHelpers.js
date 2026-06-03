import { computeMetrics, riskLabel } from "./metrics.js";

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

/** Genişletilmiş metrikler (d-prime, ayrıntılı sayımlar). */
export function computeDetailedMetrics(logs, lateMs) {
  const base = computeMetrics(logs, lateMs);
  const targets = logs.filter((t) => t.isTarget);
  const nonT = logs.filter((t) => !t.isTarget);
  const hits = targets.filter((t) => t.responded && t.reactionTime <= lateMs);
  const allTargetResp = targets.filter((t) => t.responded);
  const omissions = targets.filter((t) => !t.responded);
  const late = targets.filter((t) => t.responded && t.reactionTime > lateMs);
  const fa = nonT.filter((t) => t.responded);
  const correctRej = nonT.filter((t) => !t.responded);
  const multi = logs.filter((t) => t.responseCount > 1);
  const targetRespRate = targets.length ? allTargetResp.length / targets.length : 0;
  const faRate = nonT.length ? fa.length / nonT.length : 0;
  const dPrime =
    inverseNormalCDF(correctedRate(targetRespRate, targets.length)) -
    inverseNormalCDF(correctedRate(faRate, nonT.length));

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
    hitRate: targets.length ? (hits.length / targets.length) * 100 : 0,
    dPrime
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
  return 4;
}

export function getLevelText(score) {
  const level = getLevel(score);
  if (level === 1) return "İyi Performans";
  if (level === 2) return "Standart Performans";
  if (level === 3) return "Düşük Performans";
  return "Performansta Zorluk";
}

export function getScoreColor(score) {
  const level = getLevel(score);
  if (level === 1) return "#0d9488";
  if (level === 2) return "#65a30d";
  if (level === 3) return "#f59e0b";
  return "#dc2626";
}

export function pseudoZScore(score) {
  return Number(((score - 75) / 12).toFixed(2));
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
  if (s.includes("sessiz + sesli") || s.includes("kombine")) {
    return "Birleşik çeldiriciler altında dikkat ve dürtü kontrolü zorlanmış olabilir.";
  }
  if (s.includes("sessiz gif")) return "Görsel çeldiriciler altında dikkat performansı etkilenmiş olabilir.";
  if (s.includes("sadece ses")) return "İşitsel çeldiriciler altında performans etkilenmiş olabilir.";
  if (s.includes("12") || s.includes("13") || s.includes("14") || s.includes("15")) {
    return "Testin son bölümünde yorgunluk etkisi görülebilir.";
  }
  return "Bu fazda performansta düşüş izlenmiştir.";
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

export function getSectionSummaries(logs, profile) {
  return profile.phases.map((phase) => {
    const list = logs.filter((t) => t.section === phase.name);
    const m = computeDetailedMetrics(list, profile.lateResponseMs);
    const sc = getScores(m);
    return {
      section: phase.name,
      shortLabel: phase.name.replace(/^[^—]+—\s*/, ""),
      totalTrials: m.totalTrials,
      attentionScore: sc.attention,
      timingScore: sc.timing,
      impulsivityScore: sc.impulsivity,
      hyperactivityScore: sc.hyperactivity,
      accuracy: m.accuracy,
      omissionRate: m.omissionRate,
      falseAlarmRate: m.falseAlarmRate,
      medianReaction: m.medianReaction,
      comment: getPhaseComment(phase.name, m.overallScore)
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

/** Dört endeks × çeldirici özeti (F.docx tablosu). */
export function getDistractorSummaryMatrix(logs, profile) {
  const late = profile.lateResponseMs;
  const baseline = phaseLogs(
    logs,
    (s) => /0–1|1–2|2–3|0-1|1-2|2-3/.test(s) && !s.includes("gif") && !s.includes("ses")
  );
  const closing = phaseLogs(logs, (s) => /1[12]-1[35]|12–|13–|14–|15–/.test(s));
  const visual = phaseLogs(logs, (s) => s.includes("sessiz gif"));
  const auditory = phaseLogs(logs, (s) => s.includes("sadece ses"));
  const combined = phaseLogs(logs, (s) => s.includes("sessiz + sesli") || s.includes("sesli gif"));
  const smallD = [...visual.slice(0, Math.ceil(visual.length / 2)), ...auditory.slice(0, Math.ceil(auditory.length / 2))];
  const largeD = [...visual.slice(Math.ceil(visual.length / 2)), ...auditory.slice(Math.ceil(auditory.length / 2)), ...combined];

  const scoreOf = (list) => (list.length ? getScores(computeDetailedMetrics(list, late)) : null);

  const baseSc = scoreOf(baseline);
  const closeSc = scoreOf(closing);
  const visSc = scoreOf(visual);
  const audSc = scoreOf(auditory);
  const combSc = scoreOf(combined);
  const smallSc = scoreOf(smallD);
  const largeSc = scoreOf(largeD);

  const deltaLabel = (a, b, key) => {
    if (!a || !b) return { text: "Değişiklik yok", color: "#64748b" };
    const diff = b[key] - a[key];
    if (Math.abs(diff) < 5) return { text: "Değişiklik yok", color: "#64748b" };
    if (diff > 0) return { text: "Puanda Artma (Düzelme)", color: "#16a34a" };
    return { text: "Puanda Azalma (Bozulma)", color: "#dc2626" };
  };

  const rows = [
    {
      name: "Sürdürülebilir performans",
      A: deltaLabel(baseSc, closeSc, "attention"),
      T: deltaLabel(baseSc, closeSc, "timing"),
      I: deltaLabel(baseSc, closeSc, "impulsivity"),
      H: deltaLabel(baseSc, closeSc, "hyperactivity")
    },
    {
      name: "Görsel",
      A: deltaLabel(baseSc, visSc, "attention"),
      T: deltaLabel(baseSc, visSc, "timing"),
      I: deltaLabel(baseSc, visSc, "impulsivity"),
      H: deltaLabel(baseSc, visSc, "hyperactivity")
    },
    {
      name: "İşitsel",
      A: deltaLabel(baseSc, audSc, "attention"),
      T: deltaLabel(baseSc, audSc, "timing"),
      I: deltaLabel(baseSc, audSc, "impulsivity"),
      H: deltaLabel(baseSc, audSc, "hyperactivity")
    },
    {
      name: "Kombine",
      A: deltaLabel(baseSc, combSc, "attention"),
      T: deltaLabel(baseSc, combSc, "timing"),
      I: deltaLabel(baseSc, combSc, "impulsivity"),
      H: deltaLabel(baseSc, combSc, "hyperactivity")
    },
    {
      name: "Çeldirici yükü",
      A: deltaLabel(smallSc, largeSc, "attention"),
      T: deltaLabel(smallSc, largeSc, "timing"),
      I: deltaLabel(smallSc, largeSc, "impulsivity"),
      H: deltaLabel(smallSc, largeSc, "hyperactivity")
    }
  ];

  return rows;
}

export function buildProfessionalSummary(scores, metrics, profile) {
  const risk = riskLabel(metrics);
  return [
    `Test ${metrics.totalTrials} deneme ile tamamlandı. Profil: ${profile.label}. Toplam süre yaklaşık ${formatDurationSeconds(profile.durationMs)} saniyedir.`,
    `Genel performans ${scores.overall}/100; A-Dikkat ${scores.attention}, T-Zamanlama ${scores.timing}, I-Dürtüsellik ${scores.impulsivity}, H-Hiper-reaktivite ${scores.hyperactivity}. Ön değerlendirme risk düzeyi: ${risk}.`,
    `Doğruluk %${metrics.accuracy}, hit oranı ${formatRate(metrics.hitRate)}, omission ${formatRate(metrics.omissionRate)}, false alarm ${formatRate(metrics.falseAlarmRate)}.`,
    `d-prime ${metrics.dPrime.toFixed(2)} — hedef / hedef dışı ayırt etme göstergesi.`,
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
  ["A — Dikkat", "Doğru yanıt verme ve odaklanma becerisi"],
  ["T — Zamanlama", "Hızlı ve doğru yanıt verme yeteneği"],
  ["I — Dürtüsellik", "Durumu değerlendirmeden aceleci tepki verme eğilimi"],
  ["H — Hiper-reaktivite", "Motor tepkilerin düzenlenmesinde zorluk"]
];

export const NORM_LEVELS = [
  { level: 1, label: "İyi Performans", color: "#0d9488" },
  { level: 2, label: "Standart Performans", color: "#86efac" },
  { level: 3, label: "Düşük Performans", color: "#f59e0b" },
  { level: 4, label: "Performansta Zorluk", color: "#dc2626" }
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
