import { formatTestMs } from "./testTime.js";
import { colorLabel, shapeLabel, symbolCaption } from "./symbolLabels.js";

export const PRESS_ERROR_LABELS = {
  none: "Doğru basış (hedef)",
  late: "Geç basış (hedef)",
  false_alarm: "Yanlış simge — hedef dışı",
  multi: "Çoklu basış (aynı deneme)",
  idle: "Simge yokken basış"
};

export function pressStatusLabel(p, lateMs) {
  if (!p) return "—";
  if (p.errorType === "idle") return "Simge yokken";
  if (p.errorType === "false_alarm") return "Yanlış simge";
  if (p.errorType === "multi") return `Çoklu basış (${p.pressInTrial ?? "?"}. basış)`;
  if (p.errorType === "late") return "Geç";
  if (p.errorType === "none" && p.isCorrectHit) return "İsabet";
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
    idle: list.filter((p) => p.errorType === "idle").length
  };
}

export function pressesForTrial(presses, trialNumber) {
  return (presses ?? []).filter((p) => p.trialNumber === trialNumber);
}

/** PDF / tablo satırı */
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

export function enrichPressList(presses) {
  return (presses ?? []).map((p, i) => ({
    ...p,
    pressIndex: p.pressIndex ?? i + 1
  }));
}
