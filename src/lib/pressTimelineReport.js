import { formatTestMs } from "./testTime.js";
import { symbolCaption } from "./symbolLabels.js";

export const PRESS_ERROR_LABELS = {
  none: "Doğru basış (hedef)",
  late: "Geç basış (hedef)",
  false_alarm: "Yanlış simge — hedef dışı",
  multi: "Çoklu basış (aynı deneme)",
  idle: "Simge yokken basış"
};

export function pressStatusLabel(p, lateMs) {
  if (!p) return "—";
  if (p.errorType === "idle") return "Boş ekran / simge yokken";
  if (p.errorType === "false_alarm") return "Yanlış simge (1. basış)";
  if (p.errorType === "multi") {
    if (p.isWrongSymbol) return `Yanlış simgede tekrar (${p.pressInTrial ?? "?"}. basış)`;
    return `Çoklu basış (${p.pressInTrial ?? "?"}. basış)`;
  }
  if (p.errorType === "late") return "Geç";
  if (p.errorType === "none" && p.isCorrectHit) {
    if (lateMs != null && p.reactionMs != null && p.reactionMs > lateMs) return "Geç";
    return "İsabet";
  }
  return PRESS_ERROR_LABELS[p.errorType] ?? p.errorType;
}

export function pressStatusColor(p) {
  if (!p) return "#64748b";
  if (p.errorType === "none" && p.isCorrectHit) return "#16a34a";
  if (p.errorType === "late") return "#d97706";
  return "#dc2626";
}

export function summarizePresses(presses) {
  const list = presses ?? [];
  return {
    total: list.length,
    correct: list.filter((p) => p.errorType === "none" && p.isCorrectHit).length,
    late: list.filter((p) => p.errorType === "late").length,
    falseAlarm: list.filter((p) => p.errorType === "false_alarm").length,
    multi: list.filter((p) => p.errorType === "multi").length,
    idle: list.filter((p) => p.errorType === "idle").length,
    repeatInTrial: list.filter((p) => (p.pressInTrial ?? 0) > 1).length
  };
}

export function pressesForTrial(presses, trialNumber) {
  return (presses ?? []).filter((p) => p.trialNumber === trialNumber);
}

/** Profil fazından bölüm temposu (gösterge / boşluk / SOA). */
export function phaseTempoForSection(profile, sectionName) {
  if (!profile?.phases?.length || !sectionName) return null;
  const exact = profile.phases.find((ph) => ph.name === sectionName);
  const ph = exact || profile.phases.find((p) => sectionName.includes(p.name) || p.name.includes(sectionName));
  if (!ph) return null;
  const stimulus = ph.stimulus ?? null;
  const gap = ph.gap ?? (stimulus != null ? Math.round(stimulus * 0.45) : null);
  const soa = stimulus != null && gap != null ? stimulus + gap : null;
  let tempoLabel = "—";
  const n = String(ph.name || "");
  if (/yavaş/i.test(n)) tempoLabel = "yavaş";
  else if (/orta/i.test(n)) tempoLabel = "orta";
  else if (/hızlı/i.test(n)) tempoLabel = "hızlı";
  return {
    name: ph.name,
    stimulus,
    gap,
    soa,
    tempoLabel,
    shortSection: n.replace(/^[^—]+—\s*/, "")
  };
}

export function formatTempoCell(tempo) {
  if (!tempo?.stimulus) return "—";
  const parts = [`gösterge ${tempo.stimulus} ms`];
  if (tempo.soa != null) parts.push(`SOA ${tempo.soa} ms`);
  if (tempo.tempoLabel && tempo.tempoLabel !== "—") parts.push(tempo.tempoLabel);
  return parts.join(" · ");
}

/**
 * Bu basışın V4 skoruna etkisi (hangi endeks / nasıl).
 * Ortalama hız T’de puanlanmaz; geç → T, FA → I, multi/idle → H, isabet → A korur + T RT örneği.
 */
export function pressScoreImpact(p, lateMs) {
  if (!p) return "—";
  if (p.errorType === "idle") return "H − (boş ekran)";
  if (p.errorType === "false_alarm") return "I − (yanlış alarm)";
  if (p.errorType === "multi") {
    if (p.isWrongSymbol) return "H − (yanlışta tekrar)";
    return "H − (çoklu basış)";
  }
  if (p.errorType === "late") return "T − (geç yanıt)";
  if (p.errorType === "none" && p.isCorrectHit) {
    if (lateMs != null && p.reactionMs != null && p.reactionMs > lateMs) return "T − (geç yanıt)";
    return "A ok · T RT örneği";
  }
  return "—";
}

export function enrichPressList(presses, profile = null) {
  return (presses ?? []).map((p, i) => {
    const tempo = phaseTempoForSection(profile, p.section);
    return {
      ...p,
      pressIndex: p.pressIndex ?? i + 1,
      tempo,
      scoreImpact: pressScoreImpact(p, profile?.lateResponseMs)
    };
  });
}

/** PDF / tablo satırı — detaylı (tempo + puan etkisi). */
export function pressToDetailedTableRow(p, lateMs) {
  const sym = p.onScreen ?? (p.shownShape ? { shape: p.shownShape, color: p.shownColor } : null);
  const tempo = p.tempo || null;
  return [
    String(p.pressIndex ?? "—"),
    formatTestMs(p.atMs),
    p.trialNumber != null ? String(p.trialNumber) : "—",
    tempo?.shortSection || (p.section ? String(p.section).replace(/^[^—]+—\s*/, "") : "—"),
    formatTempoCell(tempo),
    sym ? symbolCaption(sym.shape, sym.color) : "Boş ekran",
    p.isTargetOnScreen ? "Evet" : "Hayır",
    p.pressInTrial != null ? String(p.pressInTrial) : "—",
    p.reactionMs != null ? String(Math.round(p.reactionMs)) : "—",
    pressStatusLabel(p, lateMs),
    p.scoreImpact || pressScoreImpact(p, lateMs)
  ];
}

/** PDF / tablo satırı (eski kısa biçim — uyumluluk). */
export function pressToTableRow(p, { includeTrialOnset = false, trialOnsetMs = null } = {}) {
  const sym = p.onScreen ?? (p.shownShape ? { shape: p.shownShape, color: p.shownColor } : null);
  const row = [
    String(p.pressIndex ?? "—"),
    formatTestMs(p.atMs),
    p.trialNumber != null ? String(p.trialNumber) : "—",
    sym ? symbolCaption(sym.shape, sym.color) : "Boş ekran",
    p.isTargetOnScreen ? "Evet" : "Hayır",
    p.isWrongSymbol ? "Evet" : "Hayır",
    p.pressInTrial != null ? String(p.pressInTrial) : "—",
    p.reactionMs != null ? String(Math.round(p.reactionMs)) : "—",
    pressStatusLabel(p)
  ];
  if (includeTrialOnset && trialOnsetMs != null) {
    row.splice(3, 0, formatTestMs(trialOnsetMs));
  }
  return row;
}
