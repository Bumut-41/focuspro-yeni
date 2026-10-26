/**
 * Katılımcı raporu — kronolojik faz kovaları.
 * Çocuk: Temel (0–3) → Görsel (3–6) → İşitsel (6–8) → Kombine (8–11) → Kapanış (11–13)
 * Yetişkin/Ergen: Temel (0–3) → Görsel (3–6) → İşitsel (6–9) → Kombine (9–12) → Kapanış (12–15)
 *
 * Not: Eski "0–1 / 1–2" dakika regex'leri "60–120 sn" içindeki "0–1" ile
 * yanlış eşleşiyordu; kapanış temel kovasına düşüyordu. Sınıflandırma artık
 * bölüm etiketine (temel / sessiz gif / sadece ses / kapanış) dayanır.
 */
import { getReportPdfStrings, localizePhaseSectionName } from "../i18n/reportPdfStrings.js";

function norm(s) {
  return (s || "").toLowerCase();
}

/**
 * @returns {"temel"|"gorsel"|"isitsel"|"kombine"|"kapanis"|"other"}
 */
export function classifyPhaseSection(name) {
  const s = norm(name);
  if (!s) return "other";

  // Önce açık etiketler (dakika aralığından bağımsız)
  if (s.includes("kapanış") || s.includes("kapanis")) return "kapanis";
  if (s.includes("sessiz + sesli") || (s.includes("sesli gif") && s.includes("sessiz"))) return "kombine";
  if (s.includes("sadece ses")) return "isitsel";
  if (s.includes("sessiz gif") && !s.includes("sesli")) return "gorsel";
  if (s.includes("(temel)") || /\btemel\b/.test(s)) return "temel";

  // Dakika aralığı yedekleri (etiket yoksa)
  if (/11\s*[–-]\s*13\s*dk|12\s*[–-]\s*15\s*dk/.test(s)) return "kapanis";
  if (/8\s*[–-]\s*11\s*dk|9\s*[–-]\s*12\s*dk/.test(s)) return "kombine";
  if (/6\s*[–-]\s*8\s*dk|6\s*[–-]\s*9\s*dk/.test(s)) return "isitsel";
  if (/3\s*[–-]\s*6\s*dk/.test(s)) return "gorsel";
  if (/0\s*[–-]\s*3\s*dk/.test(s)) return "temel";

  return "other";
}

export function shortBucketLabel(name) {
  const s = (name || "").replace(/^[^—]+—\s*/, "").trim();
  return s.length > 26 ? `${s.slice(0, 24)}…` : s;
}

function bucketMeta(kind, locale = "tr") {
  const ax = getReportPdfStrings(locale).technical?.axisLabels ?? {};
  const pdf = getReportPdfStrings(locale);
  if (kind === "temel") {
    return {
      id: "temel",
      axisLabel: ax.temel1 ?? "Temel",
      phaseKey: "temel1",
      chartLabel: locale === "en" ? "Baseline" : locale === "it" ? "Baseline" : "Temel bölüm"
    };
  }
  if (kind === "gorsel") {
    return {
      id: "gorsel",
      axisLabel: ax.gorsel ?? "Görsel",
      phaseKey: "gorsel2",
      chartLabel: locale === "en" ? "Visual distractor" : locale === "it" ? "Distrattore visivo" : "Görsel çeldirici"
    };
  }
  if (kind === "isitsel") {
    return {
      id: "isitsel",
      axisLabel: ax.isitsel ?? "İşitsel",
      phaseKey: "isitsel2",
      chartLabel: locale === "en" ? "Auditory distractor" : locale === "it" ? "Distrattore uditivo" : "İşitsel çeldirici"
    };
  }
  if (kind === "kombine") {
    return {
      id: "kombine",
      axisLabel: ax.kombine ?? "Kombine",
      phaseKey: "kombine2",
      chartLabel: locale === "en" ? "Combined distractor" : locale === "it" ? "Distrattore combinato" : "Kombine çeldirici"
    };
  }
  if (kind === "kapanis") {
    return {
      id: "kapanis",
      axisLabel: ax.temel2 ?? "Kapanış",
      phaseKey: "temel2",
      chartLabel: locale === "en" ? "Closing" : locale === "it" ? "Chiusura" : "Kapanış"
    };
  }
  return { id: kind, axisLabel: "", phaseKey: "temel1", chartLabel: pdf.unknownPhase || kind };
}

const KIND_ORDER = ["temel", "gorsel", "isitsel", "kombine", "kapanis"];

/**
 * Kronolojik 5 kova — kapanış her zaman sonda.
 * @returns {Array<{ id: string, label: string, axisLabel: string, phaseKey: string, phaseNames: string[], kind: string }>}
 */
export function buildReportPhaseBuckets(profile, locale = "tr") {
  const phases = profile?.phases ?? [];
  const byKind = {
    temel: [],
    gorsel: [],
    isitsel: [],
    kombine: [],
    kapanis: [],
    other: []
  };

  for (const phase of phases) {
    const kind = classifyPhaseSection(phase.name);
    byKind[kind].push(phase);
  }

  const buckets = [];
  for (const kind of KIND_ORDER) {
    const list = byKind[kind];
    if (!list.length) continue;
    const meta = bucketMeta(kind, locale);
    const firstName = list[0].name;
    const timeHint = firstName.match(/(\d+\s*[–-]\s*\d+\s*dk)/)?.[1];
    buckets.push({
      id: meta.id,
      label: timeHint ? `${meta.chartLabel} (${timeHint})` : meta.chartLabel,
      axisLabel: meta.axisLabel,
      phaseKey: meta.phaseKey,
      phaseNames: list.map((p) => p.name),
      kind,
      displayName: localizePhaseSectionName(firstName, locale)
    });
  }

  return buckets;
}

export function logsForBucket(logs, bucket) {
  const names = new Set(bucket.phaseNames);
  return logs.filter((t) => names.has(t.section));
}

/** Sürdürülebilirlik: açıkça temel vs kapanış (kronolojiye bağlı ilk/son değil). */
export function getBaselineAndClosingBuckets(profile, locale = "tr") {
  const buckets = buildReportPhaseBuckets(profile, locale);
  return {
    baseline: buckets.find((b) => b.kind === "temel") || null,
    closing: buckets.find((b) => b.kind === "kapanis") || null,
    buckets
  };
}
