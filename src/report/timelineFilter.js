/** Basış zaman çizelgesini deneme bölümlerine göre filtreler. */
export function timelineForLogs(pressTimeline, logs) {
  const sections = new Set((logs ?? []).map((t) => t.section).filter(Boolean));
  if (!sections.size) return [];
  return (pressTimeline ?? []).filter((p) => p.section && sections.has(p.section));
}
