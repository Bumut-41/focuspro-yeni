/**
 * Faz yorumları — genel puana değil A/T/I/H ve başlangıç (temel) farkına göre.
 * "Performans korunmuştur" yalnızca tüm alt endeksler güçlü ve bazdan anlamlı düşüş yoksa.
 */
import { fillTemplate, getReportPdfStrings } from "../i18n/reportPdfStrings.js";
import { DISTRACTOR_DROP, distractorImpactLevel } from "./scoreTiers.js";

/** Mutlak eşikler: bu altında "korunmuş" denmez. */
export const PHASE_ABS = {
  attention: 75,
  timing: 70,
  impulsivity: 70,
  hyperactivity: 70
};

/** Baza göre düşüş (puan) — anlamlı kabul. */
export const PHASE_DROP_SOFT = DISTRACTOR_DROP.none; // 3
export const PHASE_DROP_MARKED = DISTRACTOR_DROP.mild; // 12

const INDEX_KEYS = [
  ["attention", "A"],
  ["timing", "T"],
  ["impulsivity", "I"],
  ["hyperactivity", "H"]
];

function num(v) {
  return v == null || Number.isNaN(Number(v)) ? null : Number(v);
}

export function listWeakIndices(scores) {
  const weak = [];
  for (const [key, label] of INDEX_KEYS) {
    const v = num(scores?.[key]);
    if (v != null && v < PHASE_ABS[key]) weak.push({ key, label, score: Math.round(v) });
  }
  return weak;
}

export function listDroppedIndices(baseline, current) {
  const dropped = [];
  if (!baseline || !current) return dropped;
  for (const [key, label] of INDEX_KEYS) {
    const b = num(baseline[key]);
    const c = num(current[key]);
    if (b == null || c == null) continue;
    const drop = b - c;
    if (drop > PHASE_DROP_SOFT) {
      dropped.push({ key, label, drop: Math.round(drop), from: Math.round(b), to: Math.round(c) });
    }
  }
  return dropped;
}

export function maxIndexDrop(baseline, current) {
  let max = 0;
  if (!baseline || !current) return 0;
  for (const [key] of INDEX_KEYS) {
    const b = num(baseline[key]);
    const c = num(current[key]);
    if (b == null || c == null) continue;
    max = Math.max(max, b - c);
  }
  const bo = num(baseline.overall);
  const co = num(current.overall);
  if (bo != null && co != null) max = Math.max(max, bo - co);
  return max;
}

/**
 * @param {string} sectionName
 * @param {object|number} scores A/T/I/H (+ overall)
 * @param {string} locale
 * @param {{ baseline?: object|null, kind?: string }} [ctx]
 */
export function buildPhaseComment(sectionName, scores, locale = "tr", ctx = {}) {
  const P = getReportPdfStrings(locale).technical.phaseComments;
  const sc =
    typeof scores === "number"
      ? { overall: scores, attention: scores, timing: scores, impulsivity: scores, hyperactivity: scores }
      : scores || {};

  const weak = listWeakIndices(sc);
  const baseline = ctx.baseline || null;
  const kind = ctx.kind || null;
  const isBaseline = kind === "temel" || /temel|baseline/i.test(sectionName || "");
  const dropped = !isBaseline ? listDroppedIndices(baseline, sc) : [];
  const maxDrop = !isBaseline ? maxIndexDrop(baseline, sc) : 0;

  // Zayıf alt endeks varken asla "korunmuştur"
  if (weak.length) {
    const labels = weak.map((w) => `${w.label}=${w.score}`).join(", ");
    if (dropped.length) {
      const dlab = dropped.map((d) => `${d.label} ${d.from}→${d.to}`).join("; ");
      return fillTemplate(P.weakWithDrop || P.weak, { indices: labels, drops: dlab, section: sectionName });
    }
    return fillTemplate(P.weak || P.default, { indices: labels, section: sectionName });
  }

  if (dropped.length) {
    const dlab = dropped.map((d) => `${d.label} ${d.from}→${d.to}`).join("; ");
    if (maxDrop > PHASE_DROP_MARKED) {
      return fillTemplate(P.markedDrop || P.default, { drops: dlab, section: sectionName });
    }
    return fillTemplate(P.mildDrop || P.average, { drops: dlab, section: sectionName });
  }

  // Tür bazlı (zayıf/düşüş yoksa nötr korunma)
  const s = (sectionName || "").toLowerCase();
  if (kind === "kombine" || s.includes("sessiz + sesli") || s.includes("sesli gif")) {
    return P.combinedOk || P.good;
  }
  if (kind === "gorsel" || s.includes("sessiz gif")) return P.visualOk || P.good;
  if (kind === "isitsel" || s.includes("sadece ses")) return P.auditoryOk || P.good;
  if (kind === "kapanis" || /11–|12–|13–|14–|15–|11-|12-|13-|14-|15-/.test(s)) {
    return P.closingOk || P.good;
  }

  return P.good;
}

/**
 * Eski etiket mantığı (rapor gövdesi): zayıf endeks mild bandını orta’ya yükseltebilir.
 * Örn. maxDrop=5 + zayıf I → orange (“Orta”).
 */
export function distractorLevelFromScoresLegacy(baseline, distScores) {
  if (!baseline || !distScores) return { level: "gray", maxDrop: 0, weak: [] };
  const weak = listWeakIndices(distScores);
  const maxDrop = maxIndexDrop(baseline, distScores);
  if (maxDrop <= PHASE_DROP_SOFT && !weak.length) {
    return { level: "green", maxDrop, weak };
  }
  if (maxDrop <= DISTRACTOR_DROP.mild && weak.every((w) => w.score >= 60)) {
    return { level: "yellow", maxDrop, weak };
  }
  if (maxDrop <= DISTRACTOR_DROP.moderate) {
    return { level: "orange", maxDrop, weak };
  }
  return { level: "red", maxDrop, weak };
}

/**
 * Eşik-yalnız etiket (alternatif / denetim): yalnız maxDrop → DISTRACTOR_DROP.
 * Örn. maxDrop=5 → yellow (hafif); zayıf endeks yükseltmez.
 */
export function distractorLevelFromScoresThresholdOnly(baseline, distScores) {
  if (!baseline || !distScores) return { level: "gray", maxDrop: 0, weak: [] };
  const weak = listWeakIndices(distScores);
  const maxDrop = maxIndexDrop(baseline, distScores);
  return { level: distractorImpactLevel(maxDrop), maxDrop, weak };
}

/** Rapor gövdesi varsayılanı: eski mantık (geriye uyum). */
export function distractorLevelFromScores(baseline, distScores) {
  return distractorLevelFromScoresLegacy(baseline, distScores);
}
