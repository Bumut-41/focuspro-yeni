/**
 * Geçici QA: yalnızca «sessiz gif» penceresi (3–6 dk).
 * Normal teste dönmek için DISTRACTOR_ONLY_QA = false yapın.
 */
export const DISTRACTOR_ONLY_QA = true;

const MIN = 60_000;

const SILENT_GIF_ONLY = {
  child: { start: 3 * MIN, end: 6 * MIN, label: "3–6 dk (sessiz gif)", stimulus: 1600 },
  adult: { start: 3 * MIN, end: 6 * MIN, label: "3–6 dk (sessiz gif)", stimulus: 1100 },
  teen: { start: 3 * MIN, end: 6 * MIN, label: "3–6 dk (sessiz gif)", stimulus: 1100 }
};

function shiftEvents(events, start, end) {
  return events
    .filter((e) => e.at >= start && e.at < end)
    .map((e) => ({ ...e, at: e.at - start }));
}

export function applyDistractorOnlyQa(profile) {
  const seg = SILENT_GIF_ONLY[profile.key] ?? SILENT_GIF_ONLY.adult;
  const gifEvents = shiftEvents(
    profile.gifEvents.filter((e) => e.silent !== false),
    seg.start,
    seg.end
  );
  const soundEvents = [];

  return {
    ...profile,
    durationMs: seg.end - seg.start,
    phases: [
      {
        end: seg.end - seg.start,
        name: `QA — ${seg.label}`,
        stimulus: seg.stimulus,
        gap: Math.round(seg.stimulus * 0.45)
      }
    ],
    gifEvents,
    soundEvents,
    label: `${profile.label} (QA — sessiz gif)`
  };
}
