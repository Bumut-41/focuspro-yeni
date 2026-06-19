import {
  computeDetailedMetrics,
  computeSustainabilityIndex,
  formatDurationSeconds,
  getScores
} from "../reportHelpers.js";
import { buildReportPhaseBuckets, logsForBucket } from "./phaseBuckets.js";
import { getAttentionLevelText, getImpulsivityLevelText, getOverallRiskText, riskLabel } from "../metrics.js";

function clamp(x, a = 0, b = 100) {
  return Math.max(a, Math.min(b, x));
}

function mean(a) {
  return a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
}

function phaseLogs(logs, matcher) {
  return logs.filter((t) => matcher((t.section || "").toLowerCase()));
}

function indexLevelLabel(score) {
  if (score >= 90) return "Çok iyi";
  if (score >= 80) return "İyi düzey";
  if (score >= 70) return "Ortalama";
  if (score >= 60) return "Düşük";
  return "Belirgin güçlük";
}

function validityBand(score, hasCritical) {
  if (hasCritical || score < 40) {
    return { key: "invalid", label: "Geçersiz", emoji: "🔴", color: "#dc2626", fill: "#fef2f2" };
  }
  if (score < 60) {
    return { key: "low", label: "Düşük güvenilirlik", emoji: "🟠", color: "#ea580c", fill: "#fff7ed" };
  }
  if (score < 75) {
    return { key: "caution", label: "Dikkatli yorumlanmalı", emoji: "🟡", color: "#ca8a04", fill: "#fefce8" };
  }
  if (score < 90) {
    return { key: "acceptable", label: "Kabul edilebilir", emoji: "🟢", color: "#16a34a", fill: "#ecfdf5" };
  }
  return { key: "valid", label: "Geçerli", emoji: "🟢", color: "#059669", fill: "#ecfdf5" };
}

/** Seviye 1–3 geçerlilik + Geçerlilik Endeksi (0–100). */
export function computeTestValidity(logs, metrics, profile, pressTimeline = [], age = null) {
  const late = profile.lateResponseMs;
  const level1Critical = [];
  const level2Warnings = [];
  const level3Consistency = [];

  const targetHits = logs.filter((t) => t.isTarget && t.responded && t.reactionTime > 0);
  const fastHits = targetHits.filter((t) => t.reactionTime < 150);
  const fastRate = targetHits.length ? (fastHits.length / targetHits.length) * 100 : 0;

  if (metrics.avgReaction > 0 && metrics.avgReaction < 150) {
    level1Critical.push("Ortalama tepki süresi 150 ms altında (fizyolojik olarak şüpheli).");
  } else if (targetHits.length >= 5 && fastRate >= 25) {
    level1Critical.push(`Tepkilerin %${fastRate.toFixed(0)}'i 150 ms altında (şüpheli hız).`);
  }

  if (metrics.omissionRate > 60) {
    level1Critical.push(`İhmal oranı %${metrics.omissionRate.toFixed(1)} (göreve katılım çok düşük).`);
  }

  if (metrics.rtStd > 0 && metrics.rtStd < 20 && targetHits.length >= 5) {
    level1Critical.push(`RT standart sapması ${metrics.rtStd} ms (robotik performans olasılığı).`);
  }

  if (metrics.multiPressRate > 50) {
    level1Critical.push(`Çoklu basış oranı %${metrics.multiPressRate.toFixed(1)} (yönergeye uyumsuzluk).`);
  }

  if (metrics.omissionRate >= 40 && metrics.omissionRate <= 60) {
    level2Warnings.push(`İhmal oranı %${metrics.omissionRate.toFixed(1)} (düşük güvenilirlik aralığı).`);
  }
  if (metrics.commissionRate >= 25) {
    level2Warnings.push(`Commission oranı %${metrics.commissionRate.toFixed(1)} (yüksek hedef dışı tepki).`);
  }
  if (metrics.rtStd > 350) {
    level2Warnings.push(`RT standart sapması ${metrics.rtStd} ms (aşırı değişkenlik).`);
  }
  if (metrics.multiPressRate >= 20 && metrics.multiPressRate <= 50) {
    level2Warnings.push(`Çoklu basış oranı %${metrics.multiPressRate.toFixed(1)}.`);
  }

  const buckets = buildReportPhaseBuckets(profile);
  const scoreOfBucket = (bucket, key) => {
    const list = logsForBucket(logs, bucket);
    if (!list.length) return null;
    const tl = (pressTimeline ?? []).filter((p) => p.section && bucket.phaseNames?.includes(p.section));
    return getScores(computeDetailedMetrics(list, late, { pressTimeline: tl, age }))[key];
  };

  const firstA = buckets.slice(0, 2).map((b) => scoreOfBucket(b, "attention")).filter((v) => v != null);
  const lastA = buckets.slice(-2).map((b) => scoreOfBucket(b, "attention")).filter((v) => v != null);
  if (firstA.length && lastA.length) {
    const firstAvg = mean(firstA);
    const lastAvg = mean(lastA);
    const deltaA = lastAvg - firstAvg;
    if (deltaA <= -50) {
      level3Consistency.push(
        `Dikkat (A) fazlar arası düşüş: başlangıç ${Math.round(firstAvg)}, kapanış ${Math.round(lastAvg)} (fark ${Math.round(deltaA)} puan).`
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
        `RT değişimi: başlangıç ${Math.round(startRt)} ms, kapanış ${Math.round(endRt)} ms (+${Math.round(rtDelta)} ms).`
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
    deductions.push("Şüpheli hızlı tepkiler (−40)");
  }
  if (metrics.omissionRate > 40) {
    score -= 20;
    deductions.push("İhmal > %40 (−20)");
  }
  if (metrics.multiPressRate > 20) {
    score -= 15;
    deductions.push("Çoklu basış > %20 (−15)");
  }
  if (metrics.rtStd > 0 && metrics.rtStd < 20 && targetHits.length >= 5) {
    score -= 15;
    deductions.push("RT SD < 20 ms (−15)");
  }
  if (metrics.commissionRate > 25) {
    score -= 10;
    deductions.push("Commission > %25 (−10)");
  }
  score = clamp(Math.round(score));

  const hasCritical = level1Critical.length > 0;
  const band = validityBand(score, hasCritical);
  const isInvalid = hasCritical || score < 40;

  const checklist = [];
  if (metrics.omissionRate <= 40) checklist.push("✓ Göreve katılım yeterli");
  else checklist.push("⚠ Göreve katılım sınırlı");

  if (metrics.avgReaction >= 150 && metrics.avgReaction <= 1200 && fastRate < 15) {
    checklist.push("✓ Tepki süreleri beklenen aralıkta");
  } else {
    checklist.push("⚠ Tepki süreleri şüpheli veya aşırı değişken");
  }

  if (metrics.rtStd >= 20 && metrics.rtStd <= 350) {
    checklist.push("✓ Yanıt örüntüsü tutarlı");
  } else {
    checklist.push("⚠ Yanıt örüntüsü tutarsız");
  }

  if (!isInvalid && score >= 75) {
    checklist.push("✓ Sonuçlar klinik yorumlama için uygundur");
  } else if (!isInvalid) {
    checklist.push("⚠ Sonuçlar dikkatli yorumlanmalıdır");
  } else {
    checklist.push("✗ Sonuçlar yorumlanmamalıdır");
  }

  let summary;
  if (isInvalid) {
    summary = "TEST GEÇERSİZ — Kritik geçersizlik bulguları nedeniyle rapor klinik yorum için uygun değildir.";
  } else if (score >= 90) {
    summary = "Test sonuçları geçerli kabul edilmiş ve yorumlamaya uygun bulunmuştur.";
  } else if (score >= 75) {
    summary = "Test sonuçları kabul edilebilir düzeydedir; bazı faktörler yorumu etkileyebilir.";
  } else if (score >= 60) {
    summary = "Sonuçlar yorumlanabilir ancak test performansını etkileyebilecek faktörler gözlenmiştir.";
  } else {
    summary = "Düşük güvenilirlik — sonuçlar dikkatli ve destekleyici verilerle birlikte yorumlanmalıdır.";
  }

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

function distractorPhaseScore(logs, profile, age, pressTimeline, matcher) {
  const list = phaseLogs(logs, matcher);
  if (!list.length) return null;
  const late = profile.lateResponseMs;
  const tl = pressTimeline ?? [];
  return getScores(computeDetailedMetrics(list, late, { pressTimeline: tl, age }));
}

/** Görsel / işitsel / kombine — anlaşılır çeldirici analizi. */
export function buildDistractorAnalysisFriendly(logs, profile, age = null, pressTimeline = []) {
  const baseline = distractorPhaseScore(
    logs,
    profile,
    age,
    pressTimeline,
    (s) => /0–1|1–2|2–3|0-1|1-2|2-3/.test(s) && !s.includes("gif") && !s.includes("ses")
  );
  const types = [
    {
      key: "visual",
      title: "Görsel Çeldiriciler",
      scores: distractorPhaseScore(logs, profile, age, pressTimeline, (s) => s.includes("sessiz gif") && !s.includes("sesli"))
    },
    {
      key: "auditory",
      title: "İşitsel Çeldiriciler",
      scores: distractorPhaseScore(logs, profile, age, pressTimeline, (s) => s.includes("sadece ses"))
    },
    {
      key: "combined",
      title: "Kombine Çeldiriciler",
      scores: distractorPhaseScore(
        logs,
        profile,
        age,
        pressTimeline,
        (s) => s.includes("sessiz + sesli") || s.includes("sesli gif")
      )
    }
  ];

  const analyze = (title, distScores) => {
    if (!distScores || !baseline) {
      return { title, emoji: "—", label: "Veri yok", comment: "Bu koşulda yeterli deneme bulunmamaktadır." };
    }
    const baseOverall = baseline.overall;
    const distOverall = distScores.overall;
    const pct = baseOverall > 0 ? ((baseOverall - distOverall) / baseOverall) * 100 : 0;

    if (pct <= 5) {
      return {
        title,
        emoji: "🟢",
        label: "Performans Korundu",
        comment:
          title.includes("Görsel")
            ? "Katılımcının görsel dikkat dağıtıcılardan belirgin şekilde etkilenmediği görülmüştür."
            : title.includes("İşitsel")
              ? "İşitsel uyaranlar sırasında performansta anlamlı düşüş gözlenmemiştir."
              : "Görsel ve işitsel çeldiricilerin birlikte sunulduğu koşullarda performans genel olarak korunmuştur."
      };
    }
    if (pct <= 15) {
      return {
        title,
        emoji: "🟡",
        label: "Hafif Etkilenme",
        comment: `${title} altında performansta hafif düzeyde düşüş izlenmiştir.`
      };
    }
    if (pct <= 30) {
      return {
        title,
        emoji: "🟠",
        label: "Orta Düzeyde Etkilenme",
        comment: `${title} altında dikkat performansında belirgin etkilenme gözlenmiştir.`
      };
    }
    return {
      title,
      emoji: "🔴",
      label: "Belirgin Etkilenme",
      comment: `${title} altında performans belirgin şekilde düşmüştür.`
    };
  };

  const items = types.map((t) => analyze(t.title, t.scores));
  const anyAffected = items.some((i) => i.emoji === "🟡" || i.emoji === "🟠" || i.emoji === "🔴");
  const general =
    anyAffected
      ? "Katılımcı bazı çeldirici koşullarda performans kaybı göstermiştir."
      : "Katılımcının çevresel dikkat dağıtıcılara karşı performansı korunmuştur.";

  return { items, general, anyAffected };
}

export function buildSustainabilityReport(logs, profile, age = null, pressTimeline = [], locale = "tr") {
  const sust = computeSustainabilityIndex(logs, profile, age, pressTimeline, locale);
  let comment;
  if (sust.delta == null) {
    comment = "Yeterli faz verisi bulunmamaktadır.";
  } else if (sust.delta >= -5) {
    comment =
      "Test süresince performans büyük ölçüde korunmuştur. Belirgin dikkat yorgunluğu veya performans çöküşü izlenmemiştir.";
  } else if (sust.delta >= -15) {
    comment = "Test sonuna doğru hafif düzeyde performans düşüşü gözlenmiştir.";
  } else {
    comment = "Test sonuna doğru belirgin performans düşüşü izlenmiştir; sürdürülebilir dikkat alanı değerlendirilmelidir.";
  }
  return { ...sust, comment };
}

export function buildIndexClinicalComments(scores) {
  const a = scores.attention;
  const t = scores.timing;
  const i = scores.impulsivity;
  const h = scores.hyperactivity;

  return {
    attention: {
      score: a,
      level: indexLevelLabel(a),
      definition:
        "Dikkat endeksi, hedef uyaranları fark etme ve görev boyunca dikkati sürdürebilme performansını değerlendirir.",
      comment:
        a >= 80
          ? "Katılımcı dikkat sürdürme alanında yaş normlarına uygun performans göstermiştir. Belirgin dikkat kaybı veya görevden kopma örüntüsü gözlenmemiştir."
          : a >= 70
            ? "Dikkat performansı genel olarak yeterli düzeydedir; bazı bölümlerde kısa süreli dikkat dalgalanması izlenebilir."
            : a >= 60
              ? "Dikkat sürdürme alanında orta düzeyde zorlanma gözlenmiştir; ihmal oranı dikkatle değerlendirilmelidir."
              : "Dikkat alanında belirgin güçlük gözlenmiştir; hedef uyaranları kaçırma eğilimi dikkat çekmektedir."
    },
    timing: {
      score: t,
      level: indexLevelLabel(t),
      definition:
        "Zamanlama endeksi, doğru uyaranlara uygun hızda ve tutarlı şekilde tepki verebilme performansını değerlendirir.",
      comment:
        t >= 80
          ? "Tepki zamanlaması genel olarak tutarlı ve yaşa uygun düzeydedir."
          : t >= 70
            ? "Tepki hızında hafif düzeyde değişkenlik gözlenmiştir. Görev boyunca zaman zaman gecikmiş yanıtlar oluşmuştur."
            : t >= 60
              ? "Zamanlama performansında orta düzeyde dalgalanma izlenmiştir; geç veya acele yanıtlar dikkat alanıdır."
              : "Tepki zamanlamasında belirgin zorluk gözlenmiştir; geç yanıt veya aşırı değişkenlik dikkat çekmektedir."
    },
    impulsivity: {
      score: i,
      level: indexLevelLabel(i),
      definition:
        "Dürtüsellik endeksi, hedef dışı uyaranlara gereksiz tepki verme eğilimini (commission errors) değerlendirir.",
      comment:
        i >= 80
          ? "Dürtü kontrolü genel olarak yeterlidir. Hedef dışı uyaranlara verilen tepkiler sınırlı düzeyde kalmıştır."
          : i >= 70
            ? "Dürtü kontrolü kabul edilebilir düzeydedir. Ancak bazı bölümlerde hedef dışı uyaranlara aceleci tepkiler gözlenmiştir."
            : i >= 60
              ? "Hafif dürtüsellik göstergeleri izlenmiştir; commission hataları takip edilmelidir."
              : "Belirgin dürtüsellik örüntüsü gözlenmiştir; hedef dışı uyaranlara sık tepki verilmiştir."
    },
    hyperactivity: {
      score: h,
      level: indexLevelLabel(h),
      definition:
        "Hiperaktivite endeksi, motor tepkiyi durdurabilme ve gereksiz tuş kullanımını kontrol edebilme becerisini değerlendirir.",
      comment:
        h >= 80
          ? "Motor kontrol performansı güçlü bulunmuştur. Mükerrer veya yönerge dışı yanıt örüntüsü gözlenmemiştir."
          : h >= 70
            ? "Motor kontrol genel olarak yeterlidir; ara sıra mükerrer basışlar izlenebilir."
            : h >= 60
              ? "Hafif motor hiperaktivite göstergeleri (mükerrer veya boş ekran basışı) gözlenmiştir."
              : "Motor kontrol alanında belirgin zorluk gözlenmiştir; mükerrer veya yönerge dışı basışlar dikkat çekmektedir."
    }
  };
}

export function buildClinicalFlags(scores, metrics, validity, distractor, sustainability) {
  const flags = [];

  if (validity.isInvalid) {
    flags.push({ level: "red", emoji: "🔴", text: "Test geçersiz — sonuçlar yorumlanmamalıdır" });
    return flags;
  }

  if (scores.impulsivity < 75) {
    flags.push({ level: "yellow", emoji: "🟡", text: "Dürtüsellik eğilimi" });
  }
  if (distractor.anyAffected) {
    flags.push({ level: "yellow", emoji: "🟡", text: "Çeldirici hassasiyeti" });
  }
  if (sustainability.delta != null && sustainability.delta <= -25) {
    flags.push({ level: "orange", emoji: "🟠", text: "Dikkat sürekliliğinde düşüş" });
  }
  if (scores.overall < 55 || scores.attention < 60 || scores.timing < 55) {
    flags.push({ level: "red", emoji: "🔴", text: "Belirgin performans güçlüğü" });
  }

  if (!flags.length) {
    flags.push({ level: "green", emoji: "🟢", text: "Belirgin risk izlenmedi" });
  }
  return flags;
}

export function buildExecutiveSummary(scores, metrics, validity, clinicalFlags, distractor) {
  const risk = getOverallRiskText(scores.overall);

  const strengths = [];
  if (scores.attention >= 80) strengths.push("Dikkat Sürdürme");
  if (scores.timing >= 80) strengths.push("Zamanlama");
  if (scores.impulsivity >= 80) strengths.push("Dürtü Kontrolü");
  if (scores.hyperactivity >= 80) strengths.push("Motor Kontrol");

  const weaknesses = [];
  if (scores.timing < 75) weaknesses.push("Zamanlama");
  if (scores.impulsivity < 75) weaknesses.push("Dürtü Kontrolü");
  if (scores.attention < 75) weaknesses.push("Dikkat");
  if (scores.hyperactivity < 75) weaknesses.push("Motor Kontrol");

  const line1 =
    scores.attention >= 70
      ? "Katılımcının dikkat performansı yaş grubuna göre genel olarak yeterli düzeydedir."
      : "Katılımcının dikkat performansında yaş grubuna göre zorlanma gözlenmiştir.";

  const line2Parts = [];
  if (scores.timing < 75) line2Parts.push("tepki zamanlamasında hafif değişkenlik");
  if (scores.impulsivity < 75) line2Parts.push("dürtü kontrolünde izlenebilir düzeyde zorlanma");
  const line2 =
    line2Parts.length > 0
      ? `Dikkatini görev boyunca sürdürebilmiş olmakla birlikte ${line2Parts.join(" ve ")} gözlenmiştir.`
      : "Hedef uyaranları büyük ölçüde doğru şekilde ayırt edebilmiş ve görev boyunca dikkatini sürdürebilmiştir.";

  const line3 = distractor.anyAffected
    ? "Çeldirici koşullarda performansın kısmen etkilendiği görülmektedir."
    : "Çeldirici koşullarda belirgin performans kaybı izlenmemiştir.";

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

export function buildProfessionalNarrative(scores, metrics, validity, distractor, sustainability) {
  if (validity.isInvalid) {
    return [
      "Bu test oturumu geçerlilik kriterlerini karşılamamaktadır.",
      "Kritik geçersizlik bulguları nedeniyle performans skorları klinik yorum için kullanılmamalıdır.",
      "Gerekirse test tekrar uygulanmalı ve katılımcının göreve katılım koşulları gözden geçirilmelidir."
    ].join("\n\n");
  }

  const paras = [];

  paras.push("Katılımcı değerlendirme boyunca yeterli işbirliği göstermiştir.");

  if (scores.attention >= 75) {
    paras.push(
      "Dikkat sürdürme performansı yaş normları içerisinde değerlendirilmiştir. Hedef uyaranları ayırt etme ve görevi sürdürme becerilerinde belirgin güçlük gözlenmemiştir."
    );
  } else {
    paras.push(
      "Dikkat sürdürme performansında yaş normlarının altında kalma eğilimi gözlenmiştir. İhmal örüntüleri dikkatle değerlendirilmelidir."
    );
  }

  if (scores.timing >= 75) {
    paras.push("Zamanlama performansı kabul edilebilir düzeydedir.");
  } else {
    paras.push(
      "Zamanlama performansında hafif düzeyde değişkenlik izlenmiştir. Bu durum bazı görevlerde tepki hızının dalgalanabileceğini düşündürmektedir."
    );
  }

  if (scores.impulsivity >= 75) {
    paras.push(
      "Dürtüsellik göstergeleri normal sınırlar içerisindedir. Hedef dışı uyaranlara verilen tepkiler sınırlı düzeyde kalmıştır."
    );
  } else {
    paras.push(
      "Dürtüsellik göstergeleri normal sınırlar içerisinde olmakla birlikte zaman zaman aceleci yanıt örüntüleri gözlenmiştir."
    );
  }

  if (scores.hyperactivity >= 75) {
    paras.push("Motor kontrol performansı güçlü bulunmuştur.");
  } else {
    paras.push("Motor kontrol alanında mükerrer veya yönerge dışı basış göstergeleri izlenmiştir.");
  }

  if (distractor.anyAffected) {
    paras.push("Çeldiriciler altında performansın kısmen etkilendiği görülmektedir.");
  } else {
    paras.push("Çeldirici koşullarda performans genel olarak korunmuştur.");
  }

  if (sustainability.delta != null && sustainability.delta <= -15) {
    paras.push(`Test süresince sürdürülebilir dikkat analizi: ${sustainability.label.toLowerCase()}.`);
  }

  paras.push(
    "Test bulguları tek başına tanısal yorum amacıyla kullanılmamalı; klinik görüşme, gözlem ve diğer değerlendirme araçlarıyla birlikte ele alınmalıdır."
  );

  return paras.join("\n\n");
}

export { indexLevelLabel, getAttentionLevelText, getImpulsivityLevelText, riskLabel, formatDurationSeconds };
