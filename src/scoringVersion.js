/**
 * Aktif raporlama / kullanıcıya sunulan skor sürümü.
 * V1–V3 motorları kodda saklanır (karşılaştırma / araştırma); kullanıcıya yalnızca V4 çıkar.
 */
export const ACTIVE_REPORT_SCORING_VERSION = "v4";

export const LEGACY_SCORING_VERSIONS = ["v1", "v2", "v3"];

export function resolveReportScoringVersion(requested) {
  if (requested === "v4" || requested === "v3" || requested === "v2" || requested === "v1") {
    return requested;
  }
  return ACTIVE_REPORT_SCORING_VERSION;
}
