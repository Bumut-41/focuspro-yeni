/** Paylaşılan skor eşikleri — rapor bölümleri arasında tutarlılık. */
export const TIERS = {
  veryGood: 90,
  good: 80,
  average: 70,
  low: 60
};

/** Çeldirici etkisi — puan düşüşü bantları (friendly + teknik tablo). */
export const DISTRACTOR_DROP = {
  none: 3,
  mild: 12,
  moderate: 22
};

export const CLINICAL_THRESHOLDS = {
  strength: 80,
  weakness: 75,
  impulseFlag: 75,
  impulseMarked: 60,
  sustainabilityOrange: -15,
  validityAttentionDrop: -25,
  poorOverall: 55,
  poorAttention: 60,
  poorTiming: 55,
  poorImpulsivity: 55,
  poorHyperactivity: 55
};

export function scoreTier(score) {
  if (score >= TIERS.good) return "high";
  if (score >= TIERS.average) return "mid";
  if (score >= TIERS.low) return "low";
  return "poor";
}

export function distractorImpactLevel(drop) {
  if (drop <= DISTRACTOR_DROP.none) return "green";
  if (drop <= DISTRACTOR_DROP.mild) return "yellow";
  if (drop <= DISTRACTOR_DROP.moderate) return "orange";
  return "red";
}

export function distractorEffectBand(drop, locale, getBands) {
  const B = getBands(locale);
  const pts = Math.round(Math.abs(drop));
  if (Math.abs(drop) <= DISTRACTOR_DROP.none) return { text: `${B.none} (0 ${B.points})`, color: "#64748b" };
  if (drop < -DISTRACTOR_DROP.none) return { text: `${B.improve} (+${pts} ${B.points})`, color: "#16a34a" };
  if (drop <= DISTRACTOR_DROP.mild) return { text: `${B.mild} (−${pts} ${B.points})`, color: "#64748b" };
  if (drop <= DISTRACTOR_DROP.moderate) return { text: `${B.moderate} (−${pts} ${B.points})`, color: "#f59e0b" };
  return { text: `${B.marked} (−${pts} ${B.points})`, color: "#dc2626" };
}
